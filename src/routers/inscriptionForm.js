const express = require("express");
const router = new express.Router();
const InscriptionForm = require("../models/inscriptionForm");
const Formation = require("../models/formation");

router.post("/inscriptionForm", async (req, res) => {
  try {
    const inscriptionForm = new InscriptionForm(req.body);
    await inscriptionForm.save();
    res.status(201).send(inscriptionForm);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.get("/inscriptionForm/:id", async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) {
      return res.status(404).send();
    }
    const inscriptionForm = await InscriptionForm.findById(
      formation.inscriptionForm
    );
    if (!inscriptionForm) {
      return res.status(404).send();
    }
    res.status(200).send(inscriptionForm.labels);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
