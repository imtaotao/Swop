// 需要一个测试库
import { Swop, CreateSwop } from '../build';
import { InterfaceNames, DataContainerNames } from './interface_list'

interface _Swop extends Swop<InterfaceNames, DataContainerNames>, DataContainerNames {}
// const M = new Swop<InterfaceNames, DataContainerNames>();
const M = CreateSwop<_Swop>();
(<any>window).m = M;


M.create('dataOne', 'tt', true)
 .create('dataTwo');

for (let i = 0; i < 5; i++) {
  M.call('interfaceOne').then(([value, args]) => {
    console.log(value)
    setTimeout(_ => args.next(value, 'abc'), 1000)
  })
}

const ids = M.get_funs('interfaceOne').map(val => val.id)

M.use('*', (val) => {
  const {value, match} = val;
  if (value.length) {
    value[0] = JSON.stringify(value[0])
  } else {
    val.value *= 10;
  }
})

setTimeout(() => {
  ids.forEach((id:string, i:number) => {
    M.response(<any>JSON.stringify({
      origin_data: {
        name: 'taotao' + i,
        age: i,
      },
      id,
    }))
  })
}, 2000)

const remove = M.dataTwo.subscribe((new_v, old_v) => {
  (<any>document.getElementById('dd')).innerHTML = new_v;
})