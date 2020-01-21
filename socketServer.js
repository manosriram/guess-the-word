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
  now: 'B',
  word: word,
  guessed: [],
  online: [],
};

const assignTeam = () => {
  if (gameState.online.length & 1) return 'B';
  else return 'A';
};

const flipTurns = io => {
  io.emit('teamTurnStat', {now: gameState.now});

  if (gameState.now === 'A') gameState.now = 'B';
  else gameState.now = 'A';
};

const updateGameState = () => {};

const initSocketServer = server => {
  const io = socketIO(server);

  io.on('connection', socket => {
    const emitList = () => io.emit('updateList', {online: gameState.online});

    console.log('Current user: ', socket.id);

    socket.on('disconnect', discSCT => {
      console.log('disc user: ', socket.id);

      gameState.team[socket.team] = gameState.team[socket.team].filter(
        player => {
          return socket.id !== player;
        },
      );

      gameState.online = gameState.online.filter(on => {
        return on.id !== socket.id;
      });

      console.log(gameState.online);
      emitList();
    });

    const newPlayer = assignTeam(),
      playerID = socket.id;

    socket.team = newPlayer;
    gameState.team[newPlayer].push(playerID);

    // Start a game with new player.
    io.emit('openGame', {
      team: newPlayer,
      id: playerID,
      word: gameState.word,
      origin: gameState.now,
    });

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
        scores: gameState.teamScore
      });
    });

    socket.on('nameEntry', data => {
      const {name} = data;
      gameState.online.push({
        name,
        id: socket.id,
        team: socket.team,
      });
      emitList();
    });
  });
};
module.exports = initSocketServer;
