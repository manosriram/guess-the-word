const socket = io('http://localhost:5000/');
var localGameState = {
  name: '',
  teamID: '',
};

const initLGS = (name, tm) => {
  localGameState = {
    name: name,
    teamID: tm,
  };
};

const btn = document.querySelector('#guessButton');
const inpFld = document.querySelector('#guessText');
const frm = document.querySelector('#guessLetter');
const eL = document.querySelector('#fillWord');

frm.addEventListener('submit', e => {
  e.preventDefault();

  let guess = inpFld.value;
  if (guess !== ' ') socket.emit('guessed', {guess});
});

btn.addEventListener('click', () => {
  console.log('YUP');
});

const createWordSpace = word => {
  let wordLength = word.length;

  while (eL.firstChild) {
    eL.removeChild(eL.firstChild);
  }

  for (let t = 0; t < wordLength; ++t) {
    let sp = document.createElement('span');
    sp.style.borderBottom = '1px solid black';
    sp.padding = '15px';

    sp.innerText = word[t];

    eL.appendChild(sp);
  }
};

const openLetter = (word, letterIndex) => {};

socket.on('correctGuess', data => {
  let {index, word} = data;
  console.log(word);

  console.log(eL.children[index].innerText);
  eL.children[index].innerText = inpFld.value;
  openLetter(word, index);
  createWordSpace(word);
});

socket.on('start', data => {
  const {team, word} = data.data;
  if (!localGameState.name) {
    while (!localGameState.name) {
      localGameState.name = prompt('Your Name ');
    }
    socket.emit('game-state', {name: localGameState.name});
    console.log(word);
    createWordSpace(word);
    initLGS(localGameState.name, team);
  }
});
