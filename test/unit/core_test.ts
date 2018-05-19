import test from 'ava';
import { Swop, sendData } from '../../build';

declare const console:any;
declare const setTimeout:any;
type InterfaceNames =
  'one' |
  'two';

const xml = '<block type="random_number" id="bfa)uU#[]1r?Ffk_Ah?(" inline="true" x="207" y="87"><value name="min"><shadow type="math_number" id="@jXQ2#kvcSVf?_,tM,LN"><field name="NUM">0</field></shadow></value><value name="max"><shadow type="math_number" id="Xj3[(6e[5pZT7FYi,be)"><field name="NUM">5</field></shadow></value></block>';
const get_ids = (s, name) => s.get_funs(name).map((val) => val.id);

// test base function.
test.cb('Test call method one', t => {
  t.plan(2);

  const s = new Swop<InterfaceNames, {}>();
  const call_data = { name: 'test1', count: 1 };
  const res_data = 1;

  s.send = (name, send_data) => {
    t.deepEqual((<sendData>send_data).origin_data, call_data);
    s.response(JSON.stringify({
      id: get_ids(s, 'one')[0],
      origin_data: res_data,
    }))
  }

  s.call('one', call_data).then(([res, args]) => {
    t.is(res, String(res_data));
    t.end();
  })
})


// test reg match json.
test('Test call method two', async t => {
  t.plan(2);

  const s = new Swop<InterfaceNames, {}>();
  const call_data = 123;
  const res_data = { xml, id: 123 };

  s.send = (name, send_data) => {
    t.is((<any>send_data).origin_data, String(call_data));
    s.response(JSON.stringify({
      origin_data: res_data,
      id: get_ids(s, 'two')[0],
    }))
  }

  const [res, args] = await s.call('two', JSON.stringify(123));
  t.is(res, JSON.stringify(res_data));
})


// test send args param and continue response.
test.cb('Test args param', t => {
  t.plan(2);

  const s = new Swop<InterfaceNames, {}>();
  const res_data = 'origin_data';
  s.send = () => {};

  for (let i = 0; i < 3; i++) {
    s.call('one').then(([res, args]) => {
      // the first one is undefined and 0.
      if (i !== 0) { t.is(args.params[0], i - 1); }
      if (i === 2) { t.end(); }
      args.next(i);
    })
  }

  get_ids(s, 'one').map(id => {
    s.response({
      origin_data: res_data,
      id,
    })
  })
})

// test send args next function and get_queue.
test.cb('Test send args next function and get_queque method', t => {
  t.plan(2);

  const s = new Swop<InterfaceNames, {}>();
  const res_data = 'origin_data';
  s.send = () => {};

  for (let i = 0; i < 3; i++) {
    s.call('one').then(([res, args]) => {
      t.is(res, res_data);
      // args.next();
    })
  }

  get_ids(s, 'one').map((id, i) => {
    s.response({
      origin_data: res_data,
      id,
    })

    if (i === 2) {
      // setTimeout is macro tasks, promise is micro tasks.
      setTimeout(() => t.end())
    }
  })

  // sync code is better than asyn code, but the queue is initialized when registering.
  t.is(s.get_queue('one').fx.length, 2);
})

// test options.
test.cb('Test parse json and stringify json', t => {
  t.plan(2);

  const s = new Swop<InterfaceNames, {}>({
    json_parse: true,
    json_stringify: true,
  });
  const call_data = { call_data: 1 }
  const res_data = { response_data: 2 };

  s.send = (name, send_data) => {
    t.is(typeof send_data, 'string');
    s.response(JSON.stringify({
      origin_data: res_data,
      id: get_ids(s, name)[0],
    }))
  };

  s.call('one', call_data).then(([res, args]) => {
    t.deepEqual(res, res_data);
    t.end();
  })
})


// test call middleware use method.
test.cb('Test the use method call "call"', t => {
  t.plan(3);

  const s = new Swop<InterfaceNames, {}>();
  const call_data = { call_data: 1 }
  const res_data = { response_data: 2 };

  s.send = function (name, send_data) {
    s.response(JSON.stringify({
      origin_data: res_data,
      id: get_ids(s, name)[0],
    }))
  }

  s.use('*', val => {
    t.is(typeof val.value[0], 'string');
    val.value[0] = JSON.parse(val.value[0]);
  })

  s.use('two', val => val.value *= 10);

  s.use('one', val => {
    t.is(val.match, 'one');
    val.value[0].response_data *= 10;
  })

  s.use('one', val => val.value[0].response_data *= 10)

  s.call('one').then(([res, args]) => {
    t.is(res.response_data, 200);
    t.end();
  })
})
