"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tool_1 = require("./tool");
class DataContainer extends tool_1.Tool {
    publish_observer(monitor_uint_arr, new_value, old_value) {
        if (!monitor_uint_arr) {
            return;
        }
        let i = 0;
        const length = monitor_uint_arr.length;
        for (; i < length; i++) {
            const unit = monitor_uint_arr[i];
            unit.fun(new_value, old_value);
            if (unit.once) {
                monitor_uint_arr.splice(i, 1);
                i--;
            }
        }
    }
    define_subscribe_data(name, init_value, read_only) {
        let old_value = init_value;
        Object.defineProperty(this.states, name, {
            configurable: false,
            enumerable: true,
            get: () => old_value,
            set: (new_value) => {
                if (read_only || (old_value === new_value)) {
                    return;
                }
                this.publish_observer(this.observer[name], new_value, old_value);
                old_value = new_value;
            },
        });
    }
    create_static_data(name, init_value, read_only) {
        const self = this;
        self.define_subscribe_data(name, init_value, read_only);
        if (read_only) {
            self[name] = {
                get() {
                    return self.states[name];
                }
            };
            return;
        }
        self[name] = {
            subscribe(monitor_fun, once = false) {
                const obj = {
                    fun: monitor_fun,
                    once,
                };
                if (self.observer[name]) {
                    self.observer[name].push(obj);
                }
                else {
                    self.observer[name] = [obj];
                }
                return () => {
                    let i = 0;
                    const uints = self.observer[name];
                    const length = uints.length;
                    for (; i < length; i++) {
                        const unit = uints[i];
                        if (monitor_fun === unit.fun) {
                            uints.splice(i, 1);
                            return;
                        }
                    }
                };
            },
            unsubscribe() {
                self.observer[name] = [];
                return this;
            },
            polling(interface_name, call_data, hook_fun) {
                !interface_name && (interface_name = name);
                let is_can_polling = true;
                let old_value = null;
                let repeat_times = 0;
                function start_polling(context) {
                    self.call(interface_name, call_data).then(([data, opts]) => {
                        if (repeat_times > 2 && (data === old_value)) {
                            setTimeout(() => {
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
                const clear = () => is_can_polling = false;
                self.polling_clump[name] = clear;
                return clear;
            },
            set(value) {
                const new_value = {
                    value,
                    match: name,
                };
                self.call_middleware(name, new_value);
                self.states[name] = new_value.value;
                return this;
            },
            get() {
                return self.states[name];
            }
        };
    }
    init() {
        this.states = {};
        this.observer = {};
        this.polling_clump = {};
        this.types = this;
    }
    get_container_context() {
        let context = this;
        while (context.constructor !== DataContainer) {
            context = Object.getPrototypeOf(context);
        }
        return context;
    }
    get_all_data() {
        return this.states;
    }
    create(name, init_value, read_only = false) {
        this.create_static_data(name, init_value, read_only);
        return this;
    }
    clear_polling(name) {
        if (name) {
            this.polling_clump[name]();
            return this;
        }
        const names = Object.keys(this.polling_clump);
        const length = names.length;
        let i = 0;
        for (; i < length; i++) {
            this.polling_clump[names[i]]();
        }
        return this;
    }
}
exports.DataContainer = DataContainer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3N0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliL3N0YXRpY19zdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLGlDQUFvQztBQTRDcEMsbUJBQW9DLFNBQVEsV0FBSTtJQU90QyxnQkFBZ0IsQ0FBRSxnQkFBOEIsRUFBRSxTQUFhLEVBQUUsU0FBYTtRQUNwRixFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1FBRXZDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sSUFBSSxHQUFlLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNkLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzlCLENBQUMsRUFBRSxDQUFDO1lBQ04sQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRU8scUJBQXFCLENBQUUsSUFBZSxFQUFFLFVBQWMsRUFBRSxTQUFpQjtRQUMvRSxJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUM7UUFFM0IsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFVLElBQUksRUFBRTtZQUMvQyxZQUFZLEVBQUUsS0FBSztZQUNuQixVQUFVLEVBQUUsSUFBSTtZQUNoQixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUztZQUNwQixHQUFHLEVBQUUsQ0FBQyxTQUFhLEVB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