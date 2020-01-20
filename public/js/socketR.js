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

btn.addEventListener('click', () => {});

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

const flipDisplay = team => {
  if (team !== localGameState.teamID) frm.style.display = 'none';
  else frm.style.display = 'block';
};

/*
const hideOrShow = gS => {
  if (gS === localGameState.teamID) {
    frm.style.display = 'none';
  } else {
    frm.style.display = 'block';
  }
};
*/

socket.on('correctGuess', data => {
  let {index, word} = data;
  eL.children[index].innerText = inpFld.value;
  createWordSpace(word);
});

socket.on('openGame', data => {
  const {team, id, word} = data;

  if (!localGameState.name) {
    while (!localGameState.name) {
      localGameState.name = prompt('Your Name ');
    }
    createWordSpace(word);
    initLGS(localGameState.name, team);
  }
  console.table(team, localGameState.teamID);
  flipDisplay(team);
});
