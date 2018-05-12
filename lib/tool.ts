import { sendData } from './swop';

export type IdentifierJson = 'stringify' | 'parse';

type randomNumTypes = () => number;

export type RESOLVE = (value?: any) => void;

export type REJECT = (reason?: any) => void;

export interface syncPromiseReturn{
  promise:Promise<never>;
  resolve:RESOLVE;
  reject:REJECT;
}

function sync_promise () : syncPromiseReturn {
  let resolve
  let reject

  const _promise:Promise<never> = new Promise((re, rj) => {
    resolve = re
    reject = rj
  })

  return { promise:_promise, resolve, reject }
}


function convert_json (data:sendData, identifier:IdentifierJson, reject:REJECT) : string | any {
  try {
    return (JSON[<string>identifier])(data);
  } catch (error) {
    reject(error);
    return data;
  }
}

// 生成随机字符串
function random_str (range?:number) : string;
function random_str (range = 16) {
  const chart_str:string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIGKMLNOPQRSTUVWSYZ_!~@#$%^&*()+=-><,.?/';
  const randomNum:randomNumTypes = () => parseInt(String(Math.random() * chart_str.length));
  let str:string = '';

  for (let i = 0; i < range; i++) {
    str += chart_str[randomNum()];
  }

  return str;
}

export interface ToolTypes {
  random_str: (range?:number) => string;
  sync_promise: () => syncPromiseReturn;
  convert_json: (data:any, identifier:IdentifierJson, reject:REJECT) => string | any;
}

export class Tool implements ToolTypes {
  constructor () {}

  public random_str (range?:number) : string {
    return random_str()
  };

  public sync_promise () : syncPromiseReturn {
    return sync_promise();
  }

  public convert_json (data:any, identifier:IdentifierJson, reject:REJECT) : string | any {
    return convert_json(data, identifier, reject);
  }
}
