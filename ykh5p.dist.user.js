'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ==UserScript==
// @name         ykh5p
// @namespace    https://github.com/gooyie/ykh5p
// @homepageURL  https://github.com/gooyie/ykh5p
// @supportURL   https://github.com/gooyie/ykh5p/issues
// @updateURL    https://raw.githubusercontent.com/gooyie/ykh5p/master/ykh5p.user.js
// @version      0.8.0
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
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                var call = Function.prototype.call;
                Function.prototype.call = function () {
                    for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                        args[_key6] = arguments[_key6];
                    }

                    var ret = call.apply(this, args);
                    try {
                        if (args) cb.apply(undefined, args);
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
            key: '_isEsModule',
            value: function _isEsModule(obj) {
                return obj && obj.__esModule;
            }
        }, {
            key: '_isFuction',
            value: function _isFuction(arg) {
                return 'function' === typeof arg;
            }
        }, {
            key: '_isFactoryCall',
            value: function _isFactoryCall(args) {
                // module.exports, module, module.exports, require
                return args.length === 4 && args[1] instanceof Object && args[1].hasOwnProperty('exports');
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
            key: '_isUpsFactoryCall',
            value: function _isUpsFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return this._isEsModule(exports) && this._isFuction(exports.default) && exports.default.prototype && exports.default.prototype.hasOwnProperty('getServieceUrl') && /\.id\s*=\s*"ups"/.test(exports.default.toString());
            }
        }, {
            key: 'hookUps',
            value: function hookUps() {
                var _this2 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
                        args[_key8] = arguments[_key8];
                    }

                    if (_this2._isUpsFactoryCall(args[1].exports)) cb(args[1].exports);
                });
            }
        }, {
            key: 'hookUpsOnComplete',
            value: function hookUpsOnComplete() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookUps(function (exports) {
                    var onComplete = exports.default.prototype.onComplete;
                    exports.default.prototype.onComplete = function (res) {
                        cb(res);
                        onComplete.apply(this, [res]);
                    };
                });
            }
        }, {
            key: '_isLogoFactoryCall',
            value: function _isLogoFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return this._isEsModule(exports) && this._isFuction(exports.default) && exports.default.prototype && exports.default.prototype.hasOwnProperty('reset') && /logo\.style\.display/.test(exports.default.prototype.reset.toString());
            }
        }, {
            key: 'hookLogo',
            value: function hookLogo() {
                var _this3 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                        args[_key9] = arguments[_key9];
                    }

                    if (_this3._isLogoFactoryCall(args[1].exports)) cb(args[1].exports);
                });
            }
        }, {
            key: '_isSettingFactoryCall',
            value: function _isSettingFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return this._isEsModule(exports) && this._isFuction(exports.default) && exports.default.prototype && exports.default.prototype.hasOwnProperty('setQuality');
            }
        }, {
            key: 'hookSetting',
            value: function hookSetting() {
                var _this4 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
                        args[_key10] = arguments[_key10];
                    }

                    if (_this4._isSettingFactoryCall(args[1].exports)) cb(args[1].exports);
                });
            }
        }, {
            key: 'hookRenderQulaity',
            value: function hookRenderQulaity() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                Hooker.hookSetting(function (exports) {
                    var renderQulaity = exports.default.prototype.renderQulaity;
                    exports.default.prototype.renderQulaity = function (qualitys) {
                        cb(qualitys, this);
                        renderQulaity.apply(this, [qualitys]);
                    };
                });
            }
        }, {
            key: 'hookSetCurrentQuality',
            value: function hookSetCurrentQuality() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                Hooker.hookSetting(function (exports) {
                    var setCurrentQuality = exports.default.prototype.setCurrentQuality;
                    exports.default.prototype.setCurrentQuality = function () {
                        cb(this);
                        setCurrentQuality.apply(this);
                    };
                });
            }
        }, {
            key: '_isPlayerFactoryCall',
            value: function _isPlayerFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return this._isEsModule(exports) && this._isFuction(exports.default) && exports.default.prototype && exports.default.prototype.hasOwnProperty('_resetPlayer');
            }
        }, {
            key: 'hookPlayer',
            value: function hookPlayer() {
                var _this5 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
                        args[_key11] = arguments[_key11];
                    }

                    if (_this5._isPlayerFactoryCall(args[1].exports)) cb(args[1].exports);
                });
            }
        }, {
            key: 'hookPlayerInitServiceEvent',
            value: function hookPlayerInitServiceEvent() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                Hooker.hookPlayer(function (exports) {
                    var _initServiceEvent = exports.default.prototype._initServiceEvent;
                    exports.default.prototype._initServiceEvent = function () {
                        cb(this);
                        _initServiceEvent.apply(this);
                    };
                });
            }
        }, {
            key: '_isKeyShortcutsFactoryCall',
            value: function _isKeyShortcutsFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return this._isEsModule(exports) && this._isFuction(exports.default) && exports.default.prototype && exports.default.prototype.hasOwnProperty('registerEvents');
            }
        }, {
            key: 'hookKeyShortcuts',
            value: function hookKeyShortcuts() {
                var _this6 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
                        args[_key12] = arguments[_key12];
                    }

                    if (_this6._isKeyShortcutsFactoryCall(args[1].exports)) cb(args[1].exports);
                });
            }
        }, {
            key: '_isTipsFactoryCall',
            value: function _isTipsFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return this._isEsModule(exports) && this._isFuction(exports.default) && exports.default.prototype && exports.default.prototype.hasOwnProperty('showHintTips');
            }
        }, {
            key: 'hookTips',
            value: function hookTips() {
                var _this7 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
                        args[_key13] = arguments[_key13];
                    }

                    if (_this7._isTipsFactoryCall(args[1].exports)) cb(args[1].exports);
                });
            }
        }, {
            key: '_isAdServiceFactoryCall',
            value: function _isAdServiceFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return this._isEsModule(exports) && this._isFuction(exports.default) && exports.default.prototype && exports.default.prototype.hasOwnProperty('requestAdData');
            }
        }, {
            key: 'hookAdService',
            value: function hookAdService() {
                var _this8 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
                        args[_key14] = arguments[_key14];
                    }

                    if (_this8._isAdServiceFactoryCall(args[1].exports)) cb(args[1].exports);
                });
            }
        }, {
            key: '_isTopAreaFactoryCall',
            value: function _isTopAreaFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return this._isEsModule(exports) && this._isFuction(exports.default) && exports.default.prototype && exports.default.prototype.hasOwnProperty('_timerHandler');
            }
        }, {
            key: 'hookTopArea',
            value: function hookTopArea() {
                var _this9 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                this.hookFactoryCall(function () {
                    for (var _len15 = arguments.length, args = Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
                        args[_key15] = arguments[_key15];
                    }

                    if (_this9._isTopAreaFactoryCall(args[1].exports)) cb(args[1].exports);
                });
            }
        }, {
            key: 'hookTopAreaAddEvent',
            value: function hookTopAreaAddEvent() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                Hooker.hookTopArea(function (exports) {
                    var _addEvent = exports.default.prototype._addEvent;
                    exports.default.prototype._addEvent = function () {
                        cb(this);
                        _addEvent.apply(this);
                    };
                });
            }
        }, {
            key: '_extractArgsName',
            value: function _extractArgsName(code) {
                return code.slice(code.indexOf('(') + 1, code.indexOf(')')).split(/\s*,\s*/);
            }
        }, {
            key: '_extractFunctionBody',
            value: function _extractFunctionBody(code) {
                return code.slice(code.indexOf('{') + 1, code.lastIndexOf('}'));
            }
        }, {
            key: '_isGlobalFactoryCall',
            value: function _isGlobalFactoryCall() {
                var exports = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return exports.SingleVideoControl && exports.MultiVideoControl;
            }
        }, {
            key: 'hookGlobal',
            value: function hookGlobal() {
                var _this10 = this;

                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
                var mode = arguments[1];

                if (!this._hookGlobalCallbacks) {
                    this._hookGlobalCallbacks = [];
                    this._hookGlobalCodeCallbacks = [];
                    (mode === 'code' ? this._hookGlobalCodeCallbacks : this._hookGlobalCallbacks).push(cb);

                    this.hookFactoryCall(function () {
                        for (var _len16 = arguments.length, args = Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
                            args[_key16] = arguments[_key16];
                        }

                        if (_this10._isGlobalFactoryCall(args[1].exports)) {
                            if (_this10._hookGlobalCodeCallbacks.length > 0) {
                                var code = args[3].m[args[1].i].toString();
                                code = _this10._hookGlobalCodeCallbacks.reduce(function (c, cb) {
                                    return cb(c);
                                }, code);
                                var fn = new (Function.prototype.bind.apply(Function, [null].concat(_toConsumableArray(_this10._extractArgsName(code)), [_this10._extractFunctionBody(code)])))();
                                fn.apply(args[0], args.slice(1));
                            }
                            _this10._hookGlobalCallbacks.forEach(function (cb) {
                                return cb(args[1].exports);
                            });
                        }
                    });
                } else {
                    (mode === 'code' ? this._hookGlobalCodeCallbacks : this._hookGlobalCallbacks).push(cb);
                }
            }
        }, {
            key: 'hookOz',
            value: function hookOz() {
                var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

                if (!this._hookOzCallbacks) {
                    var self = this;
                    this._hookOzCallbacks = [cb];
                    var window = unsafeWindow;
                    var oz = window.oz; // oz 可能先于脚本执行

                    Reflect.defineProperty(window, 'oz', {
                        get: function get() {
                            return oz;
                        },
                        set: function set(value) {
                            oz = value;
                            try {
                                self._hookOzCallbacks.forEach(function (cb) {
                                    return cb(oz);
                                });
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
        }, {
            key: 'hookDefine',
            value: function hookDefine(name) {
                var _this11 = this;

                var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

                if (!this._hookDefineCallbacksMap) {
                    this._hookDefineCallbacksMap = new Map([[name, [cb]]]);
                    this.hookOz(function (oz) {
                        var self = _this11;
                        var define = oz.define;
                        oz.define = function (name, deps, block) {
                            if (self._hookDefineCallbacksMap.has(name)) {
                                var code = block.toString();
                                code = self._hookDefineCallbacksMap.get(name).reduce(function (c, cb) {
                                    return cb(c);
                                }, code);
                                block = new (Function.prototype.bind.apply(Function, [null].concat(_toConsumableArray(self._extractArgsName(code)), [self._extractFunctionBody(code)])))();
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
        }]);

        return Hooker;
    }();

    var Patch = function () {
        function Patch() {
            _classCallCheck(this, Patch);

            this._installed = false;
        }

        _createClass(Patch, [{
            key: 'install',
            value: function install() {
                if (!this._installed) {
                    this._installed = true;
                    this._apply();
                }
            }
        }, {
            key: '_apply',
            value: function _apply() {}
        }]);

        return Patch;
    }();

    var AdBlockPatch = function (_Patch) {
        _inherits(AdBlockPatch, _Patch);

        function AdBlockPatch() {
            _classCallCheck(this, AdBlockPatch);

            return _possibleConstructorReturn(this, (AdBlockPatch.__proto__ || Object.getPrototypeOf(AdBlockPatch)).call(this));
        }

        _createClass(AdBlockPatch, [{
            key: '_apply',
            value: function _apply() {
                Hooker.hookAdService(function (exports) {
                    exports.default.prototype.requestAdData = function (arg) {
                        this.fail(arg, { code: '404', message: 'error' });
                    };
                });
            }
        }]);

        return AdBlockPatch;
    }(Patch);

    var WatermarksPatch = function (_Patch2) {
        _inherits(WatermarksPatch, _Patch2);

        function WatermarksPatch() {
            _classCallCheck(this, WatermarksPatch);

            return _possibleConstructorReturn(this, (WatermarksPatch.__proto__ || Object.getPrototypeOf(WatermarksPatch)).call(this));
        }

        _createClass(WatermarksPatch, [{
            key: '_apply',
            value: function _apply() {
                Hooker.hookLogo(function (exports) {
                    exports.default.prototype.reset = function () {};
                });
            }
        }]);

        return WatermarksPatch;
    }(Patch);

    var VipPatch = function (_Patch3) {
        _inherits(VipPatch, _Patch3);

        function VipPatch() {
            _classCallCheck(this, VipPatch);

            return _possibleConstructorReturn(this, (VipPatch.__proto__ || Object.getPrototypeOf(VipPatch)).call(this));
        }

        _createClass(VipPatch, [{
            key: '_apply',
            value: function _apply() {
                Hooker.hookUpsOnComplete(function (res) {
                    var data = res.data;
                    if (data.user) {
                        data.user.vip = true;
                    } else {
                        data.user = { vip: true };
                    }
                });
            }
        }]);

        return VipPatch;
    }(Patch);

    var QualitySettingPatch = function (_Patch4) {
        _inherits(QualitySettingPatch, _Patch4);

        function QualitySettingPatch() {
            _classCallCheck(this, QualitySettingPatch);

            return _possibleConstructorReturn(this, (QualitySettingPatch.__proto__ || Object.getPrototypeOf(QualitySettingPatch)).call(this));
        }

        _createClass(QualitySettingPatch, [{
            key: '_apply',
            value: function _apply() {
                this._patchPreferQuality();
                this._patchCurrentQuality();
                this._addStyle();
            }
        }, {
            key: '_patchPreferQuality',
            value: function _patchPreferQuality() {
                Hooker.hookSetting(function (exports) {
                    var html = exports.default.prototype.render();
                    var autoRe = /<div\s+data-val="auto"[^<>]*>自动<\/div>/;
                    var sdRe = /<div\s+data-val="320p"[^<>]*>标清<\/div>/;
                    var autoDiv = autoRe.exec(html)[0];
                    var fhdDiv = autoDiv.replace('auto', '1080p').replace('自动', '1080p');
                    html = html.replace(autoRe, fhdDiv).replace(sdRe, '$&' + autoDiv);
                    exports.default.prototype.render = function () {
                        return html;
                    };
                });
            }
        }, {
            key: '_patchCurrentQuality',
            value: function _patchCurrentQuality() {
                Hooker.hookSetting(function (exports) {
                    var _findRecentAvaliableQuality = exports.default.prototype._findRecentAvaliableQuality;
                    exports.default.prototype._findRecentAvaliableQuality = function (code, qualitys) {
                        qualitys.reverse();
                        return _findRecentAvaliableQuality.apply(this, [code, qualitys]);
                    };
                });

                Hooker.hookRenderQulaity(function (qualitys) {
                    qualitys.reverse();
                    var idx = qualitys.findIndex(function (i) {
                        return i.code === '1080p';
                    });
                    if (idx !== -1) qualitys[idx].name = '1080p';
                });
            }
        }, {
            key: '_addStyle',
            value: function _addStyle() {
                GM_addStyle('\n                .personalise-layer {\n                    width: 315px !important;\n                }\n                .setting-bar.setting-confirm {\n                    justify-content: center !important;\n                }\n            ');
            }
        }]);

        return QualitySettingPatch;
    }(Patch);

    var QualityFallbackPatch = function (_Patch5) {
        _inherits(QualityFallbackPatch, _Patch5);

        function QualityFallbackPatch() {
            _classCallCheck(this, QualityFallbackPatch);

            return _possibleConstructorReturn(this, (QualityFallbackPatch.__proto__ || Object.getPrototypeOf(QualityFallbackPatch)).call(this));
        }

        _createClass(QualityFallbackPatch, [{
            key: '_apply',
            value: function _apply() {
                Hooker.hookRenderQulaity(function (qualitys, that) {
                    return that.data.quality = that.data.preferQuality;
                }); // 由优先画质决定当前画质
                Hooker.hookSetCurrentQuality(function (that) {
                    return that._video.global.config.quality = that.data.quality;
                }); // 更新config当前画质
            }
        }]);

        return QualityFallbackPatch;
    }(Patch);

    var DashboardPatch = function (_Patch6) {
        _inherits(DashboardPatch, _Patch6);

        function DashboardPatch() {
            _classCallCheck(this, DashboardPatch);

            return _possibleConstructorReturn(this, (DashboardPatch.__proto__ || Object.getPrototypeOf(DashboardPatch)).call(this));
        }

        _createClass(DashboardPatch, [{
            key: '_apply',
            value: function _apply() {
                this._prepare();
                this._patch();
            }
        }, {
            key: '_prepare',
            value: function _prepare() {
                this._exposeDashboard();
            }
        }, {
            key: '_findVarName',
            value: function _findVarName(code) {
                return (/"dashboard"\s*,\s*(\w+)/.exec(code)[1]
                );
            }
        }, {
            key: '_exposeDashboard',
            value: function _exposeDashboard() {
                var _this18 = this;

                Hooker.hookGlobal(function (code) {
                    var varName = _this18._findVarName(code);
                    return code.replace(/\.exports\s*=\s*(\w+)/, '$&;$1.__Dashboard=' + varName + ';');
                }, 'code');
            }
        }, {
            key: '_patch',
            value: function _patch() {
                Hooker.hookGlobal(function (exports) {
                    exports.__Dashboard.prototype.bindAutoHide = function () {
                        var _this19 = this;

                        this._video.on('play', function () {
                            _this19._hideTimeout = setTimeout(_this19.hide.bind(_this19), _this19._args.autoHide);
                        });
                        this._video.on('pause', function () {
                            _this19._hideTimeout && clearTimeout(_this19._hideTimeout);
                            _this19.show();
                        });
                        this._parent.addEventListener('mousemove', function () {
                            _this19._hideTimeout && clearTimeout(_this19._hideTimeout);
                            _this19.show();
                            if (!_this19._isPaused()) _this19._hideTimeout = setTimeout(_this19.hide.bind(_this19), _this19._args.autoHide);
                        });
                        this._parent.addEventListener('mouseout', function () {
                            if (!_this19._isPaused()) _this19.hide();
                        });
                    };
                    exports.__Dashboard.prototype._isPaused = function () {
                        return this._video._videoCore.video.paused;
                    };
                    var show = exports.__Dashboard.prototype.show;
                    exports.__Dashboard.prototype.show = function () {
                        this.emit('dashboardshow');
                        this._parent.style.cursor = '';
                        show.apply(this);
                    };
                    var hide = exports.__Dashboard.prototype.hide;
                    exports.__Dashboard.prototype.hide = function () {
                        this.emit('dashboardhide');
                        this._parent.style.cursor = 'none'; // 隐藏鼠标
                        hide.apply(this);
                    };
                });
            }
        }]);

        return DashboardPatch;
    }(Patch);

    var TopAreaPatch = function (_Patch7) {
        _inherits(TopAreaPatch, _Patch7);

        function TopAreaPatch() {
            _classCallCheck(this, TopAreaPatch);

            return _possibleConstructorReturn(this, (TopAreaPatch.__proto__ || Object.getPrototypeOf(TopAreaPatch)).call(this));
        }

        _createClass(TopAreaPatch, [{
            key: '_apply',
            value: function _apply() {
                Hooker.hookTopAreaAddEvent(function (that) {
                    that.on('dashboardshow', function () {
                        if (that._video.global.playerState.fullscreen) {
                            that._showHideTop(true);
                        }
                    });
                    that.on('dashboardhide', function () {
                        if (that._video.global.playerState.fullscreen) {
                            that._hideHideTop();
                        }
                    });
                });
            }
        }]);

        return TopAreaPatch;
    }(Patch);

    var WebFullscreen = function () {
        function WebFullscreen(elem) {
            _classCallCheck(this, WebFullscreen);

            this._elem = elem;
        }

        _createClass(WebFullscreen, [{
            key: 'isWebFullscreen',
            value: function isWebFullscreen() {
                return this._elem.classList.contains('webfullscreen');
            }
        }, {
            key: 'enter',
            value: function enter() {
                this._elem.classList.add('webfullscreen');
                document.body.style.overflow = 'hidden';

                var parentNode = this._elem.parentNode;
                while (parentNode.nodeName !== 'BODY') {
                    if (parentNode.nodeType === Node.ELEMENT_NODE) {
                        parentNode.classList.add('z-top');
                    }
                    parentNode = parentNode.parentNode;
                }
            }
        }, {
            key: 'exit',
            value: function exit() {
                this._elem.classList.remove('webfullscreen');
                document.body.style.overflow = '';

                var parentNode = this._elem.parentNode;
                while (parentNode.nodeName !== 'BODY') {
                    if (parentNode.nodeType === Node.ELEMENT_NODE) {
                        parentNode.classList.remove('z-top');
                    }
                    parentNode = parentNode.parentNode;
                }
            }
        }, {
            key: 'toggle',
            value: function toggle() {
                this.isWebFullscreen() ? this.exit() : this.enter();
            }
        }], [{
            key: 'addStyle',
            value: function addStyle() {
                GM_addStyle('\n                .z-top {\n                    position: relative !important;\n                    z-index: 23333333 !important;\n                }\n\n                .webfullscreen {\n                    display: block !important;\n                    position: fixed !important;\n                    width: 100% !important;\n                    height: 100% !important;\n                    top: 0 !important;\n                    left: 0 !important;\n                    background: #000 !important;\n                    z-index: 23333333 !important;\n                }\n            ');
            }
        }]);

        return WebFullscreen;
    }();

    var PlayerPatch = function (_Patch8) {
        _inherits(PlayerPatch, _Patch8);

        function PlayerPatch() {
            _classCallCheck(this, PlayerPatch);

            return _possibleConstructorReturn(this, (PlayerPatch.__proto__ || Object.getPrototypeOf(PlayerPatch)).call(this));
        }

        _createClass(PlayerPatch, [{
            key: '_apply',
            value: function _apply() {
                this._prepare();
                this._hookPlayer();
            }
        }, {
            key: '_prepare',
            value: function _prepare() {
                Hooker.hookTips(function (exports) {
                    var showHintTips = exports.default.prototype.showHintTips;
                    exports.default.prototype.showHintTips = function (code, info) {
                        if (info.msg) {
                            this._hintLayer.setHintShow(info.msg);
                        } else {
                            showHintTips.apply(this, [code, info]);
                        }
                    };
                });
                Hooker.hookGlobal(function (exports) {
                    // 单video seek 后不自动播放
                    var _setCurrentTime = exports.SingleVideoControl.prototype._setCurrentTime;
                    exports.SingleVideoControl.prototype._setCurrentTime = function (time) {
                        var play = this.video.play;
                        this.video.play = function () {};
                        _setCurrentTime.apply(this, [time]);
                        this.video.play = play;
                    };
                });
            }
        }, {
            key: '_hookPlayer',
            value: function _hookPlayer() {
                Hooker.hookPlayer(this._hookPlayerCallback.bind(this));
            }
        }, {
            key: '_hookPlayerCallback',
            value: function _hookPlayerCallback(exports) {
                var proto = exports.default.prototype;

                var _init = exports.default.prototype._init;
                exports.default.prototype._init = function () {
                    _init.apply(this);
                    WebFullscreen.addStyle();
                    this._webfullscreen = new WebFullscreen(this.container);
                };

                proto._showTip = function (msg) {
                    this._emitter.emit('player.showinfo', { type: 'hint', msg: msg });
                };

                proto.play = function () {
                    this._player && this._player.control.play();
                    this._showTip('播放');
                };

                proto._pause = proto.pause;
                proto.pause = function () {
                    this._pause();
                    this._showTip('暂停');
                };

                proto.adjustVolume = function (value) {
                    this._player && this._player.control.setVolume(this.global.playerState.volume + value);
                };

                proto.toggleMute = function () {
                    if (this.global.playerState.muted) this._showTip('取消静音');
                    this.setMuted(!this.global.playerState.muted);
                };

                proto.stepSeek = function (stepTime) {
                    var duration = this._player.control.getDuration();
                    var currentTime = this.global.currentTime;
                    var seekTime = Math.max(0, Math.min(duration, currentTime + stepTime));
                    this.seek(seekTime);

                    var msg = void 0;
                    if (Math.abs(stepTime) < 60) {
                        msg = stepTime > 0 ? '\u6B65\u8FDB\uFF1A' + stepTime + '\u79D2' : '\u6B65\u9000\uFF1A' + Math.abs(stepTime) + '\u79D2';
                    } else {
                        msg = stepTime > 0 ? '\u6B65\u8FDB\uFF1A' + stepTime / 60 + '\u5206\u949F' : '\u6B65\u9000\uFF1A' + Math.abs(stepTime) / 60 + '\u5206\u949F';
                    }
                    this._showTip(msg);
                };

                proto.rangeSeek = function (range) {
                    var duration = this._player.control.getDuration();
                    var seekTime = Math.max(0, Math.min(duration, duration * range));
                    this.seek(seekTime);
                    this._showTip('定位：' + (range * 100).toFixed(0) + '%');
                };

                proto.isFullscreen = function () {
                    return this.global.playerState.fullscreen;
                };

                proto.toggleFullscreen = function () {
                    if (this.isFullscreen()) {
                        this.exitFullscreen();
                    } else {
                        this.fullScreen();
                    }
                };

                proto.isWebFullscreen = function () {
                    return this._webfullscreen.isWebFullscreen();
                };

                proto.enterWebFullscreen = function () {
                    this._webfullscreen.enter();
                };

                proto.exitWebFullscreen = function () {
                    this._webfullscreen.exit();
                };

                proto.toggleWebFullscreen = function () {
                    this.isWebFullscreen() ? this.exitWebFullscreen() : this.enterWebFullscreen();
                };

                proto.adjustPlaybackRate = function (value) {
                    var videoCore = this._player.control._videoCore;
                    var rate = Math.max(0.2, Math.min(5, videoCore.video.playbackRate + value));
                    if (this._player.config.controlType === 'multi') {
                        videoCore._videoElments.forEach(function (v) {
                            return v.playbackRate = rate;
                        });
                    } else {
                        videoCore.video.playbackRate = rate;
                    }
                    this._showTip('\u64AD\u653E\u901F\u7387\uFF1A' + rate.toFixed(1).replace(/\.0+$/, ''));
                };

                proto.resetPlaybackRate = function () {
                    this._player.control.setRate(1);
                    this._showTip('恢复播放速率');
                };

                proto.getFps = function () {
                    return 25; // 标清fps为15，标清以上fps为25。
                };

                proto.prevFrame = function () {
                    var state = this.global.playerState.state;
                    if (state === 'playing') this.pause();
                    var duration = this._player.control.getDuration();
                    var currentTime = this.global.currentTime;
                    var seekTime = Math.max(0, Math.min(duration, currentTime - 1 / this.getFps()));
                    this.seek(seekTime);
                    this._showTip('上一帧');
                };

                proto.nextFrame = function () {
                    var state = this.global.playerState.state;
                    if (state === 'playing') this.pause();
                    var duration = this._player.control.getDuration();
                    var currentTime = this.global.currentTime;
                    var seekTime = Math.max(0, Math.min(duration, currentTime + 1 / this.getFps()));
                    this.seek(seekTime);
                    this._showTip('下一帧');
                };

                proto.playPrev = function () {
                    // TODO:
                };

                proto.playNext = function () {
                    // TODO:
                };
            }
        }]);

        return PlayerPatch;
    }(Patch);

    var playerPatch = new PlayerPatch();

    var KeyShortcutsPatch = function (_Patch9) {
        _inherits(KeyShortcutsPatch, _Patch9);

        function KeyShortcutsPatch() {
            _classCallCheck(this, KeyShortcutsPatch);

            return _possibleConstructorReturn(this, (KeyShortcutsPatch.__proto__ || Object.getPrototypeOf(KeyShortcutsPatch)).call(this));
        }

        _createClass(KeyShortcutsPatch, [{
            key: '_apply',
            value: function _apply() {
                this._prepare();
                this._addListener();
            }
        }, {
            key: '_prepare',
            value: function _prepare() {
                playerPatch.install();
                this._obtainPlayer();
            }
        }, {
            key: '_obtainPlayer',
            value: function _obtainPlayer() {
                var self = this;
                Hooker.hookKeyShortcuts(function (exports) {
                    exports.default.prototype.registerEvents = function () {
                        self._player = this._player;
                    };
                });
            }
        }, {
            key: '_addListener',
            value: function _addListener() {
                document.addEventListener('keydown', this._handler.bind(this));
            }
        }, {
            key: '_handler',
            value: function _handler(event) {
                if (event.target.nodeName !== 'BODY') return;

                switch (event.keyCode) {
                    case 32:
                        // Spacebar
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            var state = this._player.global.playerState.state;
                            if (state === 'paused' || state === 'ended' || state === 'player.init') {
                                this._player.play();
                            } else {
                                this._player.pause();
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
                            this._player.stepSeek(stepTime);
                            break;
                        }
                    case 38: // ↑ Arrow Up
                    case 40:
                        // ↓ Arrow Down
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            this._player.adjustVolume(38 === event.keyCode ? 0.05 : -0.05);
                        } else {
                            return;
                        }
                        break;
                    case 77:
                        // M
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            this._player.toggleMute();
                        } else {
                            return;
                        }
                        break;
                    case 13:
                        // Enter
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            this._player.toggleFullscreen();
                        } else if (event.ctrlKey && !event.shiftKey && !event.altKey) {
                            this._player.toggleWebFullscreen();
                        } else {
                            return;
                        }
                        break;
                    case 67: // C
                    case 88:
                        // X
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            this._player.adjustPlaybackRate(67 === event.keyCode ? 0.1 : -0.1);
                        } else {
                            return;
                        }
                        break;
                    case 90:
                        // Z
                        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
                            this._player.resetPlaybackRate();
                        } else {
                            return;
                        }
                        break;
                    case 68: // D
                    case 70:
                        // F
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
                    case 78:
                        // N
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
                        if (event.keyCode >= 48 && event.keyCode <= 57) {
                            // 0 ~ 9
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
        }]);

        return KeyShortcutsPatch;
    }(Patch);

    var MouseShortcutsPatch = function (_Patch10) {
        _inherits(MouseShortcutsPatch, _Patch10);

        function MouseShortcutsPatch() {
            _classCallCheck(this, MouseShortcutsPatch);

            return _possibleConstructorReturn(this, (MouseShortcutsPatch.__proto__ || Object.getPrototypeOf(MouseShortcutsPatch)).call(this));
        }

        _createClass(MouseShortcutsPatch, [{
            key: '_apply',
            value: function _apply() {
                this._prepare();
                this._addListener();
            }
        }, {
            key: '_prepare',
            value: function _prepare() {
                playerPatch.install();
                this._addStyle();
            }
        }, {
            key: '_addStyle',
            value: function _addStyle() {
                GM_addStyle('\n                .h5-layer-conatiner {\n                    -webkit-user-select: none !important;\n                    -moz-user-select: none !important;\n                    -ms-user-select: none !important;\n                    user-select: none !important;\n                }\n                .h5-ext-layer-adsdk {\n                    display: none !important;\n                }\n            ');
            }
        }, {
            key: '_addListener',
            value: function _addListener() {
                Hooker.hookPlayerInitServiceEvent(function (that) {
                    var timer = void 0;
                    var container = that.container.querySelector('.h5-layer-conatiner');
                    container.addEventListener('click', function (event) {
                        if (event.target !== container) return;
                        if (timer) {
                            clearTimeout(timer);
                            timer = null;
                            return;
                        }
                        timer = setTimeout(function () {
                            var state = that.global.playerState.state;
                            if (state === 'paused' || state === 'ended' || state === 'player.init') {
                                that.play();
                            } else {
                                that.pause();
                            }
                            timer = null;
                        }, 200);
                    });
                    container.addEventListener('dblclick', function (event) {
                        if (event.target !== container) return;
                        event.ctrlKey ? that.toggleWebFullscreen() : that.toggleFullscreen();
                    });
                    container.addEventListener('wheel', function (event) {
                        if (event.target === container && (that.isFullscreen() || that.isWebFullscreen())) {
                            var delta = event.wheelDelta || event.detail || event.deltaY && -event.deltaY;
                            that.adjustVolume(delta > 0 ? 0.05 : -0.05);
                        }
                    });
                });
            }
        }]);

        return MouseShortcutsPatch;
    }(Patch);

    var ShortcutsPatch = function (_Patch11) {
        _inherits(ShortcutsPatch, _Patch11);

        function ShortcutsPatch() {
            _classCallCheck(this, ShortcutsPatch);

            return _possibleConstructorReturn(this, (ShortcutsPatch.__proto__ || Object.getPrototypeOf(ShortcutsPatch)).call(this));
        }

        _createClass(ShortcutsPatch, [{
            key: '_apply',
            value: function _apply() {
                new KeyShortcutsPatch().install();
                Logger.log('添加键盘快捷键');
                new MouseShortcutsPatch().install();
                Logger.log('添加鼠标快捷键');
            }
        }]);

        return ShortcutsPatch;
    }(Patch);

    var H5Patch = function (_Patch12) {
        _inherits(H5Patch, _Patch12);

        function H5Patch() {
            _classCallCheck(this, H5Patch);

            return _possibleConstructorReturn(this, (H5Patch.__proto__ || Object.getPrototypeOf(H5Patch)).call(this));
        }

        _createClass(H5Patch, [{
            key: '_apply',
            value: function _apply() {
                Hooker.hookDefine('page/find/play/player/load', this._forceH5.bind(this));
            }
        }, {
            key: '_forceH5',
            value: function _forceH5(code) {
                return code.replace(/(if\s*\().*?(\)\s*\{)/, '$1true$2');
            }
        }]);

        return H5Patch;
    }(Patch);

    function enableH5Player() {
        new H5Patch().install();
        Logger.log('启用html5播放器');
    }

    function blockAds() {
        new AdBlockPatch().install();
        Logger.log('和谐广告');
    }

    function invalidateWatermarks() {
        new WatermarksPatch().install();
        Logger.log('和谐水印');
    }

    function invalidateQualityLimitation() {
        new VipPatch().install();
        Logger.log('解除会员画质限制');
    }

    function improveQualitySetting() {
        new QualitySettingPatch().install();
        Logger.log('设置里优先画质增加1080P选项并与当前画质对齐');
    }

    function improveQualityFallback() {
        new QualityFallbackPatch().install();
        Logger.log('改善当前画质逻辑');
    }

    function improveAutoHide() {
        new DashboardPatch().install();
        new TopAreaPatch().install();
        Logger.log('改善控件与光标自动隐藏');
    }

    function improveShortcuts() {
        new ShortcutsPatch().install();
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
