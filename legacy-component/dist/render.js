/****渲染到浏览器上 */
// function mountWithParent(el, parent = null) {
//     return parent ? parent.appendChild(el) : el; // 返回值都是el本身（appendChild也是返回el本身）
// }
const render = (vdom, parent = null) => {
  const mount = parent ? el => parent.appendChild(el) : el => el;
  if (isTextVdom(vdom)) {
    return mount(document.createTextNode(vdom));
  } else if (isElementVdom(vdom)) {
    const dom = mount(document.createElement(vdom.type));
    for (const child of [].concat(...vdom.props.children)) {
      render(child, dom);
    }
    for (const prop in vdom.props) {
      setAttribute(dom, prop, vdom.props[prop]);
    }
    return dom;
  } else if (isComponentVdom(vdom)) {
    const functionProps = vdom.props;
    if (Component.isPrototypeOf(vdom.type)) {
      const instance = new vdom.type(functionProps);
      instance.componentWillMount();
      const componentVdom = instance.render();
      instance.dom = render(componentVdom, parent);
      instance.componentDidMount();
      return instance.dom;
    } else {
      const componentVdom = vdom.type(functionProps);
      return render(componentVdom, parent);
    }
  } else {
    throw new Error(`Invalid VDOM: ${vdom}.`);
  }
};

/**判断是否为文本 */
function isTextVdom(vdom) {
  return typeof vdom === 'string' || typeof vdom === 'number';
}
/**判断是否为元素 */
function isElementVdom(vdom) {
  return typeof vdom === 'object' && typeof vdom.type === 'string';
}
/*** 判断是否为组件；暂不支持函数 hooks */
function isComponentVdom(vdom) {
  return typeof vdom.type == 'function';
}

/*** 属性的输入校验和相关设置 */
function isEventListenerAttr(key, value) {
  return typeof value === 'function' && key.startsWith('on');
}
function isStyleAttr(key, value) {
  return key === 'style' && typeof value === 'object';
}
function isPlainAttr(key, value) {
  return typeof value != 'object' && typeof value != 'function';
}
const setAttribute = (dom, key, value) => {
  if (isEventListenerAttr(key, value)) {
    const eventType = key.slice(2).toLowerCase(); // 这里不能直接使用el[key.toLowerCase()]，类似onClick，因为onClick只能存一个事件，后来的事件会覆盖之前的https://stackoverflow.com/questions/6348494/addeventlistener-vs-onclick
    dom.addEventListener(eventType, value);
  } else if (isStyleAttr(key, value)) {
    Object.assign(dom.style, value);
  } else if (isPlainAttr(key, value)) {
    dom.setAttribute(key, value);
  }
};

/*** 自定义createElement，而不使用React.createElement */
const createElement = (type, props, ...children) => {
  if (props === null) props = {};
  return {
    type,
    props: {
      ...props,
      children
    }
  };
};

/* class 组件需要声明一个类，有 state 的属性 */
class Component {
  constructor(props) {
    this.props = props || {};
    this.state = null;
  }
  setState(nextState) {
    this.state = nextState;
  }
  componentWillMount() {
    return undefined;
  }
  componentDidMount() {
    return undefined;
  }
}