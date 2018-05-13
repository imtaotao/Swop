// 需要一个测试库
import { Swop, CreateSwop } from '../build';
import { InterfaceNames as I, DataContainerNames as D } from './interface_list'

interface _Swop extends Swop<I, D>, D {}
// const C = new Swop<I, D>();
const C = CreateSwop<_Swop>({
  json_parse: false,
});
(<any>window).c = C;

C.send = () => {};

C.create('dataOne', 'tt', true)
 .create('dataTwo')
 .create('dataThree');

for (let i = 0; i < 5; i++) {
  C.call('interfaceOne').then(([value, args]) => {
    console.log(value)
    setTimeout(_ => args.next(value, 'abc'), 1000)
  })
}

const ids = C.get_funs('interfaceOne').map(val => val.id)

C.use('*', (val) => {
  if (typeof val.value === 'string') {
    val.value = JSON.parse(val.value);
  }
})

function polling (name:string) {
  const div = document.createElement('div');
  div.style.marginTop = '20px'; 
  document.body.appendChild(div);

  const remove = C[name].subscribe((new_v, old_v) => {
    new_v.name && (new_v = new_v.name);
    div.innerHTML = new_v;
  });
  
  const p = C[name].polling();
  
  let i = 0;
  setInterval(() => {
    const _ids = C.get_funs(<any>name).map(val => val.id)
    _ids.forEach((id:string, index:number) => {
      C.response(<any>JSON.stringify({
        origin_data: {
          name: name + i
        },
        id,
      }))
    })
    i++;
  }, 1000)

  return {
    remove,
    p,
  }
}

document.addEventListener('DOMContentLoaded', () => {
  (<any>window).t = polling('dataTwo');
  (<any>window).t = polling('dataThree');
})