const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let strokes = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send existing strokes to new user
  socket.emit("init", strokes);

  socket.on("draw", (data) => {
    strokes.push(data);
    socket.broadcast.emit("draw", data);
  });

  socket.on("text_add", (data) => {
    strokes.push(data);
    socket.broadcast.emit("text_add", data);
  });

  // NEW: Reset board event
  socket.on("reset_board", () => {
    strokes = []; // clear saved strokes
    io.emit("reset_board"); // tell all clients to clear
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
