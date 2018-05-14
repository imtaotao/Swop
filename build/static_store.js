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
                function start_polling(context) {
                    self.call(interface_name, call_data).then(([data, opts]) => {
                        if (data === old_value) {
                            setTimeout(() => {
                                opts.next();
                                is_can_polling && start_polling(context);
                            }, 1000);
                            return;
                        }
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