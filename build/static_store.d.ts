import { Swop } from './swop';
import { Tool } from './tool';
export declare type MonitorFun = (new_value: any, old_value: any) => void;
export interface DataValue {
    [s: string]: any;
}
export declare type StaticData<I, R> = {
    [P in keyof R]: ContainerDataTypes<I, keyof R>;
};
export interface ContainerDataBaseTypes {
    get: () => any;
}
export interface ContainerDataTypes<I, D> extends ContainerDataBaseTypes {
    subscribe: (monitor_fun: MonitorFun, once?: boolean) => () => void;
    remove_all_sub: () => ContainerDataTypes<I, D>;
    polling(interface_name?: I | D, call_data?: any, hook_fun?: any): () => void;
    set: (value: any) => ContainerDataTypes<I, D>;
}
export interface DataContainerClass<I, R, D> extends Tool {
    init(): void;
    get_container_context(): Tool;
    create(name: D, init_value?: any, read_only?: boolean): Swop<I, R>;
    get_all_data(): DataValue;
    clear_polling(name?: keyof R): Swop<I, R>;
}
export declare class DataContainer<I, R, D> extends Tool implements DataContainerClass<I, R, D> {
    types: StaticData<I, R>;
    private states;
    private observer;
    private polling_clump;
    private publish_observer(monitor_uint_arr, new_value, old_value);
    private define_subscribe_data(name, init_value, read_only);
    private create_static_data(name, init_value, read_only);
    init(): void;
    get_container_context(): Tool;
    get_all_data(): DataValue;
    create(name: D, init_value?: any, read_only?: boolean): Swop<I, R>;
    clear_polling(name?: keyof R): Swop<I, R>;
}
