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

      gameState.team[socket.team] = gameState.team[socket.team].filter(player => {
          return socket.id !== player;
      });

      console.log('Team A: ', gameState.team['A'].length);
      console.log('Team B: ', gameState.team['B'].length);
    });

    const newPlayer = assignTeam(),
      playerID = socket.id;
    socket.team = newPlayer;
    gameState.team[newPlayer].push(playerID);

    // Start a game with new player.
    io.emit('openGame', {team: newPlayer, id: playerID, word: word});
    flipTurns();
  });
};

module.exports = initSocketServer;
