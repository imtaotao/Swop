export * from './swop';
export * from './queue';
export * from './tool';
export * from './static_store';

/*  create_Swop
 *  接口
 *  use
 *  call
 *  response
 *  create
 *  get_queue
 *  get_funs
 *  get_all_data
 *
 *  create 后的接口
 *    set
 *    get
 *    subscribe => remove
 *    remove_all
 *
 *  响应数据
 *  call.then => [data, {next, param, nextSwopFun}]
 *  use => 'response', [data, {next, param, nextSwopFun}]
 *  use => 'set', value
 *  subscribe => oldvalue, newvalue
 */