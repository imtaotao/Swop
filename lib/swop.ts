import { RESOLVE, REJECT, warn } from './tool';
import { DataContainer } from './responsive_attr';
import { Queue, QueueTypes, UnitFun } from './queue';

type ThenAcceptTypes = [
  sendData,
  {
    next: UnitFun<any>;
    params: any[];
    nextSwopFun: storeFunBody;
  }
];


interface MiddlewareData<I, D> {
  match: I | 'all';
  fun: Middleware<I, D>;
}

export type Store<I> = {
  [S in keyof I]: SingleStroeQueue;
}

export type storeFunBody = (
  next: UnitFun<any>,
  nextSwopFun: storeFunBody,
  data: any,
  ...params:any[]
) => void;

export interface FunUnit {
  fun_body: storeFunBody;
  id: string;
}


export interface SwopInitParam {
  json_stringify?: boolean;
  json_parse?: boolean;
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
  origin_data: any;
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
const ID_REG = new RegExp(`,?"id":"[^}]+${DELIMITER}.+_:_swopid",?`, 'g');

// 类的实现
export class Swop<I, R, D = keyof R> extends DataContainer<I, R, D> implements SwopTypes<I, R, D> {
  readonly json_stringify:boolean;
  readonly json_parse:boolean;
  public store: Store<I> | any;
  private middleware: MiddlewareData<I, D>[];
  public send: send<I>;
  
  public constructor ({
      json_stringify = false,
      json_parse = false,
	} : SwopInitParam = {}) {
    super();
    this.store = {};
    this.middleware = [];
		this.json_stringify = json_stringify;
    this.json_parse = json_parse;
    this.send = () => {
      warn('You must override the 【send】 method', true);
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
    return (next:UnitFun<any>, nextSwopFun:storeFunBody, data:sendData, ...params:any[]) => {
      const response_data:ThenAcceptTypes = [
        this.get_json_origin_data(data),
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

  private search (name:I, id:FunUnit['id']) : FunUnit['fun_body'] | any {
    if (typeof id !== 'string' || (id && !id.includes(<any>name))) {
      warn(`【${id}】is invalid id`);
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

  private get_id (data:sendData | string) : FunUnit['id'] {
    if (typeof data === 'string') {
      if (!data.includes('origin_data' || !data.includes('swopid'))) {
        warn('The response data must contain 【origin_data】 and 【id】');
      }

      const ID_GROUP_REG = new RegExp(`(,?"id":")([^}]+${DELIMITER}.+_:_swopid)"(,?)`, 'g');
      const match = ID_GROUP_REG.exec(data);

      if (!match || (match && !match[2])) {
        warn(`Invalid id`);
      }

      return (<any>match)[2];
    }

    return (<sendData>data).id;
  }

  private get_json_origin_data (data:string | any) : string | sendData['origin_data'] {
    if (typeof data === 'string') {
      data = data.replace(ID_REG, '');
      const match = /({?"origin_data":)(.+)}(,.*)!?/g.exec(data);
      
      if (!match) {
        return data.replace(/({?"origin_data":)(.+)}/g, (k1, k2, k3) => k3);
      }

      return match[2];
    }
    
    return data.origin_data;
  }

  private send_request (name:I, data:sendData, reject:REJECT) : void {
    const stringify_data = this.json_stringify
      ? this.convert_json(data, 'stringify', reject)
      : data;

    // native fun call
    this.send(name, stringify_data, data)
  }

  public use (match:I | D | '*', fun:Middleware<I, D>) : Swop<I, R> {
    match === '*' && ((<'all'>match) = 'all');
    const push_data:MiddlewareData<I, D> = { match:<any>match, fun };
    this.middleware.push(push_data);
    return <any>this;
  }

  public call (name:I, data?:any) : Promise<any> {
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

  public response (data:sendData | string) : Promise<any> {
    return new Promise((resolve, reject) => {
      const { store, convert_json, json_parse } = this;
      
      if (
          typeof data !== 'string' &&
          (typeof data !== 'object' || data === null)
      ) {
        warn(`response data must be JSON string or javascript object`);
      }

      if (json_parse) {
        data = convert_json(data, 'parse', reject);
      }

      const id = this.get_id(data);
      const name = this.get_name_by_id(id);
      const { funs, queue } = <SingleStroeQueue>store[name];

      if (store[name]) {
        queue.register((next:UnitFun<any>, ...args) => {
          const compatible = {
            fun_body () {
              warn('next Swop function is 【undefined】', true);
              return false;
            },
          }
          let current_call_fun = this.search(name, id);
          let next_Swop_fun:storeFunBody = (funs[0] || compatible).fun_body;

          if (current_call_fun) {
            current_call_fun(next, next_Swop_fun, data, ...args);
            resolve(true);
          }
        })
      }
    })
  }

  public get_queue (name: I) : SingleStroeQueue['queue'] {
    const compatible = <SingleStroeQueue>this.store[name] || [{ queue: false }];
    return compatible.queue;
  }

  public get_funs (name: I) : SingleStroeQueue['funs'] {
    const compatible = <SingleStroeQueue>this.store[name] || [{ funs: false }];
    return compatible.funs;
  }
}

export function CreateSwop<M> (opions:SwopInitParam) : M {
  return new (<any>Swop)(opions);
}