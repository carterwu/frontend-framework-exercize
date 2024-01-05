const data = [{
  text: 'bbb'
}, {
  text: 'ccc'
}];
function List(props) {
  return Didact.createElement("ul", {
    className: "list"
  }, props.list.map((item, index) => {
    return Didact.createElement("li", {
      className: "item",
      onClick: () => alert(item.text)
    }, item.text);
  }));
}
Didact.render(Didact.createElement(List, {
  list: data
}), document.getElementById('root'));