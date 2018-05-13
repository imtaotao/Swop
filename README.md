# Welcome to the Swop  🎉🎉🎉

swop 是一个用于`JavaScript`与客户端进行数据交互应用程序，他提供了简洁的api来帮助开发者来做这些事情。

## swop 的来源
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
在我们与客户端交互的时候，大量的数据散落在项目各个文件，或者集中于繁琐的`redux`和`window`对象之中，管理维护困难，操作麻烦，使得开发效率很低。

## swap 要解决什么样的问题
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
swop 使用[`aop`](aop_wiki)的理念进行设计开发，通过对于数据的阶段式操作来做一些事情，类似`express`和`redux`swop 能让开发者更好的处理数据，更好的异步和错误处理。

## API
### options
  - json_stringify（default false） ——
  于客户端交互时是否让 swop 对传输的数据进行json stringify。

  - json_parse（default false） ——
  客户端响应时是否让 swop 对传输的数据进行json parse。

### swop 类接口
  - call
  - response
  - use
  - get_all_data
  - get_queue
  - get_funs
  - clear_polling

### states 接口
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
如果你是用`typescript`进行的开发
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
   * 通过 new 来创建的实例，在调用 create 方法
   * 绑定数据后，没有办法通过实例拿到绑定数据的类型
   */
  const S = new Swop<I, D>(options);

  /**
   *  // 这种情况下 dataOne 的类型没有办法推断出来，但有两种办法可以拿到绑定数据的类型 
   */
  S.creata('dataOne');
  //  S.dataOne.XX

  // 第一种，使用 types 属性
  S.types.dataOne.get();

  // 第二种，用 swop 提供的实例函数来创建实例
  interface _Swop extends Swop<I, D>, D {}
  const S = CreateSwop<_Swop>(options);
  S.dataOne.get();

  // 第三种，如果你不需要知道绑定属性的类型
  S['dataOne'].get();
```

### call
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
call 函数是于客户端进行通信的入口函数，他需要传入一个name字符和需要发送的数据。

```javascript
  // name 是于客户端交互的接口名
  // call 方法会返回一个 promise
  // value 是客户端返回数据
  S.call(name).then(([value, args]) => {
    ...
    args.next();
  }).catch(err => {
    ...
  })
```

```javascript
  // 客户端的响应会以队列的形式进行触发，所以你可以这里对数据做一些传递
  S.call(name).then(([value, args]) => {
    /**
     * 我们可以在这里拿到客户端的下一次响应
     * args 有三个值
     *  next 下一次的响应（如果当前环境在这被调用，而下一次响应还没有到达，此时next是一个空函数）不管next函数是否是一个空函数，都必须调用，否则可能会出现下一次响应没有办法触发的情况
     *  params 上一次传过来的数据
     *  nextSwopFun 下一次的 call
     */

    args.next(`上一次的响应值为：${value}`);
  })
```

### response




[aop_wiki]: https://zh.wikipedia.org/wiki/%E9%9D%A2%E5%90%91%E4%BE%A7%E9%9D%A2%E7%9A%84%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1