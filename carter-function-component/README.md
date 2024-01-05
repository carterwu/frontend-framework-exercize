为啥不直接是 vdom对象，而是函数的执行返回对象呢？
因为这样会有一次执行的过程，可以放入一些动态逻辑。createElement函数里可以增强一些功能表现。

const createElement = (type, props, ...children) => {
  // 可以额外执行一些逻辑，兼容地递增 增加新的功能
  return {
    type,
    props,
    children
  };
};