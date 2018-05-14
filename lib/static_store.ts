import { Swop } from './swop';
import { Tool, warn } from './tool';

interface MonitorUint {
  fun: MonitorFun;
  once: boolean;
}

interface DataObserverTypes {
  [s: string]: MonitorUint[];
}

type PollingClump<R> = {
  [P in keyof R]: () => void;
}

export type MonitorFun = (new_value:any, old_value:any) => void;

export interface DataValue {
  [s: string]: any;
}

export type StaticData<I, R> = {
  [P in keyof R]: ContainerDataTypes<I, keyof R>;
}

export interface ContainerDataBaseTypes {
  get: () => any;
}

export interface ContainerDataTypes<I, D> extends ContainerDataBaseTypes {
  subscribe: (monitor_fun:MonitorFun, once?:boolean) => () => void ;
  unsubscribe: () => ContainerDataTypes<I, D>;
  polling (interface_name?:I | D, call_data?:any, hook_fun?:any) : () => void;
  set: (value:any) => ContainerDataTypes<I, D>;
}

export interface DataContainerClass<I, R, D> extends Tool {
  init () : void;
  get_container_context () : Tool;
  create (name:D, init_value?:any, read_only?:boolean) : Swop<I, R>;
  get_all_data () : DataValue;
  clear_polling (name?:keyof R) : Swop<I, R>;
}

export class DataContainer<I, R, D> extends Tool implements DataContainerClass<I, R, D> {
  public types: StaticData<I, R>;
  private states: DataValue;
  private observer: DataObserverTypes;
  private polling_clump: PollingClump<R>;


  private publish_observer (monitor_uint_arr:MonitorUint[], new_value:any, old_value:any) {
    if (!monitor_uint_arr) { return; }
    let i = 0;
    const length = monitor_uint_arr.length;

    for (; i < length; i++) {
      const unit:MonitorUint = monitor_uint_arr[i];
      unit.fun(new_value, old_value);
      if (unit.once) {
        monitor_uint_arr.splice(i, 1);
        i--;
      }
    }
  }

  private define_subscribe_data (name:D | string, init_value:any, read_only:boolean) : void {
    let old_value = init_value;  // 属性的实际值

    Object.defineProperty(this.states, <string>name, {
      configurable: false,
      enumerable: true,
      get: () => old_value,
      set: (new_value:any) => {
        if (read_only || (old_value === new_value)) { return; }

        // 触发 observer
        this.publish_observer(this.observer[<string>name], new_value, old_value);
        old_value = new_value;
      },
    });
  }

  private create_static_data (name:D | string , init_value:any, read_only:boolean) : void {
    // 当人为的改变上下文的时候，会产生闭包，保证 this 的正确指向，例如解构赋值
    const self = this;
    self.define_subscribe_data(name, init_value, read_only);

    if (read_only) {
      (<ContainerDataBaseTypes>self[<string>name]) = {
        get () {
          return self.states[<string>name];
        }
      }
      return;
    }

    (<ContainerDataTypes<I, D>>self[<string>name]) = {
      // 用于监听数据变化
      subscribe (monitor_fun:MonitorFun, once = false) {
        const obj:MonitorUint = {
          fun: monitor_fun,
          once,
        }

        if (self.observer[<string>name]) {
          self.observer[<string>name].push(obj);
        } else {
          self.observer[<string>name] = [obj];
        }

        return () => {
          let i = 0;
          const uints = self.observer[<string>name];
          const length = uints.length;

          for (; i < length; i++) {
            const unit:MonitorUint = uints[i];
            if (monitor_fun === unit.fun) {
              uints.splice(i, 1);
              return;
            }
          }
        };
      },
      unsubscribe () : ContainerDataTypes<I, D> {
        self.observer[<string>name] = [];
        return this;
      },
      polling (interface_name?:I | D, call_data?:any, hook_fun?:any) : () => void {
        !interface_name && (interface_name = <D>name);
        type S = Swop<I, R>;

        let is_can_polling = true;
        function start_polling (context) {
          (<S><any>self).call(<I>interface_name, call_data).then(([data, opts]) => {
            hook_fun && hook_fun(data);
            context.set(data);
            opts.next();

            is_can_polling && start_polling(context);
          });
        }

        start_polling(this);

        const clear = () => is_can_polling = false;
        self.polling_clump[<keyof R>name] = clear;

        return clear;
      },
      set (value:any) : ContainerDataTypes<I, D> {
        const new_value = {
          value,
          match: name,
        };

        // 中间件
        (<any>self).call_middleware(name, new_value);
        // 赋值
        self.states[<string>name] = new_value.value;

        return this;
      },
      get () {
        return self.states[<string>name];
      }
    }
  }

  public init () {
    this.states = {};
    this.observer = {};
    this.polling_clump = <any>{};
    this.types = <any>this;
  }

  public get_container_context () : Tool {
    let context = this;
    while (context.constructor !== DataContainer) {
      context = Object.getPrototypeOf(context);
    }

    return context;
  }

  public get_all_data () : DataValue {
    return this.states;
  }

  public create (name:D, init_value?:any, read_only = false) : Swop<I, R> {
    this.create_static_data(name, init_value, read_only);

    return <any>this;
  }

  public clear_polling (name?: keyof R) : Swop<I, R> {
    if (name) {
      this.polling_clump[name]()
      return <any>this;
    }

    const names = Object.keys(this.polling_clump);
    const length = names.length;
    let i = 0;

    for (; i < length; i++) {
      this.polling_clump[<keyof R>names[i]]();
    }

    return <any>this;
  }
}