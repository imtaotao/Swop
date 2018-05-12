import { RESOLVE, REJECT } from './tool';
import { DataContainer } from './static_store';
import { Queue, QueueTypes, UnitFun } from './queue';

type ThenAcceptTypes = [
  sendData,
  {
    next: UnitFun<any>;
    params: any[];
    nextSwopFun: storeFunBody;
  }
];

type Store<I> = {
  [S in keyof I]: SingleStroeQueue;
}

interface MiddlewareData<I, D> {
  match: I | 'all';
  fun: Middleware<I, D>;
}

export type storeFunBody = (
  nextSwopFun:storeFunBody,
  next:UnitFun<any>,
  data:any,
  ...params:any[]
) => void;

export interface FunUnit {
  fun_body: storeFunBody;
  id: string;
}


export interface SwopInitParam {
  stringify_json?: boolean;
  parse_json?: boolean;
}

export type MiddlewareAcceptValue<I, D> = {
  value: any;
  match: I | D;
}

export type send<I> = (name:I, stringify_data:string | sendData, data:sendData) => void;

export interface SingleStroeQueue {
  funs: FunUnit[];
  queue: QueueTypes;
}

export type Middleware<I, D> = (val:MiddlewareAcceptValue<I, D>) => void;

export interface sendData {
  origin_data: null | any;
	id: FunUnit['id'];
}

export interface SwopTypes<I, R, D> extends DataContainer<I, R, D> {
  use (match:I | D | '*', fun:Middleware<I, D>) : Swop<I, R>;
  response (data:sendData) : Promise<any>;
  call (name:I, data?:any) : Promise<any>;
  get_queue (name:I) : SingleStroeQueue['queue'];
  get_funs (name:I) : SingleStroeQueue['funs'];
}

const DELIMITER:string = '_:_';

// 类的实现
export class Swop<I, R, D = keyof R> extends DataContainer<I, R, D> implements SwopTypes<I, R, D> {
  readonly stringify_json:boolean;
  readonly parse_json:boolean;
  private store: Store<I> | any;
  private middleware: MiddlewareData<I, D>[];
  public send: send<I>;
  
  public constructor ({
      stringify_json = false,
      parse_json = false,
	} : SwopInitParam = {}) {
    super();
    this.store = {};
    this.middleware = [];
		this.stringify_json = stringify_json;
    this.parse_json = parse_json;
    this.send = () => {
      console.warn('You must override the 【send】 method --- from Swop.js.');
    }
    this.init();
  }

  private call_middleware (match:I, params:{value: any, match: I | D}) : void {
    let i = 0;
    const middleware = this.middleware;
    const length = middleware.length;

    for (; i < length; i++) {
      const mid = middleware[i];
      if (mid.match === match || mid.match === 'all') {
        mid.fun(params)
      }
    }
  }

  private create_callback (name:I, resolve:RESOLVE) : storeFunBody {
    return (nextSwopFun:storeFunBody, next:UnitFun<any>, data:sendData, ...params:any[]) => {
      const response_data:ThenAcceptTypes = [
        data.origin_data,
        {
          next,
          params,
          nextSwopFun,
        }
      ]

      this.call_middleware(name, {
        value: response_data,
        match: name
      });
      resolve(response_data);
    };
  }

  private search (name:I, id:FunUnit['id']) : any {
    if (typeof id !== 'string' || (id && !id.includes(<any>name))) {
      throw Error(`【${id}】is Invalid id  ---  from Swop.js.`);
    }
    const list = (<SingleStroeQueue>this.store[name]).funs || [];

    for (let i = 0, funUnit; funUnit = list[i]; i++) {
      if (id === funUnit.id) {
        return list.splice(i, 1)[0].fun_body;
      }
    }
  }

  private get_name_by_id (id:string) : I {
    return (<any>id.split(DELIMITER))[0];
  }

  private send_request (name:I, data:sendData, reject:REJECT) : void {
    const stringify_data = this.convert_json(data, 'stringify', reject);

    // native fun call
    this.send(name, stringify_data, data)
  }

  public use (match:I | D | '*', fun:Middleware<I, D>) : Swop<I, R> {
    match === '*' && ((<'all'>match) = 'all');
    const push_data:MiddlewareData<I, D> = { match:<any>match, fun };
    this.middleware.push(push_data);
    return <any>this;
  }

  public call (name:I, data = null) : Promise<any> {
    return new Promise((resolve, reject) => {
      const { store, random_str } = this;
      const fun = this.create_callback(name, resolve);

      const current_unit:SingleStroeQueue | undefined = store[name];
      const funUnit:FunUnit = {
        fun_body: fun,
        id: name + DELIMITER + random_str(),
      };

      const send_data:sendData = {
        origin_data: data,
        id: funUnit.id,
      };

      if (!current_unit) {
        this.store[name] = {
          funs: [funUnit],
          queue: new Queue(),
        }
      } else {
        current_unit.funs.push(funUnit);
      }

      this.send_request(name, send_data, reject);
    })
  }

  public response (data:sendData) : Promise<any> {
    return new Promise((resolve, reject) => {
      const { store, convert_json } = this;
    
      data = convert_json(data, 'parse', reject);

      const name = this.get_name_by_id(data.id);
      const { funs, queue } = <SingleStroeQueue>store[name];

      if (store[name]) {
        queue.register((next:UnitFun<any>, ...args) => {
          const compatible = {
            fun_body () {
              console.warn('next Swop function is 【undefined】 ---  from Swop.js.');
              return false;
            },
          }
          let current_call_fun = this.search(name, data.id);
          let next_Swop_fun:storeFunBody = (funs[0] || compatible).fun_body;

          if (current_call_fun) {
            current_call_fun(next_Swop_fun, next, data, ...args)
          }
        })
      }
    })
  }

  public get_queue (name: I) : SingleStroeQueue['queue'] {
    const compatible = <SingleStroeQueue>this.store[name] || { queue: false };
    return compatible.queue;
  }

  public get_funs (name: I) : SingleStroeQueue['funs'] {
    const compatible = <SingleStroeQueue>this.store[name] || { funs: false };
    return compatible.funs;
  }
}

export function CreateSwop<M> (...args) : M {
  return new (<any>Swop)(...args);
}