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

const updateGameState = data => {
  let temp = {
    id: data.id,
    name: data.name,
  };
  gameState.team[gameState.chance].push(temp);
  console.log(gameState.team[gameState.chance]);
};

const initSocketServer = server => {
  const io = socketIO(server);

  io.on('connection', socket => {
    socket.on('disconnecting', sct => {
      console.log(gameState.team[socket.team]);
    });

        console.log(temp);
    let team = gameState.chance;
    socket.team = team;
    if (gameState.chance === 'A') {
      gameState.chance = 'B';
    } else {
      gameState.chance = 'A';
    }
    const data = {
      team: team,
      word: gameState.word,
    };

    io.emit('start', {data});

    socket.on('game-state', data => {
      data.id = socket.id;
      updateGameState(data);
    });

    socket.on("guessed", data => {
        let letter = data.guess;

        for (let t=0;t<gameState.word.length;++t) {
            if (temp[t] === letter && !gameState.guessed.includes(t)) {
                gameState.guessed.push(t);
                io.emit("correctGuess", {index: t});
                break;
            }
        }
    });


  });
};

module.exports = initSocketServer;
