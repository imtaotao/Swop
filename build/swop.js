import { DataContainer } from './static_store';
import { Queue } from './queue';
const DELIMITER = '_:_';
export class Swop extends DataContainer {
    constructor({ stringify_json = false, parse_json = false, } = {}) {
        super();
        this.store = {};
        this.middleware = [];
        this.stringify_json = stringify_json;
        this.parse_json = parse_json;
        this.send = () => {
            console.warn('You must override the 【send】 method --- from Swop.js.');
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
        return (nextSwopFun, next, data, ...params) => {
            const response_data = [
                data.origin_data,
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
            throw Error(`【${id}】is Invalid id  ---  from Swop.js.`);
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
    send_request(name, data, reject) {
        const stringify_data = this.convert_json(data, 'stringify', reject);
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
            const { store, convert_json } = this;
            data = convert_json(data, 'parse', reject);
            const name = this.get_name_by_id(data.id);
            const { funs, queue } = store[name];
            if (store[name]) {
                queue.register((next, ...args) => {
                    const compatible = {
                        fun_body() {
                            console.warn('next Swop function is 【undefined】 ---  from Swop.js.');
                            return false;
                        },
                    };
                    let current_call_fun = this.search(name, data.id);
                    let next_Swop_fun = (funs[0] || compatible).fun_body;
                    if (current_call_fun) {
                        current_call_fun(next_Swop_fun, next, data, ...args);
                    }
                });
            }
        });
    }
    get_queue(name) {
        const compatible = this.store[name] || { queue: false };
        return compatible.queue;
    }
    get_funs(name) {
        const compatible = this.store[name] || { funs: false };
        return compatible.funs;
    }
}
export function CreateSwop(...args) {
    return new Swop(...args);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dvcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi9zd29wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsS0FBSyxFQUF1QixNQUFNLFNBQVMsQ0FBQztBQWlFckQsTUFBTSxTQUFTLEdBQVUsS0FBSyxDQUFDO0FBRy9CLE1BQU0sV0FBK0IsU0FBUSxhQUFzQjtJQU9qRSxZQUFvQixFQUNoQixjQUFjLEdBQUcsS0FBSyxFQUN0QixVQUFVLEdBQUcsS0FBSyxNQUNILEVBQUU7UUFDbkIsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztRQUNuQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRTtZQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsdURBQXVELENBQUMsQ0FBQztRQUN4RSxDQUFDLENBQUE7UUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRU8sZUFBZSxDQUFFLEtBQU8sRUFBRSxNQUFpQztRQUNqRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFFakMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDdkIsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUss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