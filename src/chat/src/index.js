//server side
const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
require("../../db/mongoose");
const { generateMessage } = require("./utils/messages");
const { getUsersInRoom } = require("./utils/users");
const Room = require("../models/room");
const Message = require("../models/message");
const User = require("../../models/user");
const Center = require("../../models/center");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New web socket connection");
  var currentRoom = {};

  socket.on("join", async ({ username, roomName }, callback) => {
    // const { error, user } = addUser({ id: socket.id, username, roomName });
    const _idUser = "607465f960fc3e33d83d0636";
    const _idCenter = "6074664360fc3e33d83d0638";

    const user = await User.findById(_idUser);
    user.socketId = socket.id;
    user.save();
    const center = await Center.findById(_idCenter);

    const room = await Room.find({ name: roomName });
    if (room.length == 0) {
      const room = new Room({
        name: roomName,
        user: _idUser,
        center: _idCenter,
      });
      room.save();
    }
    currentRoom = room;
    Message.find().then((result) => {
      io.to(currentRoom).emit("output-messages", result, currentRoom);
    });

    socket.join(currentRoom);
    io.to(currentRoom).emit("roomData", {
      room: currentRoom,
      users: getUsersInRoom(currentRoom),
    });

    callback();
  });

  //send to everyone
  socket.on("sendMessage", async (message, callback) => {
    const user = await User.findOne({ socketId: socket.id });
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    const aMessage = new Message({
      room: currentRoom[0],
      msg: message,
      sender: user.name,
    });
    aMessage.save().then(() => {
      io.to(currentRoom).emit("message", generateMessage(user.name, message));
    });
    callback();
  });

  // socket.on("disconnect", () => {
  //   const user = removeUser(socket.id);

  //   if (user) {
  //     io.to(currentRoom).emit(
  //       "message",
  //       generateMessage("Admin", `${user.username} has left!`)
  //     );
  //     io.to(currentRoom).emit("roomData", {
  //       room: currentRoom,
  //       users: getUsersInRoom(currentRoom),
  //     });
  //   }
  // });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
