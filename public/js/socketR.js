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
    const header = document.createElement("h2");
    header.innerText = `[${localGameState.name}] - [Team ${localGameState.teamID}]`;
    teamName.appendChild(header);
};

const btn = document.querySelector('#guessButton');
const inpFld = document.querySelector('#guessText');
const frm = document.querySelector('#guessLetter');
const eL = document.querySelector('#fillWord');
const teamName = document.querySelector("#team");
const wind = document.querySelector('#window');
wind.style.textAlign = "center";
wind.style.overflow = "scroll";
const teamA = document.querySelector('#teamA');
const teamB = document.querySelector('#teamB');
const wrap = document.querySelector("#wrapper");

const flipDisplay = team => {
  if (team === localGameState.teamID) frm.style.display = 'none';
  else frm.style.display = 'block';
};

frm.addEventListener('submit', e => {
  e.preventDefault();

  let guess = inpFld.value;
  if (guess !== ' ') socket.emit('guess', {guess});
});

const updateDashboard = stat => {
  if (stat) {
  } else {
  }
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

    sp.innerText = word[t];

    eL.appendChild(sp);
  }
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

socket.on('updateList', data => {
  while (teamA.firstChild) {
    teamA.removeChild(teamA.firstChild);
  }
  while (teamB.firstChild) {
    teamB.removeChild(teamB.firstChild);
  }
  teamA.innerText = 'Team A';
  teamB.innerText = 'Team B';

  const {online} = data;

  for (let t = 0; t < online.length; ++t) {
    const headerFive = document.createElement('h2');
    headerFive.innerText = online[t].name;

    if (online[t].team === 'A') teamA.appendChild(headerFive);
    else teamB.appendChild(headerFive);
  }
});

socket.on('teamTurnStat', data => {
  const {now} = data;

  const inTxt = document.createElement('h3');
  inTxt.innerText = `Team ${now}'s turn`;
  wind.appendChild(inTxt);
});

socket.on('correctGuess', data => {
  let {index, word, team, scs} = data;
  if (scs) {
    eL.children[index].innerText = inpFld.value;
    createWordSpace(word);
  }
  updateDashboard(scs, team);
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
  }
});
