/******* 聚焦于fiber机制, 实现patch 更新 */
// 1. 需要记录上次渲染的fiber tree，也就是currentRoot。we need to save a reference to that “last fiber tree we committed to the DOM” after we finish the commit.We call it currentRoot.
// 2. 每个fiber节点都有一个alternate属性，指向上次渲染的fiber tree中的对应节点。we need to save a reference to the old fiber node that we are going to compare to the new one. We call it alternate.
// todo (a) 暂时没有使用key优化patch更新
/********** schedule 调度机制，调度reconcile生成fiber */
let nextFiberReconcileWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;
function workLoop(deadline) {
  let shouldYield = false;
  while (nextFiberReconcileWork && !shouldYield) {
    nextFiberReconcileWork = performNextWork(nextFiberReconcileWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextFiberReconcileWork && wipRoot) {
    console.log('commitRoot', wipRoot);
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
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

// The element is the thing we want to render to the DOM 
// and the oldFiber is what we rendered the last time

// To compare them we use the type:

// （1）同类型，更新props。if the old fiber and the new element have the same type, we can keep the DOM node and just update it with the new props

// （2）类型不同，新建，并且删除旧节点（如果有旧节点）。if the type is different and there is a new element, it means we need to create a new DOM node
// and if the types are different and there is an old fiber, we need to remove the old node
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;
    const sameType = oldFiber && element && element.type == oldFiber.type;
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        return: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE"
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        return: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT"
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (index === 0) {
      // index为0的时候，使用child连接父节点；
      wipFiber.child = newFiber;
    } else if (element) {
      // 其他index值，使用sibling 连接兄弟节点
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

/***  commit阶段，将dom渲染到页面 */
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot; //  注意，每次渲染的时候，从根节点开始。都要把currentRoot设置为wipRoot，这样下次渲染的时候，就有了上次渲染的内容，可以进行比较。
  wipRoot = null; // 把 wipRoot 设置为空,因为不再需要调度reconcile它了
}
function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  let domParentFiber = fiber.return;
  while (!domParentFiber.dom) {
    // 为什么需要这个while？？
    //  A: to find the parent of a DOM node we’ll need to go up the fiber tree until we find a fiber with a DOM node.
    // A:函数组件本身是没有dom的， 需要递归找到return父节点有dom的
    domParentFiber = domParentFiber.return;
  }
  const domParent = domParentFiber.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
const isEvent = key => key.startsWith("on");
const isProperty = key => key !== "children" && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);
function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps).filter(isEvent).filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key)).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.removeEventListener(eventType, prevProps[name]);
  });

  // Remove old properties
  Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps, nextProps)).forEach(name => {
    dom[name] = "";
  });

  // Set new or changed properties
  Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps, nextProps)).forEach(name => {
    dom[name] = nextProps[name];
  });

  // Add event listeners
  Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps, nextProps)).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, nextProps[name]);
  });
}
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === "object" ? child : createTextElement(child))
    }
  };
}
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
}
function createDom(fiber) {
  const dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props);
  return dom;
}
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]
    },
    alternate: currentRoot
  };
  deletions = [];
  nextFiberReconcileWork = wipRoot;
}
const Didact = {
  createElement,
  render
};