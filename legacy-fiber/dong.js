/******* 聚焦于fiber机制。暂时不实现函数组件、类组件；也暂时不实现patch 更新 */
// todo 基于fiber的hooks的实现


/********** schedule 调度机制，调度reconcile生成fiber */
let nextFiberReconcileWork = null;
let wipRoot = null;
  
function workLoop(deadline) {
    let shouldYield = false;
    while (nextFiberReconcileWork && !shouldYield) {
        nextFiberReconcileWork = performNextWork(
            nextFiberReconcileWork
        );
        shouldYield = deadline.timeRemaining() < 1;
    }

    if (!nextFiberReconcileWork && wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);



function performNextWork(fiber) {

    reconcile(fiber);

    // 优先reconcile child子节点（纵向，从顶而下）
    if (fiber.child) {
        return fiber.child;
    }

    // 其次reconcile sibling兄弟节点（横向，从左到右）
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.return; // nextFiber的纵向和横向都走完了，则回到父节点上
    }

    // 最后会执行到根节点， nextFiber 为root.return的时候，返回undefined，表示所有节点reconcile完成，可以进行下一步也就是commit渲染到浏览器上。
    // wookLoop 函数中这一句
    // if (!nextFiberReconcileWork && wipRoot) {
    //    commitRoot();
    // }
}

/**** reconcile
 * (1)生成fiber数据结构； 
 * （2）提前创建对应的 dom 节点，(3)做 diff，确定是增、删还是改。 */

function reconcile(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    reconcileChildren(fiber, fiber.props.children)
}


function reconcileChildren(wipFiber, elements) {
    let index = 0
    let prevSibling = null

    while (
        index < elements.length
    ) {
        const element = elements[index]
        let newFiber = {
            type: element.type,
            props: element.props,
            dom: null,
            return: wipFiber,
            effectTag: "PLACEMENT",
        }

        if (index === 0) {                // index为0的时候，使用child连接父节点；
            wipFiber.child = newFiber
        } else if (element) {             // 其他index值，使用sibling 连接兄弟节点
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
}

/***  commit阶段，将dom渲染到页面 */
function commitRoot() {
    commitWork(wipRoot.child);
    wipRoot = null // 把 wipRoot 设置为空,因为不再需要调度reconcile它了
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }

    let domParentFiber = fiber.return
    while (!domParentFiber.dom) {      // todo 为什么需要这个while？？to find the parent of a DOM node we’ll need to go up the fiber tree until we find a fiber with a DOM node.
                                       // A:函数组件 需要递归找到return父节点
        domParentFiber = domParentFiber.return
    }
    const domParent = domParentFiber.dom

    if (
        fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null
    ) {
        domParent.appendChild(fiber.dom)
    } 
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}




function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child =>
                typeof child === "object"
                ? child
                : createTextElement(child)
            ),
        }
    }
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    }
}


function createDom(fiber) {
    const dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);

    for (const prop in fiber.props) {
        setAttribute(dom, prop, fiber.props[prop]);
    }

    return dom;
}

function isEventListenerAttr(key, value) {
    return typeof value == 'function' && key.startsWith('on');
}

function isStyleAttr(key, value) {
    return key == 'style' && typeof value == 'object';
}

function isPlainAttr(key, value) {
    return typeof value != 'object' && typeof value != 'function';
}

const setAttribute = (dom, key, value) => {
    if (key === 'children') {
        return;
    }

    if (key === 'nodeValue') {
        dom.textContent = value;
    } else if (isEventListenerAttr(key, value)) {
        const eventType = key.slice(2).toLowerCase();
        dom.addEventListener(eventType, value);
    } else if (isStyleAttr(key, value)) {
        Object.assign(dom.style, value);
    } else if (isPlainAttr(key, value)) {
        dom.setAttribute(key, value);
    }
};

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        }
    }
    nextFiberReconcileWork = wipRoot
}


  
const Dong = {
    createElement,
    render
}
