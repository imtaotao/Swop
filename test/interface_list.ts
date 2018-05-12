import { ContainerDataTypes } from '../build';

// 需要的接口在这里添加
export type InterfaceNames =
  'interfaceOne';

// 实时变化数据存储容器
export type DataContainerNames = {
  "dataOne": ContainerDataTypes;
  "dataTwo": ContainerDataTypes;
  "dataThrow": ContainerDataTypes;
}