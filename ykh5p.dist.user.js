'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ==UserScript==
// @name         ykh5p
// @namespace    https://github.com/gooyie/ykh5p
// @homepageURL  https://github.com/gooyie/ykh5p
// @supportURL   https://github.com/gooyie/ykh5p/issues
// @updateURL    https://raw.githubusercontent.com/gooyie/ykh5p/master/ykh5p.user.js
// @version      0.5.0
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

(function () {
    'use strict';

    /* eslint-disable no-console */

    var Logger = function () {
        function Logger() {
            _classCallCheck(this, Logger);
        }

        _createClass(Logger, null, [{
            key: 'log',
            value: function log() {
                var _console;

                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                (_console = console).log.apply(_console, ['%c' + this.tag + '%c' + args.shift(), 'color: #fff; background: #2FB3FF', ''].concat(args));
            }
        }, {
            key: 'info',
            value: function info() {
                var _console2;

                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                (_console2 = console).info.apply(_console2, [this.tag + args.shift()].concat(args));
            }
        }, {
            key: 'debug',
            value: function debug() {
                var _console3;

                for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    args[_key3] = arguments[_key3];
                }

                (_console3 = console).debug.apply(_console3, [this.tag + args.shift()].concat(args));
            }
        }, {
            key: 'warn',
            value: function warn() {
                var _console4;

                for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                    args[_key4] = arguments[_key4];
                }

                (_console4 = console).warn.apply(_console4, [this.tag + args.shift()].concat(args));
            }
        }, {
            key: 'error',
            value: function error() {
                var _console5;

                for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                    args[_key5] = arguments[_key5];
                }

                (_console5 = console).error.apply(_console5, [this.tag + args.shift()].concat(args));
            }
        }, {
            key: 'tag',
            get: function get() {
                return '[' + GM_info.script.name + ']';
            }
        }]);

        return Logger;
    }();
    /* eslint-enable no-console */

    var Hooker = function () {
        function Hooker() {
            _classCallCheck(this, Hooker);
        }

        _createClass(Hooker, null, [{
            key: 'hookCall',
            value: function hookCall() {
                var after = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
                var before = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

                var call = Function.prototype.call;
                Function.prototype.call = function () {
                    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                        args[_key6] = arguments[_key6];
                    }

                    try {
                        if (args) before.apply(undefined, args);
                    } catch (err) {
                        Logger.error(err.stack);
                    }

                    var ret = call.apply(this, args);

                    try {
                        if (args) after.apply(undefined, args);
                    } catch (err) {
                        Logger.error(err.stack);
                    }

                    return ret;
                };

                Function.prototype.call.toString = Function.prototype.call.toLocaleString = function () {
                    return 'function call() { [native code] }';
                };
            }
        }, {
            key: '_isFactoryCall',
            value: function _isFactoryCall(args) {
                // m.exports, _dereq_, m, m.exports, outer, modules, cache, entry
                return args.length === 8 && args[2] instanceof Object && args[2].hasOwnProperty('exports');
            }
        }, {
            key: 'hookFactoryCall',
            value: function hookFactoryCall() {
                var _this = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookCall(function () {
                    for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                        args[_key7] = arguments[_key7];
                    }

                    if (_this._isFactoryCall(args)) cb.apply(undefined, args);
                });
            }
        }, {
            key: '_isManagerFactoryCall',
            value: function _isManagerFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return 'function' === typeof exports && exports.prototype.hasOwnProperty('upsDataSuccess');
            }
        }, {
            key: 'hookManager',
            value: function hookManager() {
                var _this2 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
                        args[_key8] = arguments[_key8];
                    }

                    if (_this2._isManagerFactoryCall(args[2].exports)) cb(args[2].exports);
                });
            }
        }, {
            key: 'hookUpsDataSuccess',
            value: function hookUpsDataSuccess() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookManager(function (exports) {
                    var upsDataSuccess = exports.prototype.upsDataSuccess;
                    exports.prototype.upsDataSuccess = function (data) {
                        cb(data);
                        upsDataSuccess.apply(this, [data]);
                    };
                });
            }
        }, {
            key: 'hookWatcher',
            value: function hookWatcher() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookManager(function (exports) {
                    var watcher = exports.prototype.watcher;
                    exports.prototype.watcher = function () {
                        watcher.apply(this);
                        cb(this);
                    };
                });
            }
        }, {
            key: '_isSkinsViewRenderCall',
            value: function _isSkinsViewRenderCall(args) {
                return args.length === 3 && args[1] === 'spvdiv' && args[2].className === 'spv_player';
            }
        }, {
            key: 'hookSkinsViewRender',
            value: function hookSkinsViewRender() {
                var _this3 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookCall(undefined, function () {
                    for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                        args[_key9] = arguments[_key9];
                    }

                    if (_this3._isSkinsViewRenderCall(args)) cb(args[2]);
                });
            }
        }, {
            key: '_isUtilFactoryCall',
            value: function _isUtilFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return exports.hasOwnProperty('getJsonp') && exports.TAG === 'util';
            }
        }, {
            key: 'hookUtil',
            value: function hookUtil() {
                var _this4 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
                        args[_key10] = arguments[_key10];
                    }

                    if (_this4._isUtilFactoryCall(args[2].exports)) cb(args[2].exports);
                });
            }
        }, {
            key: 'hookGetJsonp',
            value: function hookGetJsonp() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookUtil(function (exports) {
                    var getJsonp = exports.getJsonp.bind(exports);
                    exports.getJsonp = function () {
                        for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
                            args[_key11] = arguments[_key11];
                        }

                        // url, onload, onerror, ontimeout, timeout
                        if (cb(args)) return; // hijack
                        getJsonp.apply(undefined, args);
                    };
                });
            }
        }, {
            key: '_isH5PlayerCoreFactoryCall',
            value: function _isH5PlayerCoreFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return exports instanceof Object && exports.hasOwnProperty('YoukuH5PlayerCore');
            }
        }, {
            key: 'hookH5PlayerCore',
            value: function hookH5PlayerCore() {
                var _this5 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
                        args[_key12] = arguments[_key12];
                    }

                    if (_this5._isH5PlayerCoreFactoryCall(args[2].exports)) cb(args[2].exports);
                });
            }
        }, {
            key: 'hookRealStartPlay',
            value: function hookRealStartPlay() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookH5PlayerCore(function (exports) {
                    var _realStartPlay = exports.YoukuH5PlayerCore.prototype._realStartPlay;
                    exports.YoukuH5PlayerCore.prototype._realStartPlay = function () {
                        for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
                            args[_key13] = arguments[_key13];
                        }

                        cb(this, args);
                        _realStartPlay.apply(this, args);
                    };
                });
            }
        }, {
            key: '_isSkinsControlFactoryCall',
            value: function _isSkinsControlFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return 'function' === typeof exports && exports.prototype.hasOwnProperty('shadowClick');
            }
        }, {
            key: 'hookSkinsControl',
            value: function hookSkinsControl() {
                var _this6 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
                        args[_key14] = arguments[_key14];
                    }

                    if (_this6._isSkinsControlFactoryCall(args[2].exports)) cb(args[2].exports);
                });
            }
        }, {
            key: 'hookSkinsControlDomEvent',
            value: function hookSkinsControlDomEvent() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookSkinsControl(function (exports) {
                    var domEvent = exports.prototype.domEvent;
                    exports.prototype.domEvent = function () {
                        cb(this);
                        domEvent.apply(this);
                    };
                });
            }
        }, {
            key: 'hookWindowAddEventListener',
            value: function hookWindowAddEventListener() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                var window = unsafeWindow;
                var addEventListener = window.addEventListener.bind(window);
                window.addEventListener = function () {
                    for (var _len15 = arguments.length, args = Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
                        args[_key15] = arguments[_key15];
                    }

                    if (cb(args)) return; // rejection
                    addEventListener.apply(undefined, args);
                };
            }
        }]);

        return Hooker;
    }();

    var Mocker = function () {
        function Mocker() {
            _classCallCheck(this, Mocker);
        }

        _createClass(Mocker, null, [{
            key: 'mockVip',
            value: function mockVip() {
                Hooker.hookUpsDataSuccess(function (data) {
                    if (data.user) {
                        data.user.vip = true;
                    } else {
                        data.user = { vip: true };
                    }
                    Logger.log('解除会员画质限制');
                });
            }
        }]);

        return Mocker;
    }();

    var Blocker = function () {
        function Blocker() {
            _classCallCheck(this, Blocker);
        }

        _createClass(Blocker, null, [{
            key: '_isAdReq',
            value: function _isAdReq(url) {
                return (/atm\.youku\.com/.test(url)
                );
            }
        }, {
            key: 'blockAd',
            value: function blockAd() {
                var _this7 = this;

                Hooker.hookGetJsonp(function (args) {
                    var _args = _slicedToArray(args, 3),
                        url = _args[0],
                        /* onload */onerror = _args[2];

                    if (_this7._isAdReq(url)) {
                        setTimeout(onerror, 0); // async invoke
                        Logger.log('blocked ad request', url);
                        return true;
                    }
                });
            }
        }]);

        return Blocker;
    }();

    var Patcher = function () {
        function Patcher() {
            _classCallCheck(this, Patcher);
        }

        _createClass(Patcher, null, [{
            key: 'patchQualitySetting',
            value: function patchQualitySetting() {
                Hooker.hookSkinsViewRender(function (elem) {
                    var autoRe = /<spvdiv\s+customer="auto"[^<>]*>自动<\/spvdiv>/;
                    var mp4Re = /<spvdiv\s+customer="mp4"[^<>]*>标清<\/spvdiv>/;
                    var autoDiv = autoRe.exec(elem.innerHTML)[0];
                    var hd3Div = autoDiv.replace('auto', 'mp4hd3').replace('自动', '1080P');
                    elem.innerHTML = elem.innerHTML.replace(autoRe, hd3Div).replace(mp4Re, '$&' + autoDiv);
                    Logger.log('设置里优先画质增加1080P选项并对齐到当前画质');
                });

                GM_addStyle('\n                spvdiv.spv_setting_1080, spvdiv.spv_setting_panel {\n                    width: 300px !important;\n                }\n            ');
            }
        }, {
            key: 'patchQualityFallback',
            value: function patchQualityFallback() {
                Hooker.hookH5PlayerCore(function (exports) {
                    var SHOWHD = new Map([['flvhd', '标清'], ['3gphd', '标清'], ['mp4hd', '高清'], ['mp4hd2', '超清'], ['mp4hd3', '1080p']]);

                    exports.YoukuH5PlayerCore.prototype._initControlInfo = function () {
                        if (!this._videoInfo.langcodes) return;

                        var control = this.control;
                        if (!control.lang || !this._videoInfo.langcodes.includes(control.lang)) {
                            control.lang = this._videoInfo.langcodes[0];
                        }

                        var hdcodes = this._videoInfo.hdList[control.lang].hdcodes;
                        if (!hdcodes.includes(control.hd)) {
                            // 如果设置的优先画质在当前播放的视频里没有
                            var hd = control.hd;
                            control.hd = hdcodes[hdcodes.length - 1]; // 向下选择最高画质（原逻辑是给最渣画质！）
                            Logger.log('\u4F18\u5148\u753B\u8D28\uFF08' + SHOWHD.get(hd) + '\uFF09\u5728\u5F53\u524D\u64AD\u653E\u7684\u89C6\u9891\u91CC\u6CA1\u6709\uFF0C\u5411\u4E0B\u9009\u62E9\u6700\u9AD8\u753B\u8D28\uFF08' + SHOWHD.get(control.hd) + '\uFF09\u3002');
                        }

                        control.autoplay = control.autoplay || false;
                        control.fullscreen = control.fullscreen || false;
                    };
                });
            }
        }, {
            key: 'patchVolumeMemory',
            value: function patchVolumeMemory() {
                var _this8 = this;

                Hooker.hookRealStartPlay(function (that) {
                    if (_this8._enabled) return;
                    _this8._enabled = true;

                    if (0 === parseFloat(localStorage.getItem('spv_volume'))) {
                        that.UIControl.__proto__.mute.apply(that.UIControl);
                    } else {
                        that.UIControl.__proto__.nomute.apply(that.UIControl);
                    }

                    that.EventManager.on('VolumeChange', function (data) {
                        localStorage.setItem('spv_volume', data.value);
                    });

                    Logger.log('开启音量记忆');
                });
            }
        }, {
            key: '_isFullScreen',
            value: function _isFullScreen() {
                return !!(document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
            }
        }, {
            key: 'patchFullScreen',
            value: function patchFullScreen() {
                var self = this;
                Hooker.hookManager(function (exports) {
                    exports.prototype.toggleFull = function (arg) {
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
        }, {
            key: '_patchManager',
            value: function _patchManager() {
                Hooker.hookManager(function (exports) {
                    exports.prototype.getPreviousVid = function () {
                        if (this.data.videos && this.data.videos.list) {
                            var list = this.data.videos.list;
                            var currVid = this.data.video.id;
                            var prevSeq = list.find(function (item) {
                                return parseInt(item.vid) === currVid;
                            }).seq - 1;
                            if (prevSeq > 0) {
                                var previous = list.find(function (item) {
                                    return parseInt(item.seq) === prevSeq;
                                });
                                return previous.encodevid;
                            }
                        }
                    };

                    exports.prototype.getVideoFPS = function () {
                        return 25; // 优酷m3u8为动态帧率，flv标清fps为15，标清以上fps为25。
                    };
                });
            }
        }, {
            key: '_patchWatcher',
            value: function _patchWatcher() {
                this._patchManager();

                Hooker.hookWatcher(function (that) {
                    that.EventManager.on('_Seek', function (seekTime) {
                        var videoCurrentInfo = {
                            currentTime: seekTime,
                            buffered: that.bufferedEnd()
                        };

                        that.UIControl.setProgress(videoCurrentInfo, that.duration);
                        that.UIControl.setTime(seekTime, that);

                        that.seek(seekTime);
                        // if (that.myVideo.paused) that.play(); // seek后自动播放
                    });

                    that.EventManager.on('_StepSeek', function (stepTime) {
                        var seekTime = Math.max(0, Math.min(that.duration, that.mediaElement.currentTime + stepTime));
                        var msg = void 0;

                        if (Math.abs(stepTime) < 60) {
                            msg = stepTime > 0 ? '\u6B65\u8FDB\uFF1A' + stepTime + '\u79D2' : '\u6B65\u9000\uFF1A' + Math.abs(stepTime) + '\u79D2';
                        } else {
                            msg = stepTime > 0 ? '\u6B65\u8FDB\uFF1A' + stepTime / 60 + '\u5206\u949F' : '\u6B65\u9000\uFF1A' + Math.abs(stepTime) / 60 + '\u5206\u949F';
                        }
                        that.UIControl.tipShow(msg);

                        that.EventManager.fire('_Seek', seekTime);
                    });

                    that.EventManager.on('_RangeSeek', function (range) {
                        that.UIControl.tipShow('定位：' + (range * 100).toFixed(0) + '%');
                        var seekTime = Math.max(0, Math.min(that.duration, that.duration * range));
                        that.EventManager.fire('_Seek', seekTime);
                    });

                    that.EventManager.on('_PreviousFrame', function () {
                        that.UIControl.tipShow('定位：上一帧');
                        var seekTime = Math.max(0, Math.min(that.duration, that.mediaElement.currentTime - 1 / that.getVideoFPS()));
                        that.seek(seekTime);
                    });

                    that.EventManager.on('_NextFrame', function () {
                        that.UIControl.tipShow('定位：下一帧');
                        var seekTime = Math.max(0, Math.min(that.duration, that.mediaElement.currentTime + 1 / that.getVideoFPS()));
                        that.seek(seekTime);
                    });

                    that.EventManager.off('VolumeChange');
                    that.EventManager.on('VolumeChange', function (param) {
                        if (0 === parseFloat(param.value)) {
                            that.UIControl.tipShow('静音');
                        } else {
                            that.UIControl.tipShow('\u97F3\u91CF\uFF1A' + (100 * param.value).toFixed(0) + '%');
                        }
                        that.changeMuted(param.value);
                    });

                    that.EventManager.on('_AdjustVolume', function (value) {
                        var volume = that.mediaElement.volume + value;
                        volume = Math.max(0, Math.min(1, volume.toFixed(2)));
                        that.mediaElement.volume = volume;

                        that.UIControl.volumeProgress(volume);
                        that.UIControl.volumeChange();
                    });

                    that.EventManager.on('_ToggleMute', function () {
                        if (that.mediaElement.muted) {
                            that.UIControl.nomute();
                            that.UIControl.tipShow('取消静音');
                        } else {
                            that.UIControl.mute();
                            that.UIControl.tipShow('静音');
                        }
                    });

                    that.EventManager.on('_AdjustPlaybackRate', function (value) {
                        var playbackRate = Math.max(0.2, Math.min(5, that.mediaElement.playbackRate + value));
                        that.mediaElement.playbackRate = playbackRate;
                        that.UIControl.tipShow('\u64AD\u653E\u901F\u7387\uFF1A' + playbackRate.toFixed(1).replace(/\.0+$/, ''));
                    });

                    that.EventManager.on('_ResetPlaybackRate', function () {
                        that.UIControl.tipShow('恢复播放速率');
                        that.mediaElement.playbackRate = 1;
                    });

                    that.EventManager.on('_PlayPrevious', function () {
                        var vid = that.getPreviousVid();
                        if (vid) {
                            that.EventManager.fire('ChangeVid', { vid: vid });
                            that.UIControl.tipShow('播放上一集');
                        } else {
                            that.UIControl.tipShow('没有上一集哦');
                        }
                    });

                    that.EventManager.on('_PlayNext', function () {
                        var vid = that.getNextVid();
                        if (vid) {
                            that.EventManager.fire('ChangeVid', { vid: vid });
                            that.UIControl.tipShow('播放下一集');
                        } else {
                            that.UIControl.tipShow('没有下一集哦');
                        }
                    });
                });
            }
            // 让之后的tip覆盖之前的，不然之前的未消失会使之后的被忽略。

        }, {
            key: '_patchTipShow',
            value: function _patchTipShow() {
                Hooker.hookSkinsControl(function (exports) {
                    exports.prototype.tipShow = function (msg) {
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

        }, {
            key: '_patchControlHide',
            value: function _patchControlHide() {
                Hooker.hookSkinsControl(function (exports) {
                    exports.prototype.controlHide = function (isAd) {
                        var _this9 = this;

                        if (isAd) {
                            this.setCtrlDom(false);
                            return;
                        }
                        if (this.pause || this.timer) return;

                        this.timer = setTimeout(function () {
                            return _this9.setCtrlDom(false);
                        }, 3e3);
                    };
                });
            }
        }, {
            key: '_patchVolumeRange',
            value: function _patchVolumeRange() {
                Hooker.hookSkinsControlDomEvent(function (that) {
                    return that.volumeRange.step = 0.01;
                });
            }
        }, {
            key: 'patchShortcuts',
            value: function patchShortcuts() {
                this._patchWatcher();
                this._patchTipShow();
                this._patchVolumeRange();
                this._patchControlHide();
                // 原键盘快捷键在搜索框等仍有效，废了它。
                Hooker.hookWindowAddEventListener(function (_ref) {
                    var _ref2 = _slicedToArray(_ref, 1),
                        type = _ref2[0];

                    if (type !== 'keydown') return;

                    var stack = new Error().stack;
                    if (stack.includes('domEvent')) {
                        Logger.log('废除原键盘快捷键');
                        return true;
                    }
                });

                Hooker.hookSkinsControlDomEvent(function (that) {
                    document.addEventListener('keydown', function (event) {
                        if (event.target.nodeName !== 'BODY') return;

                        switch (event.keyCode) {
                            case 32:
                                // Spacebar
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
                            case 39: // → Arrow Right
                            case 37:
                                {
                                    // ← Arrow Left
                                    var stepTime = void 0;
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
                            case 40:
                                // ↓ Arrow Down
                                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                                    that.EventManager.fire('_AdjustVolume', 38 === event.keyCode ? 0.05 : -0.05);
                                } else {
                                    return;
                                }
                                break;
                            case 77:
                                // M
                                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                                    that.EventManager.fire('_ToggleMute');
                                } else {
                                    return;
                                }
                                break;
                            case 13:
                                // Enter
                                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                                    that.EventManager.fire('SwitchFullScreen');
                                } else {
                                    return;
                                }
                                break;
                            case 67: // C
                            case 88:
                                // X
                                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                                    that.EventManager.fire('_AdjustPlaybackRate', 67 === event.keyCode ? 0.1 : -0.1);
                                } else {
                                    return;
                                }
                                break;
                            case 90:
                                // Z
                                if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                                    that.EventManager.fire('_ResetPlaybackRate');
                                } else {
                                    return;
                                }
                                break;
                            case 68: // D
                            case 70:
                                // F
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
                            case 78:
                                // N
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
                                if (event.keyCode >= 48 && event.keyCode <= 57) {
                                    // 0 ~ 9
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
        }]);

        return Patcher;
    }();

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
    window.addEventListener('unload', function () {
        return recoverPlayer();
    }); // 禁用脚本刷新页面可恢复播放器

    Blocker.blockAd();
    Mocker.mockVip();
    Patcher.patchQualitySetting();
    Patcher.patchQualityFallback();
    Patcher.patchVolumeMemory();
    Patcher.patchFullScreen();
    Patcher.patchShortcuts();
})();
