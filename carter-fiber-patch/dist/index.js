const container = document.getElementById("root");
const updateValue = e => {
  rerender(e.target.value);
};
const rerender = value => {
  const element = Didact.createElement("div", null, Didact.createElement("input", {
    onInput: updateValue,
    value: value
  }), Didact.createElement("h2", null, "Hello ", value));
  Didact.render(element, container);
};
rerender("World");