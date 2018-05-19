import test from 'ava';
import {
  Swop,
  ContainerDataTypes,
  CreateSwop,
  DataContainer,
  sendData,
} from '../../build';

declare const console:any;
declare const setTimeout:any;
export type I = 'one';

type A = ContainerDataTypes<I, keyof D>;
interface SwopExtend extends Swop<I, D>, D {};

  // 实时变化数据存储容器
type D = {
  "dataOne": A;
  "dataTwo": A;
  "dataThree": A;
}
const get_ids = (s, name) => s.get_funs(name).map((val) => val.id);


// test get container context.
test('Test get_container_context method', t => {
  t.plan(1);
  const s = CreateSwop<SwopExtend>({});
  const data_container = s.get_container_context();

  t.is(data_container.constructor, (<any>DataContainer));
})

// test create method and set get method.
test('Test create method', t => {
  t.plan(6);
  const s = CreateSwop<SwopExtend>({});
  const test_data = {name: 'taotao', age: 23};

  s.create('dataOne');
  s.create('dataTwo', 2);
  s.create('dataThree', 3, true);

  t.is(s.dataOne.get(), undefined);
  t.is(s.dataTwo.get(), 2);
  t.is(s.dataThree.get(), 3);

  t.is(s.dataOne.set(22).get(), 22);

  s.use('dataTwo', val => {
    t.is(val.value.name, test_data.name);
    val.value.age -= 5;
  })

  s.dataTwo.set(test_data);
  t.deepEqual(s.dataTwo.get(), test_data);
})

// test subscribe and unsubscribe.
test('Test subscribe and unsubscribe method', t => {
  t.plan(8);
  const s = CreateSwop<SwopExtend>({});
  let i = 1;

  s.create('dataOne');
  s.create('dataTwo');
  try {
    s.create('dataOne');
  } catch (err) {
    t.is(err.message, 'Bind attribute【dataOne】already exists --- from Swop.js.');
  }

  const remove = s.dataOne.subscribe(new_value => {
    t.is(new_value, i++);
  })

  s.dataOne.set(1);
  s.dataOne.set(2);

  remove();
  s.dataOne.set(3);

  let one = 1;
  let two = 1;
  s.dataOne.subscribe(new_value => {
    t.is(new_value, one++);
  })
  s.dataTwo.subscribe(new_value => {
    t.is(new_value, two++);
  })

  s.dataOne.set(1);
  s.dataOne.set(2);
  s.dataTwo.set(1);
  s.dataTwo.set(2);

  // s.dataOne.unsubscribe(); // if not unsubscribe, 'play' should be 9
  s.dataOne.unsubscribe();
  s.dataOne.set(3);
  s.dataTwo.set(3);
})


// test get_all_data method.
test('Test get_all_data method', t => {
  t.plan(2);

  const s = CreateSwop<SwopExtend>({});
  s.create('dataOne', 1);
  s.create('dataTwo', 2);
  s.create('dataThree', 3);

  t.is(s.get_all_data(), (<any>s).states);
  t.deepEqual(s.get_all_data(), {
    dataOne: 1,
    dataTwo: 2,
    dataThree: 3,
  })
})


// test base data polling.
test.cb('Test base polling', t => {
  t.plan(6);

  const s = CreateSwop<SwopExtend>({});
  let i = 0;

  s.create('dataOne');
  s.send = function (name, send_data) {
    if (!i) {t.is(name, 'dataOne')}

    if (i === 5) {
      s.clear_polling('dataOne');
      t.end();
    }

    s.response({
      id: get_ids(s, 'dataOne')[0],
      origin_data: ++i,
    })
  }
  s.dataOne.subscribe(new_value => {
    t.is(new_value, i);
  })
  
  s.dataOne.polling();
})


// test polling frequency, this test takes 4s.
test.cb('Test polling frequency, if normal, this test takes 4s', t => {
  t.plan(4);

  const s = CreateSwop<SwopExtend>({});
  const res_range = i => (i > 5 && i < 12) || (i > 20 && i < 27);
  const accept_range = i => (i > 10 && i < 13 || (i > 25 && i < 28))
  let pre_time;
  let stop_polling;
  let res_i = 0;
  let i = 0;
  let j = 'data no change';

  function res_data () {
    let data = i;
    if (res_range(i)) {
      (<any>data) = j;
    }
    i++;
    return data;
  }

  s.send = function (name, send_data) {
    if (name === 'one' && (<sendData>send_data).origin_data === 'call') {
      s.response({
        id: get_ids(s, 'one')[0],
        origin_data: res_data(),
      })
    }
    i === 35 && stop_polling();
  }
  s.create('dataOne');
  s.use('one', val => {
    if (accept_range(res_i)) {
      // 10ms error.
      const time_diff = Date.now() - pre_time;
      t.true(time_diff > 990 && time_diff < 1010);
    }
    res_i++;
    pre_time = Date.now();
    res_i === 35 && t.end();
  })
  pre_time = Date.now();
  stop_polling = s.dataOne.polling('one', 'call');
})
