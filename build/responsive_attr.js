"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var tool_1 = require("./tool");
var debug_1 = require("./debug");
var DataContainer = (function (_super) {
    tslib_1.__extends(DataContainer, _super);
    function DataContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DataContainer.prototype.publish_observer = function (monitor_uint_arr, new_value, old_value) {
        if (!monitor_uint_arr) {
            return;
        }
        var i = 0;
        var length = monitor_uint_arr.length;
        for (; i < length; i++) {
            var unit = monitor_uint_arr[i];
            unit.fun(new_value, old_value);
            if (unit.once) {
                monitor_uint_arr.splice(i, 1);
                i--;
            }
        }
    };
    DataContainer.prototype.define_subscribe_data = function (name, init_value, read_only) {
        var _this = this;
        var old_value = init_value;
        Object.defineProperty(this.states, name, {
            configurable: false,
            enumerable: true,
            get: function () { return old_value; },
            set: function (new_value) {
                if (read_only || (old_value === new_value)) {
                    return;
                }
                _this.publish_observer(_this.observer[name], new_value, old_value);
                old_value = new_value;
            },
        });
    };
    DataContainer.prototype.create_static_data = function (name, init_value, read_only) {
        var self = this;
        self.define_subscribe_data(name, init_value, read_only);
        if (read_only) {
            self[name] = {
                get: function () {
                    return self.states[name];
                }
            };
            return;
        }
        self[name] = {
            subscribe: function (monitor_fun, once) {
                if (once === void 0) { once = false; }
                var obj = {
                    fun: monitor_fun,
                    once: once,
                };
                if (self.observer[name]) {
                    self.observer[name].push(obj);
                }
                else {
                    self.observer[name] = [obj];
                }
                return function () {
                    var i = 0;
                    var uints = self.observer[name];
                    var length = uints.length;
                    for (; i < length; i++) {
                        var unit = uints[i];
                        if (monitor_fun === unit.fun) {
                            uints.splice(i, 1);
                            return;
                        }
                    }
                };
            },
            unsubscribe: function () {
                self.observer[name] = [];
                return this;
            },
            polling: function (interface_name, call_data, hook_fun) {
                !interface_name && (interface_name = name);
                var is_can_polling = true;
                var old_value = null;
                var repeat_times = 0;
                function start_polling(context) {
                    self.call(interface_name, call_data).then(function (_a) {
                        var data = _a[0], opts = _a[1];
                        if (repeat_times > 2 && (data === old_value)) {
                            setTimeout(function () {
                                opts.next();
                                is_can_polling && start_polling(context);
                            }, 1000);
                            return;
                        }
                        data === old_value
                            ? repeat_times++
                            : (repeat_times = 0);
                        old_value = data;
                        hook_fun && hook_fun(data);
                        context.set(data);
                        opts.next();
                        is_can_polling && start_polling(context);
                    });
                }
                start_polling(this);
                var clear = function () {
                    is_can_polling = false;
                    delete self.polling_clump[name];
                };
                self.polling_clump[name] = clear;
                return clear;
            },
            set: function (value) {
                var new_value = {
                    value: value,
                    match: name,
                };
                self.call_middleware(name, new_value);
                self.states[name] = new_value.value;
                return this;
            },
            get: function () {
                return self.states[name];
            }
        };
    };
    DataContainer.prototype.init = function () {
        this.states = {};
        this.observer = {};
        this.polling_clump = {};
        this.types = this;
    };
    DataContainer.prototype.get_container_context = function () {
        var context = this;
        while (context.constructor !== DataContainer) {
            context = Object.getPrototypeOf(context);
        }
        return context;
    };
    DataContainer.prototype.get_all_data = function () {
        return this.states;
    };
    DataContainer.prototype.create = function (name, init_value, read_only) {
        if (read_only === void 0) { read_only = false; }
        if (this.states.hasOwnProperty(name)) {
            debug_1.warn(this.onerror, "Bind attribute\u3010" + name + "\u3011already exists");
        }
        this.create_static_data(name, init_value, read_only);
        return this;
    };
    DataContainer.prototype.clear_polling = function (name) {
        if (name) {
            if (!this.polling_clump.hasOwnProperty(name)) {
                debug_1.warn(this.onerror, "Bind attribute\u3010" + name + "\u3011above no \"polling\" to clear");
            }
            this.polling_clump[name]();
            return this;
        }
        var names = Object.keys(this.polling_clump);
        var length = names.length;
        var i = 0;
        for (; i < length; i++) {
            this.polling_clump[names[i]]();
        }
        return this;
    };
    return DataContainer;
}(tool_1.Tool));
exports.DataContainer = DataContainer;
