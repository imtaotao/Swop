import { ContainerDataTypes } from '../build';

export type A = ContainerDataTypes<InterfaceNames, keyof DataContainerNames>;

// 需要的接口在这里添加
export type InterfaceNames =
  'interfaceOne' |
  'interfaceTwo';

// 实时变化数据存储容器
export type DataContainerNames = {
  "dataOne": A;
  "dataTwo": A;
  "dataThree": A;
}