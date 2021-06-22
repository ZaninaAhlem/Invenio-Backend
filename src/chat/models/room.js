const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Center",
  },
  center: {
    name: {
      type: String,
    },
    avatar: {
      type: String,
    },
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  user: {
    name: {
      type: String,
    },
    avatar: {
      type: String,
    },
  },
});

roomSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "Room",
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
