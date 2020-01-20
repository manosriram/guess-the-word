const socketIO = require('socket.io');
const words = require('./words.json');
var temp;

function getRandomWord() {
  return words[
    Math.floor(Math.random() * Math.floor(words.length))
  ].toUpperCase();
}
var pattern = /[0-9a-zA-Z]+/g;
temp = getRandomWord();
let word = temp.replace(/[a-zA-Z0-9]/g, '*');

const gameState = {
  word: word,
  points: {
    A: 0,
    B: 0,
  },
  team: {
    A: [],
    B: [],
  },
  guessed: [],
  chance: 'A',
};

const teamScores = data => {};

const updateGameState = data => {
  let temp = {
    id: data.id,
    name: data.name,
  };
  gameState.team[gameState.chance].push(temp);
  flipTurns();
  console.log(gameState.team[gameState.chance]);
};

const flipTurns = () => {
  if (gameState.chance === 'A') gameState.chance = 'B';
  else gameState.chance = 'A';
};

const initSocketServer = server => {
  const io = socketIO(server);

  const emitGameState = () => io.emit('emitGameState', {gameState});

  io.on('connection', socket => {
    socket.on('disconnect', sct => {
      gameState.team[socket.team].splice(socket.id, 1);

      gameState.team[socket.team] = gameState.team[socket.team].filter(tm => {
        return tm.id !== socket.id;
      });

      console.log(`Out ${socket.team}\n`);
      console.log(gameState);
    });

    console.log(temp);
    let team;
    if (gameState.team["A"].length >= gameState.team["B"].length)
      team = "B";
    else team = "A";

    const data = {
      team: team,
      word: gameState.word,
      id: socket.id,
      chance: gameState.chance
    };
    socket.team = team;
    gameState.team[team].push(data);

    io.emit('start', {data});

    socket.on('game-state', data => {
      data.id = socket.id;
      updateGameState(data);
      emitGameState();
    });

    socket.on('guessed', data => {
      emitGameState();
      let letter = data.guess;
      gameState.points[gameState.chance]++;

      for (let t = 0; t < gameState.word.length; ++t) {
        if (temp[t] === letter && !gameState.guessed.includes(t)) {
          gameState.guessed.push(t);

          gameState.word =
            gameState.word.substr(0, t) + letter + gameState.word.substr(t + 1);

          io.emit('correctGuess', {index: t, word: gameState.word});
          break;
        }
      }
      flipTurns();
    });
  });
};

module.exports = initSocketServer;
