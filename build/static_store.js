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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljX3N0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vbGliL3N0YXRpY19zdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsSUFBSSxFQUFRLE1BQU0sUUFBUSxDQUFDO0FBNENwQyxNQUFNLG9CQUE4QixTQUFRLElBQUk7SUFPdEMsZ0JBQWdCLENBQUUsZ0JBQThCLEVBQUUsU0FBYSxFQUFFLFNBQWE7UUFDcEYsRUFBRSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUM7UUFBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztRQUV2QyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2QixNQUFNLElBQUksR0FBZSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDZCxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM5QixDQUFDLEVBQUUsQ0FBQztZQUNOLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVPLHFCQUFxQixDQUFFLElBQWUsRUFBRSxVQUFjLEVBQUUsU0FBaUI7UUFDL0UsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDO1FBRTNCLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBVSxJQUFJLEVBQUU7WUFDL0MsWUFBWSxFQUFFLEtBQUs7WUFDbkIsVUFBVSxFQUFFLElBQUk7WUFDaEIsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLFNB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