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
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// const io = socketio(server);

port = process.env.PORTIO || 4000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New web socket connection");
  var currentRoom = {};

  socket.on("join", async ({ userId, centerId }, callback) => {
    // const { error, user } = addUser({ id: socket.id, username, roomName });
    // const userId = "607465f960fc3e33d83d0636";

    const user = await User.findById(userId);
    const center = await Center.findById(centerId);
    console.log("joined", user.name, " ", center.name);
    user.socketId = socket.id;
    user.save();

    const room = await Room.find({ user: userId });
    if (room.length == 0) {
      const room = new Room({
        user: userId,
        center: centerId,
      });
      room.save();
      console.log("room created", room);
    }
    currentRoom = room;
    Message.find().then((result) => {
      io.to(currentRoom).emit("output-messages", result, currentRoom);
    });

    socket.join(currentRoom);
    // io.to(currentRoom).emit("roomData", {
    //   room: currentRoom,
    //   users: getUsersInRoom(currentRoom),
    // });

    callback();
  });

  //send to everyone
  socket.on("sendMessage", async ({ id, message, room }, callback) => {
    // const user = await User.findOne({ socketId: socket.id });
    var user = await User.findById(id);
    if (!user) {
      user = await Center.findById(id);
    }
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    const aMessage = new Message({
      room: room,
      msg: message,
      sender: user.name,
    });
    aMessage.save().then(() => {
      io.to(room).emit("message", generateMessage(user.name, message));
      console.log("message sent");
    });
    callback();
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
