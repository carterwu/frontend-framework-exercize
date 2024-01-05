
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
    },
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
const isEvent = key => key.startsWith("on")
const isProperty = key =>
  key !== "children" && !isEvent(key)

const isFunctionComponent = element => typeof element.type === 'function'
function render(element, container) {
  // add support for function components
  if (isFunctionComponent(element)) {
    const functionVdom = element.type(element.props)
    render(functionVdom, container)
  } else {
    // 处理普通元素
    const dom =
      element.type == "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(element.type)

    // Add properties
    Object.keys(element.props)
      .filter(isProperty)
      .forEach(name => {
        dom[name] = element.props[name]
      })

    // Add event listeners
    Object.keys(element.props)
      .filter(isEvent)
      .forEach(name => {
        const eventType = name
          .toLowerCase()
          .substring(2)
        dom.addEventListener(
          eventType,
          element.props[name]
        )
      });


      // Recursively render child elements,这里务必使用concat，因为children可能是[1,2,3]，也可能是[[1,2,3]]，所以需要使用concat将其转化为[1,2,3]
      // const array1 = ['a', 'b', 'c'];
      // const array3 = [].concat(1, array1);
      ([].concat(...element.props.children)).forEach(child =>
      render(child, dom)
    )

    container.appendChild(dom)
  }
}

const Didact = {
  createElement,
  render,
}

