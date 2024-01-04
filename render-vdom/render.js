/**判断是否为文本 */
function isTextVdom(vdom) {
    return typeof vdom === 'string' || typeof vdom === 'number';
}
/**判断是否为元素 */
function isElementVdom(vdom) {
    return typeof vdom === 'object' && typeof vdom.type === 'string';
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
}


/****渲染到浏览器上 */
// function mountWithParent(el, parent = null) {
//     return parent ? parent.appendChild(el) : el; // 返回值都是el本身（appendChild也是返回el本身）
// } 
const render = (vdom, parent = null) => {
    const mount = parent ? (el => parent.appendChild(el)) : (el => el); // 可以换成上面👆🏻注释的函数mountWithParent，节省内存，不用每次都创建函数mount
    if (isTextVdom(vdom)) {
        return mount(document.createTextNode(vdom));
    } else if (isElementVdom(vdom)) {
        const dom = document.createElement(vdom.type)

        for (const child of vdom.props.children) {
            render(child, dom); // 递归挂载所有的元素和文本
        }
        for (const prop in vdom.props) {
            setAttribute(dom, prop, vdom.props[prop]);
        }
        mount(dom);  // 放在末尾，避免重复的渲染layout
        return dom;
    } else {
        throw new Error(`Invalid VDOM: ${vdom}.`);
    }
};
