const express = require("express");
const router = new express.Router();
const Center = require("../models/center");
const Formateur = require("../models/formateur");
const auth = require("../middleware/centerAuth");

router.post("/formateurs", auth, async (req, res) => {
  const center = req.center;
  const formateur = new Formateur({
    ...req.body,
    center: req.center._id,
  });
  try {
    await formateur.save();
    res.status(201).send(formateur);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get("/formateurs", auth, async (req, res) => {
  const center = req.center;
  try {
    center.populate("formateurs").execPopulate(function (error, center) {
      res.status(200).send(center.formateurs);
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.delete("/formateurs/:id", auth, async (req, res) => {
  try {
    const formateur = await Formateur.findOneAndDelete({
      _id: req.params.id,
      center: req.center._id,
    });
    if (!formateur) {
      return res.status(404).send();
    }
    res.send(formateur);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
