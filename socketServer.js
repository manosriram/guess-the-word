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
  team: {
    A: [],
    B: [],
  },
  teamScore: {
    A: 0,
    B: 0,
  },
  now: 'A',
  word: word,
  guessed: [],
};

const assignTeam = () => {
  if (gameState.team['A'].length >= gameState.team['B'].length) return 'B';
  else return 'A';
};

const flipTurns = () => {
  if (gameState.now === 'A') gameState.now = 'B';
  else gameState.now = 'A';
};

const updateGameState = () => {};

const disconnectUser = (sock, id) => {
  return id !== sock.id;
};

const initSocketServer = server => {
  const io = socketIO(server);

  const emitGameState = () => io.emit('emitGameState', {gameState});

  io.on('connection', socket => {
    console.log('Current user: ', socket.id);

    socket.on('disconnect', discSCT => {
      console.log('disc user: ', socket.id);

      gameState.team[socket.team] = gameState.team[socket.team].filter(
        player => {
          return socket.id !== player;
        },
      );
    });

    const newPlayer = assignTeam(),
      playerID = socket.id;

    socket.team = newPlayer;
    gameState.team[newPlayer].push(playerID);

    // Start a game with new player.
    io.emit('openGame', {team: newPlayer, id: playerID, word: gameState.word, origin: gameState.now});

    socket.on('guess', guessLetter => {
      console.log(temp);
      let t;
      let done = false;
      for (t = 0; t < temp.length; ++t) {
        if (temp[t] === guessLetter.guess && !gameState.guessed.includes(t)) {
          gameState.word =
            gameState.word.substr(0, t) +
            temp[t] +
            gameState.word.substr(t + 1);
          gameState.guessed.push(t);
          done = true;
          break;
        }
      }
      flipTurns();
      io.emit('correctGuess', {
        index: t,
        word: gameState.word,
        team: gameState.now,
        scs: done,
      });
    });
  });
};
module.exports = initSocketServer;
