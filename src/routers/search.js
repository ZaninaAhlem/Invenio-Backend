const express = require("express");
const User = require("../models/user");
const Center = require("../models/center");
const Formation = require("../models/formation");
const router = new express.Router();

//search formation
router.get("/search/:query", async (req, res) => {
  try {
    var regex = new RegExp(req.params.query, "i");
    resultForm = await Formation.find({ title: regex });
    resultUser = await User.find({ name: regex });
    resultCent = await Center.find({ name: regex });
    resultCentCat = await Center.find({ categories: regex });
    resultFormCat = await Formation.find({ category: regex });
    res.send([
      ...resultForm,
      ...resultCent,
      ...resultUser,
      ...resultCentCat,
      ...resultFormCat,
    ]);
  } catch (error) {
    res.status(500).send();
    console.log(error);
  }
});

module.exports = router;
