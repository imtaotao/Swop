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
    div.innerHTML = new_v.name;
  });

  const p = C[name].polling();

  let i = 0;
  setInterval(() => {
    const _ids = C.get_funs(<any>name).map(val => val.id)
    _ids.forEach((id:string, index:number) => {
      C.response(<any>JSON.stringify({
        origin_data: {
          name: i + 's',
        },
        id,
      }))
    })
    i++;
  }, 1000)

  i++
  return {
    remove,
    p,
  }
}

document.addEventListener('DOMContentLoaded', () => {
  (<any>window).t = polling('dataTwo');
  (<any>window).t = polling('dataThree');
})


const data = {
  xml: '<block type="random_number" id="bfa)uU#[]1r?Ffk_Ah?(" inline="true" x="207" y="87"><value name="min"><shadow type="math_number" id="@jXQ2#kvcSVf?_,tM,LN"><field name="NUM">0</field></shadow></value><value name="max"><shadow type="math_number" id="Xj3[(6e[5pZT7FYi,be)"><field name="NUM">5</field></shadow></value></block>',
  id: '1111',
  origin_data: 222,
}

C.call('interfaceTwo').then(([res, args]) => {
  console.log(res === JSON.stringify(data));
  console.log(JSON.parse(res));
});

C.response(JSON.stringify({
  origin_data: data,
  id: C.get_funs('interfaceTwo')[0].id,
}))