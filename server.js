const express = require("express");      // 1. Import Express first
const http = require("http");            // 2. Import HTTP module
const { Server } = require("socket.io"); // 3. Import Socket.IO

const app = express();                   // 4. Initialize app
const server = http.createServer(app);   // 5. Create HTTP server
const io = new Server(server);           // 6. Attach Socket.IO

// Serve static files from 'public' folder
app.use(express.static("public"));

// Store strokes for new users
let strokes = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send existing strokes to new user
  socket.emit("init", strokes);

  // Relay drawing events
  socket.on("draw", (data) => {
    strokes.push(data);
    socket.broadcast.emit("draw", data);
  });

  // Relay text events
  socket.on("text_add", (data) => {
    strokes.push(data);
    socket.broadcast.emit("text_add", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

