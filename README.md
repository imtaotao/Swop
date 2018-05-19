# Welcome to the Swop  🎉🎉🎉

### [npm][npm_Swop]

swop 是一个用于`JavaScript`与客户端进行数据交互应用程序，他提供了简洁的`api`来帮助开发者来做这些事情。

## swop 的来源
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
在我们与客户端交互的时候，大量的数据散落在项目各个文件，或者集中于繁琐的`redux`和`window`对象之中，管理维护困难，操作麻烦，使得开发效率很低。

## swop 要解决什么样的问题
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
swop 使用 [`aop`][aop_wiki] 的理念进行设计开发，通过对于数据的拦截来做一些事情，swop 内置了中间件，参考一下`express`和`redux`的`middleware`，但不同的是 swop 的`middleware`没有next函数，swop 能让开发者更好的处理数据，更好的异步和错误处理。

## API
### options
  - **json_stringify**：
  与客户端交互时是否让 swop 对传输的数据进行json stringify，默认值为 `false`。

  - **json_parse**：
  客户端响应时是否让 swop 对传输的数据进行json parse，默认值为 `false`。

### swop 类 api
  - [`call(name, [data])`][call]
  - [`response(data)`][response]
  - [`create(attr_name, [default_value], [read_only])`][create]
  - [`use(name, fun)`][use]
  - [`get_all_data()`][get_all_data]
  - [`get_queue(name)`][get_queue]
  - [`get_funs(name)`][get_funs]
  - [`clear_polling([name])`][clear_polling]

### 绑定属性 api
  - [`get()`][get]
  - [`set(value)`][set]
  - [`subscribe(fun)`][subscribe]
  - [`unsubscribe()`][unsubscribe]
  - [`polling([name], [data], [fun])`][polling]

### 实例化 swop
swop 可以通过两种方式来实例化。

```javascript
  import { Swop, CreateSwop } from 'swop-data';

  const S = new Swop(options);

  // 或者你可以用 swop 提供的创建实例的函数
  const S = CreateSwop(options);

  S.create('dataOne', 1);

  S.dataOne.set(2).get();
```
如果你是用`typescript`进行的开发
```typescript
  import {
    Swop,
    CreateSwop,
    ContainerDataTypes as C,
  } from 'swop-data';

  export type A = C<I, keyof D>;

  // 需要的接口在这里添加
  export type I =
    'interfaceOne' |
    'interfaceTwo';

  // 实时变化数据存储容器
  export type D = {
    'dataOne': A;
    'dataTwo': A;
    'dataThree': A;
  }

  // 通过 new 来创建的实例，在调用 create 方法
  // 绑定数据后，没有办法通过实例拿到绑定属性的类型
  const S = new Swop<I, D>(options);
  S.creata('dataOne');
  // 这种情况下 dataOne 的类型没有办法推断出来，但有两种办法可以拿到绑定数据的类型
  //  S.dataOne.XX

  // 第一种，使用 types 属性
  S.types.dataOne.get();

  // 第二种，用 swop 提供的实例函数来创建实例
  interface _Swop extends Swop<I, D>, D {}
  const S = CreateSwop<_Swop>(options);
  S.dataOne.get();

  // 如果你不需要知道绑定属性的类型，你可以这样写
  S['dataOne'].get();
```
## swop 类 api
### call
call 方法是于客户端进行通信的入口函数，他需要传入一个name字符和需要发送的数据。

```javascript
  // name 是于客户端交互的接口名
  // data 传输给客户端的数据，默认为 null
  // call 方法会返回一个 promise
  // value 是客户端返回数据
  S.call(name, data).then(([value, args]) => {
    ...
    args.next();
  }).catch(err => {
    ...
  })

  // 如果不需要对错误进行处理，你可以使用 AsyncFunction 进行更好的流程处理
  async function call_height () {
    const data = await S.call(name, data)
    ...
  }
```

```javascript
  // 客户端的响应会以队列的形式进行触发，所以你可以这里对数据做一些传递
  S.call(name).then(([value, args]) => {
    /**
     * 我们可以在这里拿到客户端的下一次响应
     * args 有三个值
     *  next : 下一次的响应（如果当前环境正在被调用，而下一次响应还没有到达，此时next是一个空函数）不管next函数是否是一个空函数，都必须调用，否则可能会出现下一次响应没有办法触发的情况
     *  params : 上一次传过来的数据
     *  nextSwopFun : 下一次的 call
     */

    args.next(`上一次的响应值为：${value}`);
  })
```

