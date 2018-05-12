import { Tool } from './tool';
export declare type MonitorFun = (new_value: any, old_value: any) => void;
export interface DataValue {
    [s: string]: any;
}
export declare type StaticData<R> = {
    [P in keyof R]: ContainerDataTypes;
};
export interface ContainerDataBaseTypes {
    get: () => any;
}
export interface ContainerDataTypes extends ContainerDataBaseTypes {
    subscribe: (monitor_fun: MonitorFun, once?: boolean) => () => void;
    remove_all_sub: () => ContainerDataTypes;
    set: (value: any) => ContainerDataTypes;
}
export interface DataContainerClass<I, R, D> extends Tool {
    init(): void;
    get_container_context(): Tool;
    create(name: D, init_value?: any, read_only?: boolean): DataContainer<I, R, D>;
    get_all_data(): DataValue;
}
export declare class DataContainer<I, R, D> extends Tool implements DataContainerClass<I, R, D> {
    types: StaticData<R>;
    private states;
    private observer;
    private publish_observer(monitor_uint_arr, new_value, old_value);
    private define_subscribe_data(name, init_value, read_only);
    private create_static_data(name, init_value, read_only);
    get_container_context(): DataContainer<I, R, D>;
    init(): void;
    get_all_data(): DataValue;
    create(name: D, init_value?: any, read_only?: boolean): DataContainer<I, R, D>;
}
