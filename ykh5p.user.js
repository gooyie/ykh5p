// ==UserScript==
// @name         ykh5p
// @namespace    https://github.com/gooyie/ykh5p
// @homepageURL  https://github.com/gooyie/ykh5p
// @supportURL   https://github.com/gooyie/ykh5p/issues
// @updateURL    https://raw.githubusercontent.com/gooyie/ykh5p/master/ykh5p.user.js
// @version      0.8.2
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

        static _isModuleCall(args) { // module.exports, module, module.exports, require
            return args.length === 4 && args[1] instanceof Object && args[1].hasOwnProperty('exports');
        }

        static hookModuleCall(cb = ()=>{}) {
            this.hookCall((...args) => {if (this._isModuleCall(args)) cb(...args);});
        }

        static _isUpsModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('getServieceUrl') &&
                   /\.id\s*=\s*"ups"/.test(exports.default.toString());
        }

        static hookUps(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isUpsModuleCall(args[1].exports)) cb(args[1].exports);});
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

        static _isLogoModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('reset') &&
                   /logo\.style\.display/.test(exports.default.prototype.reset.toString());
        }

        static hookLogo(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isLogoModuleCall(args[1].exports)) cb(args[1].exports);});
        }

        static _isSettingModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('setQuality');
        }

        static hookSetting(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isSettingModuleCall(args[1].exports)) cb(args[1].exports);});
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

        static _isPlayerModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('_resetPlayer');
        }

        static hookPlayer(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isPlayerModuleCall(args[1].exports)) cb(args[1].exports);});
        }

        static hookInitPlayerEvent(cb = ()=>{}) {
            Hooker.hookPlayer((exports) => {
                const _initPlayerEvent = exports.default.prototype._initPlayerEvent;
                exports.default.prototype._initPlayerEvent = function() {
                    cb(this);
                    _initPlayerEvent.apply(this);
                };
            });
        }

        static hookResetPlayerAfter(cb = ()=>{}) {
            Hooker.hookPlayer((exports) => {
                const _resetPlayer = exports.default.prototype._resetPlayer;
                exports.default.prototype._resetPlayer = function() {
                    try {
                        _resetPlayer.apply(this);
                    } catch (err) { // 忽略 ykSDK.destroyAd 异常
                        if (!err.stack.includes('destroyAd')) throw err;
                    }
                    cb(this);
                };
            });
        }

        static _isKeyShortcutsModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('registerEvents');
        }

        static hookKeyShortcuts(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isKeyShortcutsModuleCall(args[1].exports)) cb(args[1].exports);});
        }

        static _isTipsModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('showHintTips');
        }

        static hookTips(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isTipsModuleCall(args[1].exports)) cb(args[1].exports);});
        }

        static _isAdServiceModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('requestAdData');
        }

        static hookAdService(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isAdServiceModuleCall(args[1].exports)) cb(args[1].exports);});
        }

        static _isTopAreaModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('_timerHandler');
        }

        static hookTopArea(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isTopAreaModuleCall(args[1].exports)) cb(args[1].exports);});
        }

        static hookTopAreaAddEvent(cb = ()=>{}) {
            Hooker.hookTopArea((exports) => {
                const _addEvent = exports.default.prototype._addEvent;
                exports.default.prototype._addEvent = function() {
                    cb(this);
                    _addEvent.apply(this);
                };
            });
        }

        static _isPreviewLayerModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('setPreviewShow');
        }

        static hookPreviewLayer(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isPreviewLayerModuleCall(args[1].exports)) cb(args[1].exports);});
        }

        static hookPreviewLayerBind(cb = ()=>{}) {
            Hooker.hookPreviewLayer((exports) => {
                const bind = exports.default.prototype.bind;
                exports.default.prototype.bind = function() {
                    cb(this);
                    bind.apply(this);
                };
            });
        }

        static _isSettingSeriesComponentModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('_addEvent') &&
                   exports.default.prototype._addEvent.toString().includes('seriesliseLayer');
        }

        static hookSettingSeries(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isSettingSeriesComponentModuleCall(args[1].exports)) cb(args[1].exports);});
        }

        static _isGlobalModuleCall(exports = {}) {
            return this._isEsModule(exports) && this._isFuction(exports.default) &&
                   exports.default.prototype && exports.default.prototype.hasOwnProperty('resetConfig');
        }

        static hookGlobal(cb = ()=>{}) {
            this.hookModuleCall((...args) => {if (this._isGlobalModuleCall(args[1].exports)) cb(args[1].exports);});
        }

        static hookGlobalConstructorAfter(cb = ()=>{}) {
            Hooker.hookGlobal((exports) => {
                debugger;
                const constructor = exports.default;
                exports.default = function(...args) {
                    constructor.apply(this, args);
                    cb(this);
                };
                exports.default.prototype = constructor.prototype;
            });
        }

        static hookGlobalInit(cb = ()=>{}) {
            Hooker.hookGlobal((exports) => {
                const init = exports.default.prototype.init;
                exports.default.prototype.init = function(config) {
                    cb(config, this);
                    init.apply(this, [config]);
                };
            });
        }

        static hookGlobalDeal(cb = ()=>{}) {
            Hooker.hookGlobal((exports) => {
                const deal = exports.default.prototype.deal;
                exports.default.prototype.deal = function() {
                    cb(this);
                    deal.apply(this);
                };
            });
        }

        static hookGlobalResetAfter(cb = ()=>{}) {
            Hooker.hookGlobal((exports) => {
                const reset = exports.default.prototype.reset;
                exports.default.prototype.reset = function() {
                    reset.apply(this);
                    cb(this);
                };
            });
        }

        static _extractArgsName(code) {
            return code.slice(code.indexOf('(') + 1, code.indexOf(')')).split(/\s*,\s*/);
        }

        static _extractFunctionBody(code) {
            return code.slice(code.indexOf('{') + 1, code.lastIndexOf('}'));
        }

        static _isBaseModuleCall(exports = {}) {
            return exports.SingleVideoControl && exports.MultiVideoControl;
        }


        static hookBase(cb = ()=>{}, mode) {
            if (!this._hookBaseCallbacks) {
                this._hookBaseCallbacks = [];
                this._hookBaseCodeCallbacks = [];
                (mode === 'code' ? this._hookBaseCodeCallbacks : this._hookBaseCallbacks).push(cb);

                this.hookModuleCall((...args) => {
                    if (this._isBaseModuleCall(args[1].exports)) {
                        if (this._hookBaseCodeCallbacks.length > 0) {
                            let code = args[3].m[args[1].i].toString();
                            code = this._hookBaseCodeCallbacks.reduce((c, cb) => cb(c), code);
                            const fn = new Function(...this._extractArgsName(code), this._extractFunctionBody(code));
                            fn.apply(args[0], args.slice(1));
                        }
                        this._hookBaseCallbacks.forEach(cb => cb(args[1].exports));
                    }
                });
            } else {
                (mode === 'code' ? this._hookBaseCodeCallbacks : this._hookBaseCallbacks).push(cb);
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
                    setTimeout(() => {
                        this.fail(arg, {code: '404', message: 'error'});
                    }, 0);
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
            Hooker.hookPreviewLayerBind((that) => {
                that._el.addEventListener('mouseover', () => that.emit('mouseoverpreview'));
                that._el.addEventListener('mouseleave', () => that.emit('mouseleavepreview'));
            });
        }

        _findVarName(code) {
            return /"dashboard"\s*,\s*(\w+)/.exec(code)[1];
        }

        _exposeDashboard() {
            Hooker.hookBase((code) => {
                let varName = this._findVarName(code);
                return code.replace(/\.exports\s*=\s*(\w+)/, `$&;$1.__Dashboard=${varName};`);
            }, 'code');
        }

        _patch() {
            Hooker.hookBase((exports) => {
                const proto = exports.__Dashboard.prototype;

                proto.bindAutoHide = function() {
                    this._el.addEventListener('mouseover', () => this._mouseover = true);
                    this._el.addEventListener('mouseleave', () => this._mouseover = false);
                    this.on('mouseoverpreview', () => this._mouseoverpreview = true);
                    this.on('mouseleavepreview', () => this._mouseoverpreview = false);
                    this._video.on('play', () => {
                        if (!this._mouseover && !this._mouseoverpreview)
                            this._hideTimeout = setTimeout(this.hide.bind(this), this._args.autoHide);
                    });
                    this._video.on('pause', () => {
                        this._hideTimeout && clearTimeout(this._hideTimeout);
                        this.isShow() || this.show();
                    });
                    this._parent.addEventListener('mousemove', () => {
                        this._hideTimeout && clearTimeout(this._hideTimeout);
                        this.isShow() || this.show();
                        if (!this._isPaused() && !this._mouseover && !this._mouseoverpreview)
                            this._hideTimeout = setTimeout(this.hide.bind(this), this._args.autoHide);
                    });
                    this._parent.addEventListener('mouseleave', () => {
                        this._hideTimeout && clearTimeout(this._hideTimeout);
                        if (!this._isPaused()) this.hide();
                    });
                };

                proto._isPaused = function() {
                    return this._video._videoCore.video.paused;
                };

                proto.isShow = function() {
                    return this._el.style.display !== 'none';
                };

                const show = proto.show;
                proto.show = function() {
                    this.emit('dashboardshow');
                    this._parent.style.cursor = '';
                    show.apply(this);
                };

                const hide = proto.hide;
                proto.hide = function() {
                    this.emit('dashboardhide');
                    this._parent.style.cursor = 'none'; // 隐藏鼠标
                    hide.apply(this);
                };
            });
        }

    }

    class TopAreaPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            Hooker.hookTopAreaAddEvent((that) => {
                that.on('webfullscreen', (isWebFullscreen) => {
                    isWebFullscreen ? that._showHideTop(true) : that._hideHideTop();
                });
                that.on('dashboardshow', () => {
                    const playerState = that._video.global.playerState;
                    if (playerState.fullscreen || playerState.webfullscreen) {
                        that._showHideTop(true);
                    }
                });
                that.on('dashboardhide', () => {
                    const playerState = that._video.global.playerState;
                    if (playerState.fullscreen || playerState.webfullscreen) {
                        that._hideHideTop();
                    }
                });
            });
            Hooker.hookResetPlayerAfter((that) => { // 网页全屏播放上下集重置播放器后显示顶部控件
                if (!that.global.playerState.fullscreen)
                    that._player.control.emit('webfullscreen', that.global.playerState.webfullscreen);
            });
        }

    }

    class SettingSeriesPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            Hooker.hookSettingSeries((exports) => { // 网页全屏显示选集
                const _addEvent = exports.default.prototype._addEvent;
                exports.default.prototype._addEvent = function() {
                    _addEvent.apply(this);
                    this.on('webfullscreen', (isWebFullscreen) => {
                        if (isWebFullscreen) {
                            if (this.seriesList.length > 1)
                                this._el.style.display = 'inline-block';
                        } else {
                            this._el.style.display = 'none';
                            this._el.classList.remove('cliced');
                            this.emit('seriesliseLayer', false);
                        }
                    });
                };
            });
        }
    }

    class AntiAdPatch extends Patch {

        constructor() {
            super();
        }

        _apply() {
            Hooker.hookGlobalConstructorAfter(that => that.cycleData.isFront = true);
            Hooker.hookGlobalResetAfter(that => that.cycleData.isFront = true);
        }

    }

    class WebFullscreen {

        constructor(elem) {
            this._elem = elem;
        }

        isWebFullscreen() {
            return this._elem.classList.contains('webfullscreen');
        }

        enter() {
            this._elem.classList.add('webfullscreen');
            document.body.style.overflow = 'hidden';

            let parentNode = this._elem.parentNode;
            while (parentNode.nodeName !== 'BODY') {
                if (parentNode.nodeType === Node.ELEMENT_NODE) {
                    parentNode.classList.add('z-top');
                }
                parentNode = parentNode.parentNode;
            }
        }

        exit() {
            this._elem.classList.remove('webfullscreen');
            document.body.style.overflow = '';

            let parentNode = this._elem.parentNode;
            while (parentNode.nodeName !== 'BODY') {
                if (parentNode.nodeType === Node.ELEMENT_NODE) {
                    parentNode.classList.remove('z-top');
                }
                parentNode = parentNode.parentNode;
            }
        }

        toggle() {
            this.isWebFullscreen() ? this.exit() : this.enter();
        }

        static addStyle() {
            GM_addStyle(`
                .z-top {
                    position: relative !important;
                    z-index: 23333333 !important;
                }
                .webfullscreen {
                    display: block !important;
                    position: fixed !important;
                    width: 100% !important;
                    height: 100% !important;
                    top: 0 !important;
                    left: 0 !important;
                    background: #000 !important;
                    z-index: 23333333 !important;
                }
            `);
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
            this._customTip();
            this._disablePlayAfterSeek();
            this._addPlayerEvent();
            this._addPrevInfo();
            this._playAfterPlayerReset();
        }

        _customTip() {
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
        }

        _disablePlayAfterSeek() { // SingleVideoControl seek 后不自动播放
            Hooker.hookBase((exports) => {
                const _setCurrentTime = exports.SingleVideoControl.prototype._setCurrentTime;
                exports.SingleVideoControl.prototype._setCurrentTime = function(time) {
                    const play = this.video.play;
                    this.video.play = () => {};
                    _setCurrentTime.apply(this, [time]);
                    this.video.play = play;
                };
            });
        }

        _addPlayerEvent() {
            Hooker.hookInitPlayerEvent((that) => { // 视频播放结束处理
                that._player.control.on('ended', that._onEnd.bind(that));
            });
        }

        _addPrevInfo() {
            Hooker.hookGlobalDeal((that) => {
                if (that.ups && that.ups.videoData && that.ups.programList && that.ups.programList.videoList) {
                    const list = that.ups.programList.videoList;
                    const currVid = that.ups.videoData.id;
                    const prevSeq = list.find(item => parseInt(item.vid) === currVid).seq - 1;
                    if (prevSeq > 0) {
                        const prevVideo = list.find(item => parseInt(item.seq) === prevSeq);
                        that.ups.programList.prevVideo = prevVideo;
                        that._config.prevVid = prevVideo.encodevid;
                    }
                }
            });
        }

        _playAfterPlayerReset() {
            Hooker.hookResetPlayerAfter((that) => {
                if (that.global.playerState.state === 'playerreset') that.play();
            });
        }

        _hookPlayer() {
            Hooker.hookPlayer(this._hookPlayerCallback.bind(this));
        }

        _hookPlayerCallback(exports) {
            const proto = exports.default.prototype;

            const _init = proto._init;
            proto._init = function() {
                _init.apply(this);
                WebFullscreen.addStyle();
                this._webfullscreen = new WebFullscreen(this.container);
            };

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

            proto.isFullscreen = function() {
                return this.global.playerState.fullscreen;
            };

            proto.toggleFullscreen = function() {
                if (this.isFullscreen()) {
                    this.exitFullscreen();
                } else {
                    this.fullScreen();
                }
            };

            proto.isWebFullscreen = function() {
                return this._webfullscreen.isWebFullscreen();
            };

            proto.enterWebFullscreen = function() {
                this._webfullscreen.enter();
                this.global.playerState = {webfullscreen: true};
                this._player.control.emit('webfullscreen', true);
            };

            proto.exitWebFullscreen = function() {
                this._webfullscreen.exit();
                this.global.playerState = {webfullscreen: false};
                this._player.control.emit('webfullscreen', false);
            };

            proto.toggleWebFullscreen = function() {
                this.isWebFullscreen() ? this.exitWebFullscreen() : this.enterWebFullscreen();
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
                const prevVid = this.global.config.prevVid;
                if (prevVid) {
                    if (this.isFullscreen() || this.isWebFullscreen()) {
                        this.playByVid({vid: prevVid});
                    } else {
                        this.gotoVideo(prevVid);
                    }
                    this._showTip('播放上一集');
                } else {
                    this._showTip('没有上一集哦');
                }
            };

            const playNext = proto.playNext;
            proto.playNext = function(data) {
                if (data) playNext.apply(this, [data]);
                const nextVid = this.global.config.nextVid;
                if (nextVid) {
                    if (this.isFullscreen() || this.isWebFullscreen()) {
                        this.playByVid({vid: nextVid});
                    } else {
                        this.gotoVideo(nextVid);
                    }
                    this._showTip('播放下一集');
                } else {
                    this._showTip('没有下一集哦');
                }
            };

            proto.gotoVideo = function(vid) {
                location.href = `//v.youku.com/v_show/id_${vid}.html`;
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
                    if (['paused', 'player.init'].includes(state)) {
                        this._player.play();
                    } else if (state === 'ended') {
                        this._player.replay();
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
                    this._player.toggleFullscreen();
                } else if (event.ctrlKey && !event.shiftKey && !event.altKey) {
                    this._player.toggleWebFullscreen();
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
            Hooker.hookInitPlayerEvent((that) => {
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
                        if (['paused', 'player.init'].includes(state)) {
                            that.play();
                        } else if (state === 'ended') {
                            that.replay();
                        } else {
                            that.pause();
                        }
                        timer = null;
                    }, 200);
                });
                container.addEventListener('dblclick', (event) => {
                    if (event.target !== container) return;
                    event.ctrlKey ? that.toggleWebFullscreen() : that.toggleFullscreen();
                });
                container.addEventListener('wheel', (event) => {
                    if (event.target === container && (that.isFullscreen() || that.isWebFullscreen())) {
                        const delta = event.wheelDelta || event.detail || (event.deltaY && -event.deltaY);
                        that.adjustVolume(delta > 0 ? 0.05 : -0.05);
                    }
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

    function recoverPlayer() {
        sessionStorage.removeItem('P_l_h5');
        Logger.log('恢复原播放器');
    }

    function blockAds() {
        (new AdBlockPatch()).install();
        (new AntiAdPatch()).install();
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
        (new TopAreaPatch()).install();
        (new SettingSeriesPatch()).install();
        Logger.log('改善控件与光标自动隐藏');
    }

    function improveShortcuts() {
        (new ShortcutsPatch()).install();
    }

//=============================================================================

    enableH5Player();
    window.addEventListener('unload', () => recoverPlayer()); // 禁用脚本刷新页面可恢复播放器
    blockAds();
    invalidateWatermarks();
    invalidateQualityLimitation();
    improveQualitySetting();
    improveQualityFallback();
    improveAutoHide();
    improveShortcuts();

})();
