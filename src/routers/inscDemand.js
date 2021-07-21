const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const Formation = require("../models/formation");
const InscDemand = require("../models/inscDemand");
const userAuth = require("../middleware/userAuth");
const centerAuth = require("../middleware/centerAuth");

router.post("/inscriptiondemand/:id", userAuth, async (req, res) => {
  const user = req.user;
  const _id = req.params.id;
  try {
    const inscDemand = await InscDemand.find({ formation: _id });
    if (!inscDemand[0]) {
      const inscDemand = new InscDemand({
        formation: _id,
        responses: {
          userId: user._id,
          name: user.name,
          response: req.body.response,
        },
      });
      await inscDemand.save();
      return res.status(201).send(inscDemand);
    }
    inscDemand[0].responses.push({
      userId: user._id,
      name: user.name,
      response: req.body.response,
      avatar: user.avatar,
    });
    await inscDemand[0].save();
    res.status(201).send(inscDemand[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/inscriptiondemand/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const inscDemand = await InscDemand.find({ formation: _id });
    if (!inscDemand[0]) {
      return res.status(200).send();
    }

    res.status(200).send(inscDemand[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//inscription
router.post("/inscription/:id", centerAuth, async (req, res) => {
  //inscDemand's id
  const _id = req.params.id;
  try {
    const inscDemand = await InscDemand.findById(_id);
    if (!inscDemand) {
      return res.status(404).send();
    }

    const formation = await Formation.findById(inscDemand.formation);

    const response = inscDemand.responses.find(
      (item) => item._id == req.body.id
    );
    const user = await User.findById(response.userId);
    const { accepted } = req.body;

    if (accepted) {
      formation.subscribers.push({ name: user.name, avatar: user.avatar });
      user.formations.push(formation._id);
      user.notifications.push({
        center: req.center.name,
        avatar: req.center.avatar,
        formation: formation._id,
        notification: "à accepter votre demande d'inscription.",
      });
      inscDemand.responses = inscDemand.responses.filter(
        (item) => item._id != req.body.id
      );
      await formation.save();
      await user.save();
      await inscDemand.save();
      return res.status(200).send({
        responses: inscDemand.responses,
        subscribers: formation.subscribers,
      });
    }
    inscDemand.responses = inscDemand.responses.filter(
      (item) => item._id != req.body.id
    );
    // await inscDemand.save();
    res.status(200).send({
      responses: inscDemand.responses,
      subscribers: formation.subscribers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
