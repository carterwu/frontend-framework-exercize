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
const isEvent = key => key.startsWith("on");
const isProperty = key => key !== "children" && !isEvent(key);
function render(element, container) {
  const dom = element.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type);

  // Add properties
  Object.keys(element.props).filter(isProperty).forEach(name => {
    dom[name] = element.props[name];
  });

  // Add event listeners
  Object.keys(element.props).filter(isEvent).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, element.props[name]);
  });
  element.props.children.forEach(child => render(child, dom));
  container.appendChild(dom);
}
const Didact = {
  createElement,
  render
};