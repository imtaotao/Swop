export declare type IdentifierJson = 'stringify' | 'parse';
export declare type RESOLVE = (value?: any) => void;
export declare type REJECT = (reason?: any) => void;
export interface syncPromiseReturn {
    promise: Promise<never>;
    resolve: RESOLVE;
    reject: REJECT;
}
export interface ToolTypes {
    random_str: (range?: number) => string;
    sync_promise: () => syncPromiseReturn;
    convert_json: (data: any, identifier: IdentifierJson, reject: REJECT) => string | any;
}
export declare class Tool implements ToolTypes {
    random_str(range?: number): string;
    sync_promise(): syncPromiseReturn;
    convert_json(data: any, identifier: IdentifierJson, reject: REJECT): string | any;
}
export declare function warn(error_text: string, is_warn?: boolean): void;
