const data = {
  item1: 'bbb',
  item2: 'ccc'
};

// babel支持了 jsx 后，可以执行一些动态逻辑，比如循环、比如从上下文中取值
const jsx = Didact.createElement("ul", {
  className: "list"
}, Didact.createElement("li", {
  className: "item",
  style: {
    background: 'blue',
    color: 'pink'
  },
  onClick: () => alert(2)
}, "aaa"), Didact.createElement("li", {
  className: "item"
}, data.item1, Didact.createElement("i", null, "----")), Didact.createElement("li", {
  className: "item"
}, data.item2));
Didact.render(jsx, document.getElementById('root'));