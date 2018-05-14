export class Queue {
    constructor() {
        this.fx = [];
        this.lock = false;
        this.is_init_emit = true;
        this.end = () => { };
    }
    register(fun) {
        const { fx, is_init_emit } = this;
        const queue_fun = (next, ...args) => {
            fun(next, ...args);
        };
        fx.push(queue_fun);
        if (is_init_emit) {
            this.lock = false;
            this.is_init_emit = false;
            this.emit();
        }
        return this;
    }
    emit(...args) {
        const { fx, lock } = this;
        if (lock) {
            return this;
        }
        if (!fx.length) {
            this.end(...args);
            this.is_init_emit = true;
            return this;
        }
        const current_fun = fx.shift();
        if (current_fun) {
            this.lock = true;
            current_fun((...params) => {
                this.lock = false;
                this.emit(...params);
            }, ...args);
        }
        return this;
    }
    remove(start, end = 1) {
        this.fx.splice(start, end);
        return this;
    }
}
