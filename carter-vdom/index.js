const element = {
    type: 'ul',
    props: {
      className: 'list',
      children: [
        {
          type: 'li',
          props: {
            className: 'item',
            onClick: function () {
              alert(1);
            },
            children: [
              {
                type: 'TEXT_ELEMENT',
                props: {
                  nodeValue: 'aaaa',
                  children: []
                },
              }
            ]
          },
        },
        {
          type: 'li',
          props: {
            className: 'item',
            children: [
              {
                type: 'TEXT_ELEMENT',
                props: {
                  nodeValue: 'bbbbddd',
                  children: []
                },
              }
            ]
          },
        },
      ]
    },
  };
  
  const container = document.getElementById("root")
  Didact.render(element, container)