import test from 'ava';
import { Swop, sendData } from '../../build';

declare const console:any;
export type InterfaceNames =
  'one' |
  'two' |
  'three';

test('Test call method one.', t => {
  t.plan(2);

  const s = new Swop<InterfaceNames, {}>();
  const data = {name: 'test1', count: 1}
  s.send = (name, send_data) => {
    t.is(name, 'one');
    t.is((<sendData>send_data).origin_data, JSON.stringify(data));

    s.response(JSON.stringify({
      id: get_ids(s, 'one')[0],
      origin_data: {
        name: 'response'
      }
    }))
  }

  s.call('one', JSON.stringify(data))
  .then(([data, args]) => {
    t.is(data, JSON.stringify({name: 'response'}));
  })
})

function get_ids (s, name) {
  return s.get_funs(name).map((val) => val.id);
}