// ==UserScript==
// @name         ykh5p
// @namespace    https://github.com/gooyie/ykh5p
// @homepageURL  https://github.com/gooyie/ykh5p
// @supportURL   https://github.com/gooyie/ykh5p/issues
// @updateURL    https://raw.githubusercontent.com/gooyie/ykh5p/master/ykh5p.user.js
// @version      0.5.1
// @description  youku html5 player +
// @author       gooyie
// @license      MIT License
//
// @include      *://v.youku.com/*
// @grant        GM_info
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    /* eslint-disable no-console */
    class Logger {

        static get tag() {
            return `[${GM_info.script.name}]`;
        }

        static log(...args) {
            console.log('%c' + this.tag + '%c' + args.shift(),
                'color: #fff; background: #2FB3FF', '', ...args);
        }

        static info(...args) {
            console.info(this.tag + args.shift(), ...args);
        }

        static debug(...args) {
            console.debug(this.tag + args.shift(), ...args);
        }

        static warn(...args) {
            console.warn(this.tag + args.shift(), ...args);
        }

        static error(...args) {
            console.error(this.tag + args.shift(), ...args);
        }

    }
    /* eslint-enable no-console */

    class Hooker {

        static hookCall(after = ()=>{}, before = ()=>{}) {
            const call = Function.prototype.call;
            Function.prototype.call = function(...args) {
                try {
                    if (args) before(...args);
                } catch (err) {
                    Logger.error(err.stack);
                }

                let ret = call.apply(this, args);

                try {
                    if (args) after(...args);
                } catch (err) {
                    Logger.error(err.stack);
                }

                return ret;
            };

            Function.prototype.call.toString = Function.prototype.call.toLocaleString = function() {
                return 'function call() { [native code] }';
            };
        }

        static _isFactoryCall(args) { // m.exports, _dereq_, m, m.exports, outer, modules, cache, entry
            return args.length === 8 && args[2] instanceof Object && args[2].hasOwnProperty('exports');
        }

        static hookFactoryCall(cb = ()=>{}) {
            this.hookCall((...args) => {if (this._isFactoryCall(args)) cb(...args);});
        }

        static _isManagerFactoryCall(exports = {}) {
            return 'function' === typeof exports && exports.prototype.hasOwnProperty('upsDataSuccess');
        }

        static hookManager(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isManagerFactoryCall(args[2].exports)) cb(args[2].exports);});
        }

        static hookUpsDataSuccess(cb = ()=>{}) {
            this.hookManager((exports) => {
                const upsDataSuccess = exports.prototype.upsDataSuccess;
                exports.prototype.upsDataSuccess = function(data) {
                    cb(data);
                    upsDataSuccess.apply(this, [data]);
                };
            });
        }

        static hookWatcher(cb = ()=>{}) {
            this.hookManager((exports) => {
                const watcher = exports.prototype.watcher;
                exports.prototype.watcher = function() {
                    watcher.apply(this);
                    cb(this);
                };
            });
        }

        static _isSkinsViewRenderCall(args) {
            return args.length === 3 && args[1] === 'spvdiv' && args[2].className === 'spv_player';
        }

        static hookSkinsViewRender(cb = ()=>{}) {
            this.hookCall(undefined, (...args) => {if (this._isSkinsViewRenderCall(args)) cb(args[2]);});
        }

        static _isUtilFactoryCall(exports = {}) {
            return exports.hasOwnProperty('getJsonp') && exports.TAG === 'util';
        }

        static hookUtil(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isUtilFactoryCall(args[2].exports)) cb(args[2].exports);});
        }

        static hookGetJsonp(cb = ()=>{}) {
            this.hookUtil((exports) => {
                const getJsonp = exports.getJsonp.bind(exports);
                exports.getJsonp = function(...args) { // url, onload, onerror, ontimeout, timeout
                    if (cb(args)) return; // hijack
                    getJsonp(...args);
                };
            });
        }

        static _isH5PlayerCoreFactoryCall(exports = {}) {
            return exports instanceof Object && exports.hasOwnProperty('YoukuH5PlayerCore');
        }

        static hookH5PlayerCore(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isH5PlayerCoreFactoryCall(args[2].exports)) cb(args[2].exports);});
        }

        static hookRealStartPlay(cb = ()=>{}) {
            this.hookH5PlayerCore((exports) => {
                const _realStartPlay = exports.YoukuH5PlayerCore.prototype._realStartPlay;
                exports.YoukuH5PlayerCore.prototype._realStartPlay = function(...args) {
                    cb(this, args);
                    _realStartPlay.apply(this, args);
                };
            });
        }

        static _isSkinsControlFactoryCall(exports = {}) {
            return 'function' === typeof exports && exports.prototype.hasOwnProperty('shadowClick');
        }

        static hookSkinsControl(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isSkinsControlFactoryCall(args[2].exports)) cb(args[2].exports);});
        }

        static hookSkinsControlDomEvent(cb = ()=>{}) {
            this.hookSkinsControl((exports) => {
                const domEvent = exports.prototype.domEvent;
                exports.prototype.domEvent = function() {
                    cb(this);
                    domEvent.apply(this);
                };
            });
        }

        static hookWindowAddEventListener(cb = ()=>{}) {
            const window = unsafeWindow;
            const addEventListener = window.addEventListener.bind(window);
            window.addEventListener = function(...args) {
                if (cb(args)) return; // rejection
                addEventListener(...args);
            };
        }

    }

    class Mocker {

        static mockVip() {
            Hooker.hookUpsDataSuccess((data) => {
                if (data.user) {
                    data.user.vip = true;
                } else {
                    data.user = {vip: true};
                }
                Logger.log('解除会员画质限制');
            });
        }

        static mockExclusiveShow() {
            Hooker.hookSkinsControl((exports) => {
                exports.prototype.exclusiveShow = () => {};
                Logger.log('和谐水印');
            });
        }

    }

    class Blocker {

        static _isAdReq(url) {
            return /atm\.youku\.com/.test(url);
        }

        static blockAd() {
            Hooker.hookGetJsonp((args) => {
                let [url, /* onload */, onerror] = args;
                if (this._isAdReq(url)) {
                    setTimeout(onerror, 0); // async invoke
                    Logger.log('blocked ad request', url);
                    return true;
                }
            });
        }

    }

    class Patcher {

        static patchQualitySetting() {
            Hooker.hookSkinsViewRender((elem) => {
                let autoRe = /<spvdiv\s+customer="auto"[^<>]*>自动<\/spvdiv>/;
                let mp4Re = /<spvdiv\s+customer="mp4"[^<>]*>标清<\/spvdiv>/;
                let autoDiv = autoRe.exec(elem.innerHTML)[0];
                let hd3Div = autoDiv.replace('auto', 'mp4hd3').replace('自动', '1080P');
                elem.innerHTML = elem.innerHTML.replace(autoRe, hd3Div).replace(mp4Re, `$&${autoDiv}`);
                Logger.log('设置里优先画质增加1080P选项并对齐到当前画质');
            });

            GM_addStyle(`
                spvdiv.spv_setting_1080, spvdiv.spv_setting_panel {
                    width: 300px !important;
                }
            `);
        }

        static patchQualityFallback() {
            Hooker.hookH5PlayerCore((exports) => {
                const SHOWHD = new Map([
                    ['flvhd', '标清'],
                    ['3gphd', '标清'],
                    ['mp4hd', '高清'],
                    ['mp4hd2', '超清'],
                    ['mp4hd3', '1080p'],
                ]);

                exports.YoukuH5PlayerCore.prototype._initControlInfo = function() {
                    if (!this._videoInfo.langcodes) return;

                    const control = this.control;
                    if (!control.lang || !this._videoInfo.langcodes.includes(control.lang)) {
                        control.lang = this._videoInfo.langcodes[0];
                    }

                    const hdcodes = this._videoInfo.hdList[control.lang].hdcodes;
                    if (!hdcodes.includes(control.hd)) { // 如果设置的优先画质在当前播放的视频里没有
                        let hd = control.hd;
                        control.hd = hdcodes[hdcodes.length - 1]; // 向下选择最高画质（原逻辑是给最渣画质！）
                        Logger.log(`优先画质（${SHOWHD.get(hd)}）在当前播放的视频里没有，向下选择最高画质（${SHOWHD.get(control.hd)}）。`);
                    }

                    control.autoplay = control.autoplay || false;
                    control.fullscreen = control.fullscreen || false;
                };
            });
        }

        static patchVolumeMemory() {
            Hooker.hookRealStartPlay((that) => {
                if (this._enabled) return;
                this._enabled = true;

                if (0 === parseFloat(localStorage.getItem('spv_volume'))) {
                    that.UIControl.__proto__.mute.apply(that.UIControl);
                } else {
                    that.UIControl.__proto__.nomute.apply(that.UIControl);
                }

                that.EventManager.on('VolumeChange', (data) => {
                    localStorage.setItem('spv_volume', data.value);
                });

                Logger.log('开启音量记忆');
            });
        }

        static _isFullScreen() {
            return !!(document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen ||
                document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
        }

        static patchFullScreen() {
            const self = this;
            Hooker.hookManager((exports) => {
                exports.prototype.toggleFull = function(arg) {
                    this.method = arg.method || 'c';
                    if (self._isFullScreen()) {
                        this.containerExitScreen();
                        Logger.log('退出全屏');
                    } else {
                        this.containerFullScreen();
                        Logger.log('进入全屏');
                    }
                };
            });
        }

        static _patchManager() {
            Hooker.hookManager((exports) => {
                exports.prototype.getPreviousVid = function() {
                    if (this.data.videos && this.data.videos.list) {
                        let list = this.data.videos.list;
                        let currVid = this.data.video.id;
                        let prevSeq = list.find(item => parseInt(item.vid) === currVid).seq - 1;
                        if (prevSeq > 0) {
                            let previous = list.find(item => parseInt(item.seq) === prevSeq);
                            return previous.encodevid;
                        }
                    }
                };

                exports.prototype.getVideoFPS = function() {
                    return 25; // 优酷m3u8为动态帧率，flv标清fps为15，标清以上fps为25。
                };
            });
        }

        static _patchWatcher() {
            this._patchManager();

            Hooker.hookWatcher((that) => {
                that.EventManager.on('_Seek', (seekTime) => {
                    let videoCurrentInfo = {
                        currentTime: seekTime,
                        buffered: that.bufferedEnd()
                    };

                    that.UIControl.setProgress(videoCurrentInfo, that.duration);
                    that.UIControl.setTime(seekTime, that);

                    that.seek(seekTime);
                    // if (that.myVideo.paused) that.play(); // seek后自动播放
                });

                that.EventManager.on('_StepSeek', (stepTime) => {
                    let seekTime = Math.max(0, Math.min(that.duration, that.mediaElement.currentTime + stepTime));
                    let msg;

                    if (Math.abs(stepTime) < 60) {
                        msg = stepTime > 0 ? `步进：${stepTime}秒` : `步退：${Math.abs(stepTime)}秒`;
                    } else {
                        msg = stepTime > 0 ? `步进：${stepTime/60}分钟` : `步退：${Math.abs(stepTime)/60}分钟`;
                    }
                    that.UIControl.tipShow(msg);

                    that.EventManager.fire('_Seek', seekTime);
                });

                that.EventManager.on('_RangeSeek', (range) => {
                    that.UIControl.tipShow('定位：' + (range * 100).toFixed(0) + '%');
                    let seekTime = Math.max(0, Math.min(that.duration, that.duration * range));
                    that.EventManager.fire('_Seek', seekTime);
                });

                that.EventManager.on('_PreviousFrame', () => {
                    that.UIControl.tipShow('定位：上一帧');
                    let seekTime = Math.max(0, Math.min(that.duration, that.mediaElement.currentTime - 1 / that.getVideoFPS()));
                    that.seek(seekTime);
                });

                that.EventManager.on('_NextFrame', () => {
                    that.UIControl.tipShow('定位：下一帧');
                    let seekTime = Math.max(0, Math.min(that.duration, that.mediaElement.currentTime + 1 / that.getVideoFPS()));
                    that.seek(seekTime);
                });

                that.EventManager.off('VolumeChange');
                that.EventManager.on('VolumeChange', (param) => {
                    if (0 === parseFloat(param.value)) {
                        that.UIControl.tipShow('静音');
                    } else {
                        that.UIControl.tipShow(`音量：${(100 * param.value).toFixed(0)}%`);
                    }
                    that.changeMuted(param.value);
                });

                that.EventManager.on('_AdjustVolume', (value) => {
                    let volume = that.mediaElement.volume + value;
                    volume = Math.max(0, Math.min(1, volume.toFixed(2)));
                    that.mediaElement.volume = volume;

                    that.UIControl.volumeProgress(volume);
                    that.UIControl.volumeChange();
                });

                that.EventManager.on('_ToggleMute', () => {
                    if (that.mediaElement.muted) {
                        that.UIControl.nomute();
                        that.UIControl.tipShow('取消静音');
                    } else {
                        that.UIControl.mute();
                        that.UIControl.tipShow('静音');
                    }
                });

                that.EventManager.on('_AdjustPlaybackRate', (value) => {
                    let playbackRate = Math.max(0.2, Math.min(5, that.mediaElement.playbackRate + value));
                    that.mediaElement.playbackRate = playbackRate;
                    that.UIControl.tipShow(`播放速率：${playbackRate.toFixed(1).replace(/\.0+$/, '')}`);
                });

                that.EventManager.on('_ResetPlaybackRate', () => {
                    that.UIControl.tipShow('恢复播放速率');
                    that.mediaElement.playbackRate = 1;
                });

                that.EventManager.on('_PlayPrevious', () => {
                    let vid = that.getPreviousVid();
                    if (vid) {
                        that.EventManager.fire('ChangeVid', {vid});
                        that.UIControl.tipShow('播放上一集');
                    } else {
                        that.UIControl.tipShow('没有上一集哦');
                    }
                });

                that.EventManager.on('_PlayNext', () => {
                    let vid = that.getNextVid();
                    if (vid) {
                        that.EventManager.fire('ChangeVid', {vid});
                        that.UIControl.tipShow('播放下一集');
                    } else {
                        that.UIControl.tipShow('没有下一集哦');
                    }
                });
            });
        }
        // 让之后的tip覆盖之前的，不然之前的未消失会使之后的被忽略。
        static _patchTipShow() {
            Hooker.hookSkinsControl((exports) => {
                exports.prototype.tipShow = function(msg) {
                    if (this.timerTip) {
                        clearTimeout(this.timerTip);
                        this.timerTip = null;
                    }

                    this.tip.innerHTML = msg;
                    if (!this.tipStatus()) this.tipBox.style.display = 'block';
                    this.tipHide();
                };
            });
        }
        // 原控件持续显示时间为5秒，有点长，改成3秒吧。
        static _patchControlHide() {
            Hooker.hookSkinsControl((exports) => {
                exports.prototype.controlHide = function(isAd) {
                    if (isAd) {
                        this.setCtrlDom(false);
                        return;
                    }
                    if (this.pause || this.timer) return;

                    this.timer = setTimeout(() => this.setCtrlDom(false), 3e3);
                };
            });
        }

        static _patchVolumeRange() {
            Hooker.hookSkinsControlDomEvent(that => that.volumeRange.step = 0.01);
        }

        static patchShortcuts() {
            this._patchWatcher();
            this._patchTipShow();
            this._patchVolumeRange();
            this._patchControlHide();
            // 原键盘快捷键在搜索框等仍有效，废了它。
            Hooker.hookWindowAddEventListener(([type]) => {
                if (type !== 'keydown') return;

                let stack = (new Error()).stack;
                if (stack.includes('domEvent')) {
                    Logger.log('废除原键盘快捷键');
                    return true;
                }
            });

            Hooker.hookSkinsControlDomEvent((that) => {
                document.addEventListener('keydown', (event) => {
                    if (event.target.nodeName !== 'BODY') return;

                    switch (event.keyCode) {
                    case 32: // Spacebar
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            if (that.pause) {
                                that.EventManager.fire('VideoPlay');
                            } else {
                                that.EventManager.fire('VideoPause');
                            }
                        } else {
                            return;
                        }
                        break;
                    case 39:    // → Arrow Right
                    case 37: {  // ← Arrow Left
                        let stepTime;
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            stepTime = 39 === event.keyCode ? 5 : -5;
                        } else if (event.ctrlKey && !event.shiftKey && !event.altKey) {
                            stepTime = 39 === event.keyCode ? 30 : -30;
                        } else if (!event.ctrlKey && event.shiftKey && !event.altKey) {
                            stepTime = 39 === event.keyCode ? 60 : -60;
                        } else if (event.ctrlKey && !event.shiftKey && event.altKey) {
                            stepTime = 39 === event.keyCode ? 3e2 : -3e2; // 5分钟
                        } else {
                            return;
                        }

                        that.EventManager.fire('_StepSeek', stepTime);
                        break;
                    }
                    case 38: // ↑ Arrow Up
                    case 40: // ↓ Arrow Down
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            that.EventManager.fire('_AdjustVolume', 38 === event.keyCode ? 0.05 : -0.05);
                        } else {
                            return;
                        }
                        break;
                    case 77: // M
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            that.EventManager.fire('_ToggleMute');
                        } else {
                            return;
                        }
                        break;
                    case 13: // Enter
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            that.EventManager.fire('SwitchFullScreen');
                        } else {
                            return;
                        }
                        break;
                    case 67: // C
                    case 88: // X
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            that.EventManager.fire('_AdjustPlaybackRate', 67 === event.keyCode ? 0.1 : -0.1);
                        } else {
                            return;
                        }
                        break;
                    case 90: // Z
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            that.EventManager.fire('_ResetPlaybackRate');
                        } else {
                            return;
                        }
                        break;
                    case 68: // D
                    case 70: // F
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            if (!that.pause) that.EventManager.fire('VideoPause');
                            if (event.keyCode === 68) {
                                that.EventManager.fire('_PreviousFrame');
                            } else {
                                that.EventManager.fire('_NextFrame');
                            }
                        } else {
                            return;
                        }
                        break;
                    case 80: // P
                    case 78: // N
                        if (!event.ctrlKey && event.shiftKey && !event.altKey) {
                            if (event.keyCode === 78) {
                                that.EventManager.fire('_PlayNext');
                            } else {
                                that.EventManager.fire('_PlayPrevious');
                            }
                        } else {
                            return;
                        }
                        break;
                    default:
                        if (event.keyCode >= 48 && event.keyCode <= 57) { // 0 ~ 9
                            if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                                that.EventManager.fire('_RangeSeek', (event.keyCode - 48) * 0.1);
                            } else {
                                return;
                            }
                        } else {
                            return;
                        }
                    }

                    event.preventDefault();
                    event.stopPropagation();
                });
                Logger.log('添加键盘快捷键');
            });
        }

    }

    function enableH5Player() {
        sessionStorage.setItem('P_l_h5', 1);
        Logger.log('启用html5播放器');
    }

    function recoverPlayer() {
        sessionStorage.removeItem('P_l_h5');
        Logger.log('恢复原播放器');
    }

//=============================================================================

    enableH5Player();
    window.addEventListener('unload', () => recoverPlayer()); // 禁用脚本刷新页面可恢复播放器

    Blocker.blockAd();
    Mocker.mockVip();
    Mocker.mockExclusiveShow();
    Patcher.patchQualitySetting();
    Patcher.patchQualityFallback();
    Patcher.patchVolumeMemory();
    Patcher.patchFullScreen();
    Patcher.patchShortcuts();

})();
