"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sync_promise() {
    var resolve;
    var reject;
    var _promise = new Promise(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
    });
    return { promise: _promise, resolve: resolve, reject: reject };
}
function convert_json(data, identifier, reject) {
    try {
        return (JSON[identifier])(data);
    }
    catch (error) {
        reject(error);
        return data;
    }
}
function random_str(range) {
    if (range === void 0) { range = 16; }
    var chart_str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIGKMLNOPQRSTUVWSYZ_!~@#$%^&*()+=-><,.?/';
    var randomNum = function () { return parseInt(String(Math.random() * chart_str.length)); };
    var str = '';
    for (var i = 0; i < range; i++) {
        str += chart_str[randomNum()];
    }
    return str + '_:_swopid';
}
var Tool = (function () {
    function Tool() {
    }
    Tool.prototype.random_str = function (range) {
        return random_str();
    };
    Tool.prototype.sync_promise = function () {
        return sync_promise();
    };
    Tool.prototype.convert_json = function (data, identifier, reject) {
        return convert_json(data, identifier, reject);
    };
    return Tool;
}());
exports.Tool = Tool;
function warn(error_text, is_warn) {
    if (is_warn === void 0) { is_warn = false; }
    var message = error_text + " --- from Swop.js.";
    if (!is_warn) {
        throw Error(message);
    }
    console.warn(message);
}
exports.warn = warn;
