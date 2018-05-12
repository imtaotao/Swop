import { DataContainer } from './static_store';
import { QueueTypes, UnitFun } from './queue';
export declare type storeFunBody = (nextSwopFun: storeFunBody, next: UnitFun<any>, data: any, ...params: any[]) => void;
export interface FunUnit {
    fun_body: storeFunBody;
    id: string;
}
export interface SwopInitParam {
    stringify_json?: boolean;
    parse_json?: boolean;
}
export declare type MiddlewareAcceptValue<I, D> = {
    value: any;
    match: I | D;
};
export declare type send<I> = (name: I, stringify_data: string | sendData, data: sendData) => void;
export interface SingleStroeQueue {
    funs: FunUnit[];
    queue: QueueTypes;
}
export declare type Middleware<I, D> = (val: MiddlewareAcceptValue<I, D>) => void;
export interface sendData {
    origin_data: null | any;
    id: FunUnit['id'];
}
export interface SwopTypes<I, R, D> extends DataContainer<I, R, D> {
    use(match: I | D | '*', fun: Middleware<I, D>): Swop<I, R>;
    response(data: sendData): Promise<any>;
    call(name: I, data?: any): Promise<any>;
    get_queue(name: I): SingleStroeQueue['queue'];
    get_funs(name: I): SingleStroeQueue['funs'];
}
export declare class Swop<I, R, D = keyof R> extends DataContainer<I, R, D> implements SwopTypes<I, R, D> {
    readonly stringify_json: boolean;
    readonly parse_json: boolean;
    private store;
    private middleware;
    send: send<I>;
    constructor({stringify_json, parse_json}?: SwopInitParam);
    private call_middleware(match, params);
    private create_callback(name, resolve);
    private search(name, id);
    private get_name_by_id(id);
    private send_request(name, data, reject);
    use(match: I | D | '*', fun: Middleware<I, D>): Swop<I, R>;
    call(name: I, data?: null): Promise<any>;
    response(data: sendData): Promise<any>;
    get_queue(name: I): SingleStroeQueue['queue'];
    get_funs(name: I): SingleStroeQueue['funs'];
}
export declare function CreateSwop<M>(...args: any[]): M;
