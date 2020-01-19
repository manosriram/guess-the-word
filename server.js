const express = require("express"),
    app = express(),
    bpr = require("body-parser"),
    PORT = process.env.PORT || 5000,
    http = require("http"),
    path = require("path");

const server = http.createServer(app);
const socket = require("./socketE");
socket(server);
const cors = require("cors");

cors({credentials: true, origin: true})
app.use(cors())
const staticPath = path.join(__dirname, "./public");
app.use(express.static(staticPath, {extensions: ['html']} ));
app.use(bpr.urlencoded({"extended": false}));
app.use(bpr.json());


server.listen(PORT, () => console.log(`Server at ${PORT}`));
