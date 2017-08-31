// ==UserScript==
// @name         ykh5p
// @namespace    https://github.com/gooyie/ykh5p
// @homepageURL  https://github.com/gooyie/ykh5p
// @supportURL   https://github.com/gooyie/ykh5p/issues
// @updateURL    https://raw.githubusercontent.com/gooyie/ykh5p/master/ykh5p.user.js
// @version      0.7.1
// @description  改善优酷官方html5播放器播放体验
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

        static hookCall(cb = ()=>{}) {
            const call = Function.prototype.call;
            Function.prototype.call = function(...args) {
                let ret = call.apply(this, args);
                try {
                    if (args) cb(...args);
                } catch (err) {
                    Logger.error(err.stack);
                }
                return ret;
            };

            Function.prototype.call.toString = Function.prototype.call.toLocaleString = function() {
                return 'function call() { [native code] }';
            };
        }

        static _isEsModule(obj) {
            return obj && obj.__esModule;
        }

        static _isFuction(arg) {
            return 'function' === typeof arg;
        }

        static _isFactoryCall(args) { // module.exports, module, module.exports, require
            return args.length === 4 && args[1] instanceof Object && args[1].hasOwnProperty('exports');
        }

        static hookFactoryCall(cb = ()=>{}) {
            this.hookCall((...args) => {if (this._isFactoryCall(args)) cb(...args);});
        }

        static _isUpsFactoryCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('getServieceUrl') &&
                   /\.id\s*=\s*"ups"/.test(exports.default.toString());
        }

        static hookUps(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isUpsFactoryCall(args[1].exports)) cb(args[1].exports);});
        }

        static hookUpsOnComplete(cb = ()=>{}) {
            this.hookUps((exports) => {
                const onComplete = exports.default.prototype.onComplete;
                exports.default.prototype.onComplete = function(res) {
                    cb(res);
                    onComplete.apply(this, [res]);
                };
            });
        }

        static _isLogoFactoryCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('reset') &&
                   /logo\.style\.display/.test(exports.default.prototype.reset.toString());
        }

        static hookLogo(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isLogoFactoryCall(args[1].exports)) cb(args[1].exports);});
        }

        static _isSettingFactoryCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('setQuality');
        }

        static hookSetting(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isSettingFactoryCall(args[1].exports)) cb(args[1].exports);});
        }

        static hookRenderQulaity(cb = ()=>{}) {
            Hooker.hookSetting((exports) => {
                const renderQulaity = exports.default.prototype.renderQulaity;
                exports.default.prototype.renderQulaity = function(qualitys) {
                    cb(qualitys, this);
                    renderQulaity.apply(this, [qualitys]);
                };
            });
        }

        static hookSetCurrentQuality(cb = ()=>{}) {
            Hooker.hookSetting((exports) => {
                const setCurrentQuality = exports.default.prototype.setCurrentQuality;
                exports.default.prototype.setCurrentQuality = function() {
                    cb(this);
                    setCurrentQuality.apply(this);
                };
            });
        }

        static _isPlayerFactoryCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('_resetPlayer');
        }

        static hookPlayer(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isPlayerFactoryCall(args[1].exports)) cb(args[1].exports);});
        }

        static hookPlayerInitServiceEvent(cb = ()=>{}) {
            Hooker.hookPlayer((exports) => {
                const _initServiceEvent = exports.default.prototype._initServiceEvent;
                exports.default.prototype._initServiceEvent = function() {
                    cb(this);
                    _initServiceEvent.apply(this);
                };
            });
        }

        static _isKeyShortcutsFactoryCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('registerEvents');
        }

        static hookKeyShortcuts(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isKeyShortcutsFactoryCall(args[1].exports)) cb(args[1].exports);});
        }

        static _isTipsFactoryCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('showHintTips');
        }

        static hookTips(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isTipsFactoryCall(args[1].exports)) cb(args[1].exports);});
        }

        static _isAdServiceFactoryCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('requestAdData');
        }

        static hookAdService(cb = ()=>{}) {
            this.hookFactoryCall((...args) => {if (this._isAdServiceFactoryCall(args[1].exports)) cb(args[1].exports);});
        }

        static _extractArgsName(code) {
            return code.slice(code.indexOf('(') + 1, code.indexOf(')')).split(/\s*,\s*/);
        }

        static _extractFunctionBody(code) {
            return code.slice(code.indexOf('{') + 1, code.lastIndexOf('}'));
        }

        static _isGlobalFactoryCall(exports = {}) {
            return exports.SingleVideoControl && exports.MultiVideoControl;
        }

        static hookGlobal(cb = ()=>{}, mode) {
            if (!this._hookGlobalCallbacks) {
                this._hookGlobalCallbacks = [];
                this._hookGlobalCodeCallbacks = [];
                (mode === 'code' ? this._hookGlobalCodeCallbacks : this._hookGlobalCallbacks).push(cb);

                this.hookFactoryCall((...args) => {
                    if (this._isGlobalFactoryCall(args[1].exports)) {
                        if (this._hookGlobalCodeCallbacks.length > 0) {
                            let code = args[3].m[args[1].i].toString();
                            code = this._hookGlobalCodeCallbacks.reduce((c, cb) => cb(c), code);
                            const fn = new Function(...this._extractArgsName(code), this._extractFunctionBody(code));
                            fn.apply(args[0], args.slice(1));
                        }
                        this._hookGlobalCallbacks.forEach(cb => cb(args[1].exports));
                    }
                });
            } else {
                (mode === 'code' ? this._hookGlobalCodeCallbacks : this._hookGlobalCallbacks).push(cb);
            }
        }

        static hookOz(cb = ()=>{}) {
            if (!this._hookOzCallbacks) {
                const self = this;
                this._hookOzCallbacks = [cb];
                const window = unsafeWindow;
                let oz = window.oz; // oz 可能先于脚本执行

                Reflect.defineProperty(window, 'oz', {
                    get: () => {
                        return oz;
                    },
                    set: (value) => {
                        oz = value;
                        try {
                            self._hookOzCallbacks.forEach(cb => cb(oz));
                        } catch (err) {
                            Logger.error(err.stack);
                        }
                    }
                });

                if (oz) window.oz = oz; // oz 先于脚本执行
            } else {
                this._hookOzCallbacks.push(cb);
            }
        }

        static hookDefine(name, cb = ()=>{}) {
            if (!this._hookDefineCallbacksMap) {
                this._hookDefineCallbacksMap = new Map([[name, [cb]]]);
                this.hookOz((oz) => {
                    const self = this;
                    const define = oz.define;
                    oz.define = function(name, deps, block) {
                        if (self._hookDefineCallbacksMap.has(name)) {
                            let code = block.toString();
                            code = self._hookDefineCallbacksMap.get(name).reduce((c, cb) => cb(c), code);
                            block = new Function(...self._extractArgsName(code), self._extractFunctionBody(code));
                        }
                        define(name, deps, block);
                    };
                });
            } else {
                if (this._hookDefineCallbacksMap.has(name)) {
                    this._hookDefineCallbacksMap.get(name).push(cb);
                } else {
                    this._hookDefineCallbacksMap.set(name, [cb]);
                }
            }
        }

    }

    class Patch {

        constructor() {
            this._installed = false;
        }

        install() {
            if (!this._installed) {
                this._installed = true;
                this._apply();
            }
        }

        _apply() {}

    }

    class AdBlockPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            Hooker.hookAdService((exports) => {
                exports.default.prototype.requestAdData = function(arg) {
                    this.fail(arg, {code: '404', message: 'error'});
                };
            });
        }

    }

    class WatermarksPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            Hooker.hookLogo((exports) => {
                exports.default.prototype.reset = () => {};
            });
        }

    }

    class VipPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            Hooker.hookUpsOnComplete((res) => {
                const data = res.data;
                if (data.user) {
                    data.user.vip = true;
                } else {
                    data.user = {vip: true};
                }
            });
        }

    }

    class QualitySettingPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            this._patchPreferQuality();
            this._patchCurrentQuality();
            this._addStyle();
        }

        _patchPreferQuality() {
            Hooker.hookSetting((exports) => {
                let html = exports.default.prototype.render();
                let autoRe = /<div\s+data-val="auto"[^<>]*>自动<\/div>/;
                let sdRe = /<div\s+data-val="320p"[^<>]*>标清<\/div>/;
                let autoDiv = autoRe.exec(html)[0];
                let fhdDiv = autoDiv.replace('auto', '1080p').replace('自动', '1080p');
                html = html.replace(autoRe, fhdDiv).replace(sdRe, `$&${autoDiv}`);
                exports.default.prototype.render = () => html;
            });
        }

        _patchCurrentQuality() {
            Hooker.hookSetting((exports) => {
                const _findRecentAvaliableQuality = exports.default.prototype._findRecentAvaliableQuality;
                exports.default.prototype._findRecentAvaliableQuality = function(code, qualitys) {
                    qualitys.reverse();
                    return _findRecentAvaliableQuality.apply(this, [code, qualitys]);
                };
            });

            Hooker.hookRenderQulaity((qualitys) => {
                qualitys.reverse();
                let idx = qualitys.findIndex(i => i.code === '1080p');
                if (idx !== -1) qualitys[idx].name = '1080p';
            });
        }

        _addStyle() {
            GM_addStyle(`
                .personalise-layer {
                    width: 315px !important;
                }
                .setting-bar.setting-confirm {
                    justify-content: center !important;
                }
            `);
        }
    }

    class QualityFallbackPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            Hooker.hookRenderQulaity((qualitys, that) => that.data.quality = that.data.preferQuality); // 由优先画质决定当前画质
            Hooker.hookSetCurrentQuality(that => that._video.global.config.quality = that.data.quality); // 更新config当前画质
        }

    }

    class DashboardPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            this._prepare();
            this._patch();
        }

        _prepare() {
            this._exposeDashboard();
        }

        _findVarName(code) {
            return /"dashboard"\s*,\s*(\w+)/.exec(code)[1];
        }

        _exposeDashboard() {
            Hooker.hookGlobal((code) => {
                let varName = this._findVarName(code);
                return code.replace(/\.exports\s*=\s*(\w+)/, `$&;$1.__Dashboard=${varName};`);
            }, 'code');
        }

        _patch() {
            Hooker.hookGlobal((exports) => {
                exports.__Dashboard.prototype.bindAutoHide = function() {
                    this._video.on('play', () => {
                        this._hideTimeout = setTimeout(this.hide.bind(this), this._args.autoHide);
                    });
                    this._video.on('pause', () => {
                        this._hideTimeout && clearTimeout(this._hideTimeout);
                        this.show();
                    });
                    this._parent.addEventListener('mousemove', () => {
                        this._hideTimeout && clearTimeout(this._hideTimeout);
                        this.show();
                        if (!this._isPaused())
                            this._hideTimeout = setTimeout(this.hide.bind(this), this._args.autoHide);
                    });
                    this._parent.addEventListener('mouseout', () => {
                        if (!this._isPaused()) this.hide();
                    });
                };
                exports.__Dashboard.prototype._isPaused = function() {
                    return this._video._videoCore.video.paused;
                };
                const show = exports.__Dashboard.prototype.show;
                exports.__Dashboard.prototype.show = function() {
                    this._parent.style.cursor = '';
                    show.apply(this);
                };
                const hide = exports.__Dashboard.prototype.hide;
                exports.__Dashboard.prototype.hide = function() {
                    this._parent.style.cursor = 'none'; // 隐藏鼠标
                    hide.apply(this);
                };
            });
        }

    }

    class PlayerPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            this._prepare();
            this._hookPlayer();
        }

        _prepare() {
            Hooker.hookTips((exports) => {
                const showHintTips = exports.default.prototype.showHintTips;
                exports.default.prototype.showHintTips = function(code, info) {
                    if (info.msg) {
                        this._hintLayer.setHintShow(info.msg);
                    } else {
                        showHintTips.apply(this, [code, info]);
                    }
                };
            });
            Hooker.hookGlobal((exports) => { // 单video seek 后不自动播放
                const _setCurrentTime = exports.SingleVideoControl.prototype._setCurrentTime;
                exports.SingleVideoControl.prototype._setCurrentTime = function(time) {
                    const play = this.video.play;
                    this.video.play = () => {};
                    _setCurrentTime.apply(this, [time]);
                    this.video.play = play;
                };
            });
        }

        _hookPlayer() {
            Hooker.hookPlayer(this._hookPlayerCallback.bind(this));
        }

        _hookPlayerCallback(exports) {
            const proto = exports.default.prototype;

            proto._showTip = function(msg) {
                this._emitter.emit('player.showinfo', {type: 'hint', msg});
            };

            proto.play = function() {
                this._player && this._player.control.play();
                this._showTip('播放');
            };

            proto._pause = proto.pause;
            proto.pause = function() {
                this._pause();
                this._showTip('暂停');
            };

            proto.adjustVolume = function(value) {
                this._player && this._player.control.setVolume(this.global.playerState.volume + value);
            };

            proto.toggleMute = function() {
                if (this.global.playerState.muted) this._showTip('取消静音');
                this.setMuted(!this.global.playerState.muted);
            };

            proto.stepSeek = function(stepTime) {
                const duration = this._player.control.getDuration();
                const currentTime = this.global.currentTime;
                const seekTime = Math.max(0, Math.min(duration, currentTime + stepTime));
                this.seek(seekTime);

                let msg;
                if (Math.abs(stepTime) < 60) {
                    msg = stepTime > 0 ? `步进：${stepTime}秒` : `步退：${Math.abs(stepTime)}秒`;
                } else {
                    msg = stepTime > 0 ? `步进：${stepTime/60}分钟` : `步退：${Math.abs(stepTime)/60}分钟`;
                }
                this._showTip(msg);
            };

            proto.rangeSeek = function(range) {
                const duration = this._player.control.getDuration();
                const seekTime = Math.max(0, Math.min(duration, duration * range));
                this.seek(seekTime);
                this._showTip('定位：' + (range * 100).toFixed(0) + '%');
            };

            proto.isFullScreen = function() {
                return this.global.playerState.fullscreen;
            };

            proto.toggleFullScreen = function() {
                if (this.isFullScreen()) {
                    this.exitFullscreen();
                } else {
                    this.fullScreen();
                }
            };

            proto.adjustPlaybackRate = function(value) {
                const videoCore = this._player.control._videoCore;
                const rate = Math.max(0.2, Math.min(5, videoCore.video.playbackRate + value));
                if (this._player.config.controlType === 'multi') {
                    videoCore._videoElments.forEach(v => v.playbackRate = rate);
                } else {
                    videoCore.video.playbackRate = rate;
                }
                this._showTip(`播放速率：${rate.toFixed(1).replace(/\.0+$/, '')}`);
            };

            proto.resetPlaybackRate = function() {
                this._player.control.setRate(1);
                this._showTip('恢复播放速率');
            };


            proto.getFps = function() {
                return 25; // 标清fps为15，标清以上fps为25。
            };

            proto.prevFrame = function() {
                const state = this.global.playerState.state;
                if (state === 'playing') this.pause();
                const duration = this._player.control.getDuration();
                const currentTime = this.global.currentTime;
                const seekTime = Math.max(0, Math.min(duration, currentTime - 1 / this.getFps()));
                this.seek(seekTime);
                this._showTip('上一帧');
            };

            proto.nextFrame = function() {
                const state = this.global.playerState.state;
                if (state === 'playing') this.pause();
                const duration = this._player.control.getDuration();
                const currentTime = this.global.currentTime;
                const seekTime = Math.max(0, Math.min(duration, currentTime + 1 / this.getFps()));
                this.seek(seekTime);
                this._showTip('下一帧');
            };

            proto.playPrev = function() {
                // TODO:
            };

            proto.playNext = function() {
                // TODO:
            };
        }

    }

    const playerPatch = new PlayerPatch();

    class KeyShortcutsPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            this._prepare();
            this._addListener();
        }

        _prepare() {
            playerPatch.install();
            this._obtainPlayer();
        }

        _obtainPlayer() {
            const self = this;
            Hooker.hookKeyShortcuts(exports => {
                exports.default.prototype.registerEvents = function() {
                    self._player = this._player;
                };
            });
        }

        _addListener() {
            document.addEventListener('keydown', this._handler.bind(this));
        }

        _handler(event) {
            if (event.target.nodeName !== 'BODY') return;

            switch (event.keyCode) {
            case 32: // Spacebar
                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                    const state = this._player.global.playerState.state;
                    if (state === 'paused' || state === 'ended' || state === 'player.init') {
                        this._player.play();
                    } else {
                        this._player.pause();
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
                this._player.stepSeek(stepTime);
                break;
            }
            case 38: // ↑ Arrow Up
            case 40: // ↓ Arrow Down
                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                    this._player.adjustVolume(38 === event.keyCode ? 0.05 : -0.05);
                } else {
                    return;
                }
                break;
            case 77: // M
                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                    this._player.toggleMute();
                } else {
                    return;
                }
                break;
            case 13: // Enter
                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                    this._player.toggleFullScreen();
                } else {
                    return;
                }
                break;
            case 67: // C
            case 88: // X
                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                    this._player.adjustPlaybackRate(67 === event.keyCode ? 0.1 : -0.1);
                } else {
                    return;
                }
                break;
            case 90: // Z
                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                    this._player.resetPlaybackRate();
                } else {
                    return;
                }
                break;
            case 68: // D
            case 70: // F
                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                    if (event.keyCode === 68) {
                        this._player.prevFrame();
                    } else {
                        this._player.nextFrame();
                    }
                } else {
                    return;
                }
                break;
            case 80: // P
            case 78: // N
                if (!event.ctrlKey && event.shiftKey && !event.altKey) {
                    if (event.keyCode === 78) {
                        this._player.playNext();
                    } else {
                        this._player.playPrev();
                    }
                } else {
                    return;
                }
                break;
            default:
                if (event.keyCode >= 48 && event.keyCode <= 57) { // 0 ~ 9
                    if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                        this._player.rangeSeek((event.keyCode - 48) * 0.1);
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            }

            event.preventDefault();
            event.stopPropagation();
        }

    }

    class MouseShortcutsPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            this._prepare();
            this._addListener();
        }

        _prepare() {
            playerPatch.install();
            this._addStyle();
        }

        _addStyle() {
            GM_addStyle(`
                .h5-layer-conatiner {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                }
                .h5-ext-layer-adsdk {
                    display: none !important;
                }
            `);
        }

        _addListener() {
            Hooker.hookPlayerInitServiceEvent((that) => {
                let timer;
                const container = that.container.querySelector('.h5-layer-conatiner');
                container.addEventListener('click', (event) => {
                    if (event.target !== container) return;
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                        return;
                    }
                    timer = setTimeout(() => {
                        const state = that.global.playerState.state;
                        if (state === 'paused' || state === 'ended' || state === 'player.init') {
                            that.play();
                        } else {
                            that.pause();
                        }
                        timer = null;
                    }, 200);
                });
                container.addEventListener('dblclick', (event) => {
                    if (event.target !== container) return;
                    that.toggleFullScreen();
                });
                container.addEventListener('wheel', (event) => {
                    if (event.target !== container || !that.isFullScreen()) return;
                    const delta = event.wheelDelta || event.detail || (event.deltaY && -event.deltaY);
                    that.adjustVolume(delta > 0 ? 0.05 : -0.05);
                });
            });
        }

    }

    class ShortcutsPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            (new KeyShortcutsPatch()).install();
            Logger.log('添加键盘快捷键');
            (new MouseShortcutsPatch()).install();
            Logger.log('添加鼠标快捷键');
        }

    }

    class H5Patch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            Hooker.hookDefine('page/find/play/player/load', this._forceH5.bind(this));
        }

        _forceH5(code) {
            return code.replace(/(if\s*\().*?(\)\s*\{)/, '$1true$2');
        }

    }

    function enableH5Player() {
        (new H5Patch()).install();
        Logger.log('启用html5播放器');
    }

    function blockAds() {
        (new AdBlockPatch()).install();
        Logger.log('和谐广告');
    }

    function invalidateWatermarks() {
        (new WatermarksPatch()).install();
        Logger.log('和谐水印');
    }

    function invalidateQualityLimitation() {
        (new VipPatch()).install();
        Logger.log('解除会员画质限制');
    }

    function improveQualitySetting() {
        (new QualitySettingPatch()).install();
        Logger.log('设置里优先画质增加1080P选项并与当前画质对齐');
    }

    function improveQualityFallback() {
        (new QualityFallbackPatch()).install();
        Logger.log('改善当前画质逻辑');
    }

    function improveAutoHide() {
        (new DashboardPatch()).install();
        Logger.log('改善控件与光标自动隐藏');
    }

    function improveShortcuts() {
        (new ShortcutsPatch()).install();
    }

//=============================================================================

    enableH5Player();
    blockAds();
    invalidateWatermarks();
    invalidateQualityLimitation();
    improveQualitySetting();
    improveQualityFallback();
    improveAutoHide();
    improveShortcuts();

})();
