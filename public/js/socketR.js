const frm = document.querySelector('#guessLetter');
const showFirst = document.querySelector('#selectTeam');
const hideFirst = document.querySelector('#hideFirst');
showFirst.style.display = 'block';
hideFirst.style.display = 'none';
frm.style.visibility = 'hidden';

const socket = io('http://localhost:5000/');
var localGameState = {
  name: '',
  teamID: '',
};

const initLGS = name => {
  localGameState = {
    name: name,
  };
};

const inpB = document.querySelectorAll('.sel');
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

selectTeam.addEventListener('click', d => {
  hideFirst.style.display = 'block';
  showFirst.style.display = 'none';
  localGameState.teamID = d.target.value;
  socket.emit('teamUpdate', {team: localGameState.teamID});
});

frm.addEventListener('submit', e => {
  e.preventDefault();

  let guess = inpFld.value;
  if (guess !== ' ') socket.emit('guess', {guess});
  inpFld.value = '';
  socket.emit('flipTurns');
});

const updateDashboard = (scs, team, scores) => {
  const line = document.createElement('hr');
  const inTxt = document.createElement('p');
  if (scs) inTxt.innerText = `|\nCorrect Guess Team ${team},   +1`;
  else inTxt.innerText = `|\nWrong Guess Team ${team},   -1`;

  wind.appendChild(inTxt);
  wind.appendChild(line);
  teamName.innerText = `Team A :: ${scores.A} | Team B :: ${scores.B}`;
  flipDisplay(team);
};

const createWordSpace = word => {
  let wordLength = word.length;
  console.log(word);
  while (eL.firstChild) {
    eL.removeChild(eL.firstChild);
  }
  let sp = document.createElement('span');
  sp.innerText = word;

  eL.appendChild(sp);
};

socket.on('updateList', data => {
  const unolA = document.querySelector('#unorA');
  const unolB = document.querySelector('#unorB');
  while (unolA.firstChild) {
    unolA.removeChild(unolA.firstChild);
  }
  while (unolB.firstChild) {
    unolB.removeChild(unolB.firstChild);
  }
  const {online} = data;

  for (let t = 0; t < online.length; ++t) {
    const innerE = document.createElement('li');
    innerE.classList.add('list-group-item');
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
    eL.innerText.charAt[index] = word[index];
    createWordSpace(word);
  }
  updateDashboard(scs, team, scores);
  flipDisplay(team);
});

socket.on('openGame', data => {
  const {id, word, origin} = data;

  if (!localGameState.name) {
    while (!localGameState.name) {
      localGameState.name = prompt('Your Name ');
    }
    createWordSpace(word);
    socket.emit('nameEntry', {name: localGameState.name});
    initLGS(localGameState.name);
    console.log(origin);
    frm.style.visibility = 'visible';
    flipDisplay(origin);
  }
});
