const data = [
  { text: 'bbb' },
  { text: 'ccc' }
]

function List(props) {
  return <ul className="list">
      {/* <li className="item" onClick={() => alert(1)}>{1}</li>
      <li className="item" onClick={() => alert(2)}>{2}</li> */}
      {
        props.list.map((item, index) => {
          return <li className="item" onClick={() => alert(item.text)}>{item.text}</li>
        })
      }
    </ul>
}
Didact.render(<List list={data} />, document.getElementById('root'));
