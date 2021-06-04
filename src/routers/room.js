const express = require("express");
const router = new express.Router();
const Center = require("../models/center");
const Room = require("../chat/models/room");
const Message = require("../chat/models/message");
const User = require("../models/user");

router.get("/rooms/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    var user = await User.findById(_id);
    if (!user) user = await Center.findById(_id);
    user.populate("rooms").execPopulate(function (error, user) {
      res.status(200).send(user.rooms);
    });
  } catch (error) {
    res.send(error);
  }
});

router.get("/room/users/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    var user = await User.findById(_id);
    if (!user) user = await Center.findById(_id);
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
