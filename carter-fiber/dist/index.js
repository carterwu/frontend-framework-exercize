const data = {
  item1: 'bb',
  item2: 'cc'
};
const jsx = Didact.createElement("ul", {
  className: "list"
}, Didact.createElement("li", {
  className: "item",
  style: {
    background: 'blue',
    color: 'pink'
  },
  onClick: () => alert(2)
}, "aa"), Didact.createElement("li", {
  className: "item"
}, data.item1, Didact.createElement("i", null, "xxx")), Didact.createElement("li", {
  className: "item"
}, data.item2));
console.log('查看vdom:', JSON.stringify(jsx, null, 4));
Didact.render(jsx, document.getElementById("root"));