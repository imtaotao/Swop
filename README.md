# Welcome to the Swop  🎉🎉🎉

swop 是一个用于`JavaScript`与客户端进行数据交互应用程序，他提供了简洁的`api`来帮助开发者来做这些事情。

## swop 的来源
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
在我们与客户端交互的时候，大量的数据散落在项目各个文件，或者集中于繁琐的`redux`和`window`对象之中，管理维护困难，操作麻烦，使得开发效率很低。

## swap 要解决什么样的问题
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
swop 使用[`aop`](aop_wiki)的理念进行设计开发，通过对于数据的阶段式操作来做一些事情，类似`express`和`redux`swop 能让开发者更好的处理数据，更好的异步和错误处理。

## API
### options
  - json_stringify（default false） ——
  于客户端交互时是否让 swop 对传输的数据进行json stringify。

  - json_parse（default false） ——
  客户端响应时是否让 swop 对传输的数据进行json parse。

### swop 类接口
  - [call](call)
  - [response](response)
  - [use](use)
  - [get_all_data](get_all_data)
  - get_queue
  - get_funs
  - clear_polling

### states 接口
  - get
  - set
  - subscribe
  - polling
  - remove_all_sub

### 实例化 swop
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
  import { Swop, CreateSwop } from 'swop-data';
  import {
    Swop,
    CreateSwop,
    ContainerDataTypes as C,
  } from 'swop-data';

  export type A = C<I, keyof D>;

  // 需要的接口在这里添加
  export type I =
    'interfaceOne';

  // 实时变化数据存储容器
  export type D = {
    "dataOne": A;
    "dataTwo": A;
    "dataThree": A;
  }

  /**
   * 通过 new 来创建的实例，在调用 create 方法
   * 绑定数据后，没有办法通过实例拿到绑定数据的类型
   */
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

  // 第三种，如果你不需要知道绑定属性的类型
  S['dataOne'].get();
```

### call
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
call 方法是于客户端进行通信的入口函数，他需要传入一个name字符和需要发送的数据。

```javascript
  // name 是于客户端交互的接口名
  // call 方法会返回一个 promise
  // value 是客户端返回数据
  S.call(name).then(([value, args]) => {
    ...
    args.next();
  }).catch(err => {
    ...
  })
```

```javascript
  // 客户端的响应会以队列的形式进行触发，所以你可以这里对数据做一些传递
  S.call(name).then(([value, args]) => {
    /**
     * 我们可以在这里拿到客户端的下一次响应
     * args 有三个值
     *  next 下一次的响应（如果当前环境正在被调用，而下一次响应还没有到达，此时next是一个空函数）不管next函数是否是一个空函数，都必须调用，否则可能会出现下一次响应没有办法触发的情况
     *  params 上一次传过来的数据
     *  nextSwopFun 下一次的 call
     */

    args.next(`上一次的响应值为：${value}`);
  })
```

### response
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
response 方法是客户端的入口函数。

```javascript
  // 我们假设客户端响应统一在 window 上的 callback 方法上
  window.callback = data => S.response(data);
```

### use
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
use 方法是 swop 提供的一个中间件函数，你可以通过 use 方法来注入一些中间件, use 方法返回的是`this`，所以你可以像 jQuery 那样链式调用。

```javascript
  // name match字符，接口名或者'*'
  // val 有两个属性 value 和 match 
  S.use(name, val => {
    // 需要注意的是，use 方法的回调参数，swop 改成了引用的方式，所以你不需要纠结这里怎么没有`return`关键字
    // 当然，这里如果你要对响应数据做些修改，你不应该用解构，除非你要做的事情与源数据没什么关系
    if (typeof val.value === 'string') {
      val.value = JSON.parse(val.value);
    }
  })

  // bad
  S.use(name, [value, match] => {
    ...
  })
```

### get_all_data




[aop_wiki]: https://zh.wikipedia.org/wiki/%E9%9D%A2%E5%90%91%E4%BE%A7%E9%9D%A2%E7%9A%84%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1

[call]:https://github.com/imtaotao/Swop#call
[response]:https://github.com/imtaotao/Swop#response
[use]:https://github.com/imtaotao/Swop#use
[get_all_data]::https://github.com/imtaotao/Swop#get_all_data