### response
response 方法是客户端的入口函数。返回一个promise。

```javascript
  // 我们假设客户端响应统一在 window 上的 callback 方法上
  window.callback = data => S.response(data);

  // or
  window.callback = data => {
    S.response(data).then(_ => {
      console.log('success');
    }).catch(err => {
      ...
    })
  };
```

### create
create 方法会创建一个绑定属性和绑定数据，返回值为`this`。

```javascript
   // attr_name : 绑定数据名
   // default_value : 创建绑定数据时默认值
   // read_only : 数据是否只读
   // 需要注意的是，当创建的数据是只读数据时，直接修改此数据的值也是不被允许的
  S.create(attr_name, default_value, read_only)
   .create(attr_name);

  // 当创建一个绑定属性后，会在 swop 实例上生成一同名的绑定属性
  // 需要注意的事项可以看实例化时的注释
```

### use
use 方法是 swop 提供的一个中间件函数，你可以通过 use 方法来注入一些中间件，中间件的注入与*先后顺序*相关，use 方法返回的是`this`，所以你可以像 jQuery 那样链式调用。

```javascript
  // name match字符，接口名或者'*'，当为通配符的时候，所有的接口都会匹配上
  // val 有两个属性 value 和 match
  S.use(name, val => {
    // 需要注意的是，use 方法的回调参数，swop 改成了引用的方式，所以你不需要纠结这里怎么没有`return`关键字
    // 当然，这里如果你要对响应数据做些修改，你不应该用解构，除非你要做的事情与源数据没什么关系
    if (typeof val.value === 'string') {
      val.value = JSON.parse(val.value);
    }
  })

  // bad
  S.use(name, [value, match] => {
    ...
  })
```

### get_all_data
get_all_data 能够获取所有的绑定数据。

```javascript
  const all_data = S.get_all_data();
```

### get_queue
swop 把当前接口的所有客户端响应都放到一个队列里面，get_queue 方法会返回当前接口的客户端响应队列。

```javascript
  const queqe = S.get_queue(name);
```

### get_funs
当调用 call 方法与客户端进行数据交互时，会生成一个接收客户端响应的集合，每个集合由一个`fun_body`和`id`组成。get_funs 能够得到当前接口的所有集合。

```javascript
  const funs = S.get_funs(name);

  // 手动响应
  const ids = funs.map(val => val.id);
  ids.forEach((id, i) => {
    S.response(JSON.stringify({
      id,
      origin_data: {
        xx: 'xxx',
      }
    }))
  })
```

### clear_polling
clear_polling 方法清除绑定属性的轮询。如果`name`为空，则清空所有绑定属性的轮询，返回值为`this`。

```javascript
  S.clear_polling(name);
  // or
  S.clear_polling();
```


## 绑定属性 api
当通过[`create`][create] api 创建一个静态属性后，每个静态属性都会生成对应的方法，需要注意的是当生成的绑定数据是`readOnly`时，当前绑定属性只有`get`方法。

- 假定以下 **api** 描述的绑定属性名为 dataOne。
### get
```javascript
  const data = S.dataOne.get();
```

### set
set 方法会给当前绑定数据重新赋值，返回值是当前绑定属性
```javascript
  S.dataOne.set(1);
  // or
  S.dataOne.set(1).get();

  // 我们可以通过中间件做一些数据的更改
  S.use('dataOne', val => val.value *= 100);

  S.dataOne.set(1).get(); // 100

  // 但是最常用的应该是客户端数据上报时用，假定客户端上报于 window.report
  window.report = (data_name, data) => {
    S[data_name].set(data);
  }
```

当跟改数据时，虽然 swop 对榜单数据的值直接变动也能监听，但是正确的做法应该通过 set 方法来赋值。
```javascript
  // 绑定数据直接赋值也能被监听到
  S.dataOne.subscribe(new_value => {
    ...
  })

  S.get_all_data().dataOne = 1;

```

