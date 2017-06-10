// ==UserScript==
// @name         ykh5p
// @namespace    https://github.com/gooyie/ykh5p
// @homepageURL  https://github.com/gooyie/ykh5p
// @supportURL   https://github.com/gooyie/ykh5p/issues
// @updateURL    https://raw.githubusercontent.com/gooyie/ykh5p/master/ykh5p.user.js
// @version      0.3.0
// @description  youku html5 player +
// @author       gooyie
// @license      MIT License
//
// @include      *://v.youku.com/*
// @grant        GM_info
// @grant        GM_addStyle
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
    Patcher.patchQualitySetting();
    Patcher.patchQualityFallback();
    Patcher.patchVolumeMemory();

})();
