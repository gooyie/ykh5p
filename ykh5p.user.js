// ==UserScript==
// @name         ykh5p
// @namespace    https://github.com/gooyie/ykh5p
// @homepageURL  https://github.com/gooyie/ykh5p
// @supportURL   https://github.com/gooyie/ykh5p/issues
// @updateURL    https://raw.githubusercontent.com/gooyie/ykh5p/master/ykh5p.user.js
// @version      0.1.0
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
            console.log(this.tag + args.shift(), ...args);
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

    }

    class Mocker {

        static mockVip() {
            Hooker.hookUpsDataSuccess((data) => {
                if (data.user) {
                    data.user.vip = true;
                } else {
                    data.user = {vip: true};
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
            });

            GM_addStyle(`
                spvdiv.spv_setting_1080, spvdiv.spv_setting_panel {
                    width: 300px !important;
                }
            `);
        }

    }

    function enableH5Player() {
        sessionStorage.setItem('P_l_h5', 1);
    }

//=============================================================================

    enableH5Player();

    Mocker.mockVip();
    Patcher.patchQualitySetting();

})();
