import { warn } from './tool';
import { DataContainer } from './static_store';
import { Queue } from './queue';
const DELIMITER = '_:_';
const ID_REG = new RegExp(`,?"id":"[^}]+${DELIMITER}.+_:_swopid",?`, 'g');
export class Swop extends DataContainer {
    constructor({ json_stringify = false, json_parse = false, } = {}) {
        super();
        this.store = {};
        this.middleware = [];
        this.json_stringify = json_stringify;
        this.json_parse = json_parse;
        this.send = () => {
            warn('You must override the 【send】 method', true);
        };
        this.init();
    }
    call_middleware(match, params) {
        let i = 0;
        const middleware = this.middleware;
        const length = middleware.length;
        for (; i < length; i++) {
            const mid = middleware[i];
            if (mid.match === match || mid.match === 'all') {
                mid.fun(params);
            }
        }
    }
    create_callback(name, resolve) {
        return (next, nextSwopFun, data, ...params) => {
            const response_data = [
                this.get_json_origin_data(data),
                {
                    next,
                    params,
                    nextSwopFun,
                }
            ];
            this.call_middleware(name, {
                value: response_data,
                match: name
            });
            resolve(response_data);
        };
    }
    search(name, id) {
        if (typeof id !== 'string' || (id && !id.includes(name))) {
            warn(`【${id}】is invalid id`);
        }
        const list = this.store[name].funs || [];
        for (let i = 0, funUnit; funUnit = list[i]; i++) {
            if (id === funUnit.id) {
                return list.splice(i, 1)[0].fun_body;
            }
        }
    }
    get_name_by_id(id) {
        return id.split(DELIMITER)[0];
    }
    get_id(data) {
        if (typeof data === 'string') {
            if (!data.includes('origin_data' || !data.includes('swopid'))) {
                warn('The response data must contain 【origin_data】 and 【id】');
            }
            const ID_GROUP_REG = new RegExp(`(,?"id":")([^}]+${DELIMITER}.+_:_swopid)"(,?)`, 'g');
            const match = ID_GROUP_REG.exec(data);
            if (!match || (match && !match[2])) {
                warn(`Invalid id`);
            }
            return match[2];
        }
        return data.id;
    }
    get_json_origin_data(data) {
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
    send_request(name, data, reject) {
        const stringify_data = this.json_stringify
            ? this.convert_json(data, 'stringify', reject)
            : data;
        this.send(name, stringify_data, data);
    }
    use(match, fun) {
        match === '*' && (match = 'all');
        const push_data = { match: match, fun };
        this.middleware.push(push_data);
        return this;
    }
    call(name, data = null) {
        return new Promise((resolve, reject) => {
            const { store, random_str } = this;
            const fun = this.create_callback(name, resolve);
            const current_unit = store[name];
            const funUnit = {
                fun_body: fun,
                id: name + DELIMITER + random_str(),
            };
            const send_data = {
                origin_data: data,
                id: funUnit.id,
            };
            if (!current_unit) {
                this.store[name] = {
                    funs: [funUnit],
                    queue: new Queue(),
                };
            }
            else {
                current_unit.funs.push(funUnit);
            }
            this.send_request(name, send_data, reject);
        });
    }
    response(data) {
        return new Promise((resolve, reject) => {
            const { store, convert_json, json_parse } = this;
            if (typeof data !== 'string' &&
                (typeof data !== 'object' || data === null)) {
                warn(`response data must be JSON string or javascript object`);
            }
            if (json_parse) {
                data = convert_json(data, 'parse', reject);
            }
            const id = this.get_id(data);
            const name = this.get_name_by_id(id);
            const { funs, queue } = store[name];
            if (store[name]) {
                queue.register((next, ...args) => {
                    const compatible = {
                        fun_body() {
                            warn('next Swop function is 【undefined】', true);
                            return false;
                        },
                    };
                    let current_call_fun = this.search(name, id);
                    let next_Swop_fun = (funs[0] || compatible).fun_body;
                    if (current_call_fun) {
                        current_call_fun(next, next_Swop_fun, data, ...args);
                    }
                });
            }
        });
    }
    get_queue(name) {
        const compatible = this.store[name] || [{ queue: false }];
        return compatible.queue;
    }
    get_funs(name) {
        const compatible = this.store[name] || [{ funs: false }];
        return compatible.funs;
    }
}
export function CreateSwop(opions) {
    return new Swop(opions);
}
