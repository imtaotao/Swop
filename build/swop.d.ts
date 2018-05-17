import { DataContainer } from './static_store';
import { QueueTypes, UnitFun } from './queue';
export declare type Store<I> = {
    [S in keyof I]: SingleStroeQueue;
};
export declare type storeFunBody = (next: UnitFun<any>, nextSwopFun: storeFunBody, data: any, ...params: any[]) => void;
export interface FunUnit {
    fun_body: storeFunBody;
    id: string;
}
export interface SwopInitParam {
    json_stringify?: boolean;
    json_parse?: boolean;
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
    origin_data: any;
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
    readonly json_stringify: boolean;
    readonly json_parse: boolean;
    store: Store<I> | any;
    private middleware;
    send: send<I>;
    constructor({json_stringify, json_parse}?: SwopInitParam);
    private call_middleware(match, params);
    private create_callback(name, resolve);
    private search(name, id);
    private get_name_by_id(id);
    private get_id(data);
    private get_json_origin_data(data);
    private send_request(name, data, reject);
    use(match: I | D | '*', fun: Middleware<I, D>): Swop<I, R>;
    call(name: I, data?: any): Promise<any>;
    response(data: sendData | string): Promise<any>;
    get_queue(name: I): SingleStroeQueue['queue'];
    get_funs(name: I): SingleStroeQueue['funs'];
}
export declare function CreateSwop<M>(opions: SwopInitParam): M;
