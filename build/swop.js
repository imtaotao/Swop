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
                        resolve(true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dvcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi9zd29wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBbUIsSUFBSSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsS0FBSyxFQUF1QixNQUFNLFNBQVMsQ0FBQztBQWtFckQsTUFBTSxTQUFTLEdBQVUsS0FBSyxDQUFDO0FBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLGdCQUFnQixTQUFTLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBRzFFLE1BQU0sV0FBK0IsU0FBUSxhQUFzQjtJQU9qRSxZQUFvQixFQUNoQixjQUFjLEdBQUcsS0FBSyxFQUN0QixVQUFVLEdBQUcsS0FBSyxNQUNILEVBQUU7UUFDbkIsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRTtZQUNmLElBQUksQ0FBQyxxQ0FBcUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwRCxDQUFDLENBQUE7UUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRU8sZUFBZSxDQUFFLEtBQU8sRUFBRSxNQUFpQztRQUNqRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFFakMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcs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