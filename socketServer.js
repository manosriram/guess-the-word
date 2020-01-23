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

const stateName = {
  name: '',
};

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
  online: [],
};

const assignTeam = () => {
  if (gameState.online.length & 1) return 'B';
  else return 'A';
};

const flipTurns = io => {
  if (gameState.now === 'A') gameState.now = 'B';
  else gameState.now = 'A';

  io.emit('teamTurnStat', {now: gameState.now});
};

const updateGameState = () => {};

const initSocketServer = server => {
  const io = socketIO(server);

  io.on('connection', socket => {
    const emitList = () => io.emit('updateList', {online: gameState.online});

    console.log('Current user: ', socket.id);

    socket.on('disconnect', discSCT => {
    console.log('disc user: ', socket.id);
    
    if (gameState.team[socket.team]) {
      gameState.team[socket.team] = gameState.team[socket.team].filter(
        player => {
          return socket.id !== player;
        },
      );
    }

      gameState.online = gameState.online.filter(on => {
        return on.id !== socket.id;
      });
      emitList();
    });

    playerID = socket.id;

    // Start a game with new player.
    io.emit('openGame', {
      id: playerID,
      word: gameState.word,
      origin: gameState.now,
    });

    socket.on('guess', guessLetter => {
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
      if (done) {
        gameState.teamScore[gameState.now]++;
      } else {
        gameState.teamScore[gameState.now]--;
      }

      flipTurns(io);
      io.emit('correctGuess', {
        index: t,
        word: gameState.word,
        team: gameState.now,
        scs: done,
        scores: gameState.teamScore,
      });
    });

    socket.on('teamUpdate', data => {
      const {team} = data;
      socket.team = team;
      gameState.team[team].push(socket.id);
      gameState.online.push({
        team,
        name: stateName.name,
        id: socket.id,
      });
      console.log('Update ', gameState);
      emitList();
    });

    socket.on('nameEntry', data => {
      const {name} = data;
      stateName.name = name;
    });
  });
};
module.exports = initSocketServer;
