const data = {
    item1: 'bbb',
    item2: 'ccc'
}

// babel支持了 jsx 后，可以执行一些动态逻辑，比如循环、比如从上下文中取值
const jsx = <ul className="list">
    <li className="item" style={{ background: 'blue', color: 'pink' }} onClick={() => alert(2)}>aaa</li>
    <li className="item">{data.item1}<i>----</i></li>
    <li className="item">{data.item2}</li>
</ul>


Didact.render(jsx, document.getElementById('root'));
