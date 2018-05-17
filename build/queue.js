"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Queue = (function () {
    function Queue() {
        this.fx = [];
        this.lock = false;
        this.is_init_emit = true;
        this.end = function () { };
    }
    Queue.prototype.register = function (fun) {
        var _a = this, fx = _a.fx, is_init_emit = _a.is_init_emit;
        var queue_fun = function (next) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            fun.apply(void 0, [next].concat(args));
        };
        fx.push(queue_fun);
        if (is_init_emit) {
            this.lock = false;
            this.is_init_emit = false;
            this.emit();
        }
        return this;
    };
    Queue.prototype.emit = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _a = this, fx = _a.fx, lock = _a.lock;
        if (lock) {
            return this;
        }
        if (!fx.length) {
            this.end.apply(this, args);
            this.is_init_emit = true;
            return this;
        }
        var current_fun = fx.shift();
        if (current_fun) {
            this.lock = true;
            current_fun.apply(void 0, [function () {
                    var params = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        params[_i] = arguments[_i];
                    }
                    _this.lock = false;
                    _this.emit.apply(_this, params);
                }].concat(args));
        }
        return this;
    };
    Queue.prototype.remove = function (start, end) {
        if (end === void 0) { end = 1; }
        this.fx.splice(start, end);
        return this;
    };
    return Queue;
}());
exports.Queue = Queue;
