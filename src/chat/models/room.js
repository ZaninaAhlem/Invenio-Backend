const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  // name: {
  //   type: String,
  //   required: true,
  // },
  center: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Center",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

roomSchema.virtual("messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "Room",
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
