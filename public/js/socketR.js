const socket = io('http://localhost:5000');

const createBlankSpace = wordLength => {
  const eL = document.querySelector('#fillWord');

  for (let t = 0; t < wordLength; ++t) {
    let sp = document.createElement('span');
    sp.style.borderBottom = '1px solid black';
    sp.appendChild(document.createTextNode('A'));
    sp.padding = '10px';

    eL.appendChild(sp);
    eL.appendChild(document.createTextNode('\u00A0\u00A0\u00A0'));
  }
};


socket.on('userEntry', () => {
  let name = prompt("Your Name ");
  while (!name) {
      name = prompt("Your Name ");
  }

  socket.emit('joined', "123");
});

socket.on("joined", name => {
    console.log(name);
    let nameRow = document.querySelector("#window");
    let msg = document.createElement("div");
    msg.innerHtml = name;
    nameRow.appendChild(msg);
});

socket.on('startWord', data => {
  console.log(data);
  createBlankSpace(data.word.length);
});
