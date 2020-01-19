const socketIO = require('socket.io');
const words = require("./words.json");

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const initSocketServer = server => {
    const io = socketIO(server);

    const word = words[getRandomInt(words.length)];

    io.on("connection", () => {
        io.emit("guess", {word});
    });


};

module.exports = initSocketServer;
