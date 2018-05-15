import { Tool } from './tool';
export class DataContainer extends Tool {
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
