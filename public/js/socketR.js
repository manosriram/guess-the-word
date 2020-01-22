const frm = document.querySelector('#guessLetter');
frm.style.visibility = "hidden";
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
const eL = document.querySelector('#fillWord');
const teamName = document.querySelector('#team');
const wind = document.querySelector('#window');

const wrap = document.querySelector('#wrapper');

wind.style.textAlign = 'center';
wind.style.overflow = 'scroll';

const flipDisplay = team => {
  if (team === localGameState.teamID) frm.style.display = 'none';
  else frm.style.display = 'block';

  wind.scrollIntoView();
};

frm.addEventListener('submit', e => {
  e.preventDefault();

  let guess = inpFld.value;
  if (guess !== ' ') socket.emit('guess', {guess});
  inpFld.value = '';
});

const updateDashboard = (scs, team, scores) => {
  const inTxt = document.createElement('p');
  if (scs) inTxt.innerText = `|\nCorrect Guess Team ${team},   +1`;
  else inTxt.innerText = `|\nWrong Guess Team ${team},   -1`;

  wind.appendChild(inTxt);
  teamName.innerText = `Team A :: ${scores.A} | Team B :: ${scores.B}`;
};

const createWordSpace = word => {
  let wordLength = word.length;

  while (eL.firstChild) {
    eL.removeChild(eL.firstChild);
  }

  for (let t = 0; t < wordLength; ++t) {
    let sp = document.createElement('span');
    sp.style.borderBottom = '1px solid black';
    sp.padding = '15px';

    sp.innerText = word[t] + ' ';

    eL.appendChild(sp);
  }
};

socket.on('updateList', data => {
  const unolA = document.querySelector("#unorA");
  const unolB = document.querySelector("#unorB");
  while (unolA.firstChild) {
    unolA.removeChild(unolA.firstChild);
  }
  while (unolB.firstChild) {
    unolB.removeChild(unolB.firstChild);
  }
  const {online} = data;

  for (let t = 0; t < online.length; ++t) {
    const innerE = document.createElement("li");
      innerE.classList.add("list-group-item");
    innerE.innerText = online[t].name;

    if (online[t].team === 'A') unolA.appendChild(innerE);
    else unolB.appendChild(innerE);
  }
});

socket.on('teamTurnStat', data => {
  const {now} = data;

  const inTxt = document.createElement('p');
  inTxt.innerText = `Team ${now}'s turn`;
  wind.appendChild(inTxt);
});

socket.on('correctGuess', data => {
  let {index, word, team, scs, scores} = data;
  if (scs) {
    eL.children[index].innerText = inpFld.value;
    createWordSpace(word);
  }
  updateDashboard(scs, team, scores);
  flipDisplay(team);
});

socket.on('openGame', data => {
  const {team, id, word, origin} = data;

  if (!localGameState.name) {
    while (!localGameState.name) {
      localGameState.name = prompt('Your Name ');
    }
    createWordSpace(word);
    socket.emit('nameEntry', {name: localGameState.name});
    initLGS(localGameState.name, team);
    flipDisplay(origin);
    frm.style.visibility = "visible";
  }
});
