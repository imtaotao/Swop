export declare type endTypes = (...args: any[]) => void;
export declare type UnitFun<T> = (next: UnitFun<T>, ...args: T[]) => void;
export declare type RejisterFun<A> = (next: UnitFun<any>, ...args: A[]) => void;
export declare type QueueEndHook = (args: any[]) => void;
export interface QueueTypes {
    fx: UnitFun<any>[];
    end: endTypes;
    register<T>(fun: RejisterFun<T>): Queue;
    emit(...args: any[]): Queue;
    remove(start: number, end?: number): Queue;
}
export declare class Queue implements QueueTypes {
    fx: UnitFun<any>[];
    end: endTypes;
    private lock;
    private is_init_emit;
    constructor();
    register<A>(fun: RejisterFun<A>): Queue;
    emit(...args: any[]): Queue;
    remove(start: number, end?: number): Queue;
}
