export type endTypes = (...args:any[]) => void;

export type UnitFun<T> = (next:UnitFun<T>, ...args:T[]) => void;

export type RejisterFun<A> = (next:UnitFun<any>, ...args:A[]) => void;

export type QueueEndHook = (args: any[]) => void;

export interface QueueTypes {
  fx:UnitFun<any>[];
  end:endTypes;
  register<T> (fun:RejisterFun<T>) : Queue;
  emit (...args:any[]) : Queue;
  remove (start:number, end?:number) : Queue;
}


export class Queue implements QueueTypes {
  public fx:UnitFun<any>[];
  public end:endTypes;
  private lock:boolean;
  private is_init_emit:boolean;
  
  constructor () {
    this.fx = [];
    this.lock = false;
    this.is_init_emit = true;
    this.end = () => {};
  }

  public register<A> (fun:RejisterFun<A>) : Queue {
    const { fx, is_init_emit } = this;
    const queue_fun:UnitFun<any> = (next, ...args) => {
	    fun(next, ...args);
    }

    fx.push(queue_fun);

    if (is_init_emit) {
      this.lock = false;
      this.is_init_emit = false;
      this.emit();
    }

    return this;
  }

  public emit (...args:any[]) : Queue {
    const { fx, lock } = this;
    if (lock) { return this; }

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

  public remove (start:number, end = 1) : Queue {
    this.fx.splice(start, end);

    return this;
  }
}