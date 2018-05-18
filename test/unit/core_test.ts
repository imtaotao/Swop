import test from 'ava';
import { Swop, sendData } from '../../build';

declare const console:any;
export type InterfaceNames =
  'one' |
  'two';

const xml = '<block type="random_number" id="bfa)uU#[]1r?Ffk_Ah?(" inline="true" x="207" y="87"><value name="min"><shadow type="math_number" id="@jXQ2#kvcSVf?_,tM,LN"><field name="NUM">0</field></shadow></value><value name="max"><shadow type="math_number" id="Xj3[(6e[5pZT7FYi,be)"><field name="NUM">5</field></shadow></value></block>';
function get_ids (s, name) {
  return s.get_funs(name).map((val) => val.id);
}

// test base function
test.cb('Test call method one.', t => {
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


// test reg match json
test('Test call method two.', async t => {
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


// test send args param and continue response
test.cb('Test args param', t => {
  t.plan(2);

  const s = new Swop<InterfaceNames, {}>();
  const res_data = 'origin_data';
  s.send = () => {};

  for (let i = 0; i < 3; i++) {
    s.call('one').then(([res, args]) => {
      // 第一个应该是 undefined 和 0
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