### subscribe
subscribe 方法会对绑定数据进行监听，返回一个 remove 函数，用于注销当前的监听。

```javascript
  // S.dataOne.subscribe(fun, once);
  // fun : 监听回调接受两个参数，分别为新值和旧值
  // once : 此次监听是否只触发一次
  S.create('dataOne');

  const remove = S.dataOne.subscribe((new_value, old_value) => {
    document.body.innerHTML = new_value;

    // 如果你是在使用 react 进行开发，你可以
    this.setState({
      xx: new_value,
    })
  }, true);

  // 你可以在适当的时机注销掉这个监听
  remove();
```

### unsubscribe
subscribe 方法会对绑定数据进行监听，需要手动一个个的注销掉监听，你会不会觉得太麻烦呢？unsubscribe 就是一个可以省事的 api，返回值为`this`。

```javascript
  // 使用起来也很简单
  S.dataOne.unsubscribe();
```

### polling
polling 会不停的对客户端进行 call，以此更新当前绑定数据的值，返回值为 stop 函数，用于终止轮询。

```javascript
  // 如果你自己对绑定属性的值进行更新，你可以这样做
  let interval;
  function polling () {
    const get = setInterval(async _ => {
      const data = await S.call('interface', data);
      S.dataOne.set(data);

      if (S.get_funs().length < 50) { return; }

      interval = setInterval(_ => {
        // 预防无限注入，导致大的内存开销
        if ( S.get_funs().length < 50) {
          clearInterval(interval);
          interval = null;
          polling();
        }
      }, 100)
    }, 100)
  }

  polling();
```

```javascript
  // swop 提供了 polling 来轮询获取数据，需要传入的三个参数都是可选的
  // interface_name : 需要轮询的接口，默认与当前的绑定属性名相同
  // data : 轮询时需要传入的数据
  // hook_fun : 轮询时每次响应的钩子函数

  const stop = S.dataOne.polling('interfaceOne', '', data => {
    ...
  });

  stop();

  // 但最常用的应该是
  S.dataOne.subscribe(new_value => {
    // react
    this.setState({
      xx: new_value,
    })
  })

  S.dataOne.polling();
```
polling 方法在内部没有采用定时器的方法来轮询，所以不会带来大的内存开销。当返回的数据没有变动时候，polling 方法会降低轮询的频率，减少运行时的开销，关于清除所有绑定属性的轮询，可以看这里 [clear_polling][clear_polling]。

## 约定
swop 使用约定好的数据格式与客户端进行交互，这需要客户端的开发者配合。

在 JavaScript 层面，swop 会把数据转换成
```
{
  origin_data: xxx（真正需要发送的数据）,
  id: xxx（swop 生成的一段随机字符数）,
}
```

相应的，响应数据也应该保证统一的格式
```
{
  origin_data: xx（真正需要响应的数据）,
  id: xx（swop 生成的id，id 是必须的），
}
```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
id 和 origin_data 是唯一约定好的字段名，不应该带有其他的数据字段，不同的是，响应数据的格式是需要客户端的开发者手动转换成我们需要的格式，而 swop 会帮 JavaScript 开发者来做转换，id 是两者之间通信的凭证，swop 必须依靠 id 才能找到相应的响应集合。

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
如果响应数据的格式是 json，但在初始化实例的时候并没有让 swop 做 json 的解析，那么 swop 会通过正则表达式来截取真正需要的数据，需要注意带来的运行时开销。

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
绑定数据的更新也不应该通过 polling 函数来实现更新，客户端应该在数据发生变化时，数据上报给 JavaScript，通过绑定属性的 [set][set] 方法实现更新.


[npm_Swop]:https://www.npmjs.com/package/swop-store
[aop_wiki]: https://zh.wikipedia.org/wiki/%E9%9D%A2%E5%90%91%E4%BE%A7%E9%9D%A2%E7%9A%84%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1

[call]:#call
[response]:#response
[create]:#create
[use]:#use
[get_all_data]:#get_all_data
[get_queue]:#get_queue
[get_funs]:#get_funs
[clear_polling]:#clear_polling

[get]:#get
[set]:#set
[subscribe]:#subscribe
[unsubscribe]:#unsubscribe
[polling]:#polling

