"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var tool_1 = require("./tool");
var responsive_attr_1 = require("./responsive_attr");
var queue_1 = require("./queue");
var DELIMITER = '_:_';
var ID_REG = new RegExp(",?\"id\":\"[^}]+" + DELIMITER + ".+_:_swopid\",?", 'g');
var Swop = (function (_super) {
    tslib_1.__extends(Swop, _super);
    function Swop(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.json_stringify, json_stringify = _c === void 0 ? false : _c, _d = _b.json_parse, json_parse = _d === void 0 ? false : _d;
        var _this = _super.call(this) || this;
        _this.store = {};
        _this.middleware = [];
        _this.json_stringify = json_stringify;
        _this.json_parse = json_parse;
        _this.send = function () {
            tool_1.warn('You must override the 【send】 method', true);
        };
        _this.init();
        return _this;
    }
    Swop.prototype.call_middleware = function (match, params) {
        var i = 0;
        var middleware = this.middleware;
        var length = middleware.length;
        for (; i < length; i++) {
            var mid = middleware[i];
            if (mid.match === match || mid.match === 'all') {
                mid.fun(params);
            }
        }
    };
    Swop.prototype.create_callback = function (name, resolve) {
        var _this = this;
        return function (next, nextSwopFun, data) {
            var params = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                params[_i - 3] = arguments[_i];
            }
            var response_data = [
                _this.get_json_origin_data(data),
                {
                    next: next,
                    params: params,
                    nextSwopFun: nextSwopFun,
                }
            ];
            _this.call_middleware(name, {
                value: response_data,
                match: name
            });
            resolve(response_data);
        };
    };
    Swop.prototype.search = function (name, id) {
        if (typeof id !== 'string' || (id && !id.includes(name))) {
            tool_1.warn("\u3010" + id + "\u3011is invalid id");
        }
        var list = this.store[name].funs || [];
        for (var i = 0, funUnit = void 0; funUnit = list[i]; i++) {
            if (id === funUnit.id) {
                return list.splice(i, 1)[0].fun_body;
            }
        }
    };
    Swop.prototype.get_name_by_id = function (id) {
        return id.split(DELIMITER)[0];
    };
    Swop.prototype.get_id = function (data) {
        if (typeof data === 'string') {
            if (!data.includes('origin_data' || !data.includes('swopid'))) {
                tool_1.warn('The response data must contain 【origin_data】 and 【id】');
            }
            var ID_GROUP_REG = new RegExp("(,?\"id\":\")([^}]+" + DELIMITER + ".+_:_swopid)\"(,?)", 'g');
            var match = ID_GROUP_REG.exec(data);
            if (!match || (match && !match[2])) {
                tool_1.warn("Invalid id");
            }
            return match[2];
        }
        return data.id;
    };
    Swop.prototype.get_json_origin_data = function (data) {
        if (typeof data === 'string') {
            data = data.replace(ID_REG, '');
            var match = /({?"origin_data":)(.+)}(,.*)!?/g.exec(data);
            if (!match) {
                return data.replace(/({?"origin_data":)(.+)}/g, function (k1, k2, k3) { return k3; });
            }
            return match[2];
        }
        return data.origin_data;
    };
    Swop.prototype.send_request = function (name, data, reject) {
        var stringify_data = this.json_stringify
            ? this.convert_json(data, 'stringify', reject)
            : data;
        this.send(name, stringify_data, data);
    };
    Swop.prototype.use = function (match, fun) {
        match === '*' && (match = 'all');
        var push_data = { match: match, fun: fun };
        this.middleware.push(push_data);
        return this;
    };
    Swop.prototype.call = function (name, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a = _this, store = _a.store, random_str = _a.random_str;
            var fun = _this.create_callback(name, resolve);
            var current_unit = store[name];
            var funUnit = {
                fun_body: fun,
                id: name + DELIMITER + random_str(),
            };
            var send_data = {
                origin_data: data,
                id: funUnit.id,
            };
            if (!current_unit) {
                _this.store[name] = {
                    funs: [funUnit],
                    queue: new queue_1.Queue(),
                };
            }
            else {
                current_unit.funs.push(funUnit);
            }
            _this.send_request(name, send_data, reject);
        });
    };
    Swop.prototype.response = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var _a = _this, store = _a.store, convert_json = _a.convert_json, json_parse = _a.json_parse;
            if (typeof data !== 'string' &&
                (typeof data !== 'object' || data === null)) {
                tool_1.warn("response data must be JSON string or javascript object");
            }
            if (json_parse) {
                data = convert_json(data, 'parse', reject);
            }
            var id = _this.get_id(data);
            var name = _this.get_name_by_id(id);
            var _b = store[name], funs = _b.funs, queue = _b.queue;
            if (store[name]) {
                queue.register(function (next) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    var compatible = {
                        fun_body: function () {
                            tool_1.warn('next Swop function is 【undefined】', true);
                            return false;
                        },
                    };
                    var current_call_fun = _this.search(name, id);
                    var next_Swop_fun = (funs[0] || compatible).fun_body;
                    if (current_call_fun) {
                        current_call_fun.apply(void 0, [next, next_Swop_fun, data].concat(args));
                        resolve(true);
                    }
                });
            }
        });
    };
    Swop.prototype.get_queue = function (name) {
        var compatible = this.store[name] || [{ queue: false }];
        return compatible.queue;
    };
    Swop.prototype.get_funs = function (name) {
        var compatible = this.store[name] || [{ funs: false }];
        return compatible.funs;
    };
    return Swop;
}(responsive_attr_1.DataContainer));
exports.Swop = Swop;
function CreateSwop(opions) {
    return new Swop(opions);
}
exports.CreateSwop = CreateSwop;
