const express = require("express");
const centerAuth = require("../middleware/centerAuth");
const userAuth = require("../middleware/userAuth");
const router = new express.Router();
const multer = require("multer");
const sharp = require("sharp");
const Formation = require("../models/formation");
const Center = require("../models/center");

//post a formation
router.post("/formations", centerAuth, async (req, res) => {
  const formation = new Formation({
    ...req.body,
    owner: req.center._id,
  });
  var exist = false;

  try {
    req.center.categories.forEach((category) => {
      if (category === req.body.category) return (exist = true);
    });
    if (!exist) {
      req.center.categories.push(req.body.category);
      await req.center.save();
    }
    await formation.save();
    res.status(201).send(formation);
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
});

//Read all formations for home page
router.get("/formations", async (req, res) => {
  const sort = {};

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    formations = await Formation.find({})
      .sort(sort)
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip))
      .exec();
    res.send(formations);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Read a center's reacent formations
router.get("/center/formations/:id", async (req, res) => {
  const _id = req.params.id;
  const sort = {};

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }

  try {
    const center = await Center.findById(_id);
    await center
      .populate({
        path: "formations",
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(center.formations);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//Read a formation
router.get("/formation/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const formation = await Formation.findById(_id);

    if (!formation) {
      return res.status(404).send();
    }
    res.send(formation);
  } catch (error) {
    res.status(500).send(error);
  }
});

//inscription
router.post("/formations/:id", userAuth, async (req, res) => {
  //formation's id
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) {
      return res.status(404).send();
    }
    const id = req.user._id;
    const formationId = formation.id;
    formation.subscribers.push(id);
    req.user.formations.push(formationId);
    await formation.save();
    await req.user.save();
    res.send(formation);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Read Subscribers
router.get("/formations/inscriptions/:id", async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) {
      return res.status(404).send();
    }
    formation.populate("subscribers").execPopulate(function (error, formation) {
      res.send(formation.subscribers);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

//Update formation
router.patch("/formations/:id", centerAuth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "description", "date"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    const formation = await Formation.findOne({
      _id: req.params.id,
      owner: req.center._id,
    });

    if (!formation) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      formation[update] = req.body[update];
    });

    await formation.save();
    res.send(formation);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Delete a formation
router.delete("/formations/:id", centerAuth, async (req, res) => {
  try {
    const formation = await Formation.findOneAndDelete({
      _id: req.params.id,
      owner: req.center._id,
    });
    if (!formation) {
      return res.status(404).send();
    }
    res.send(formation);
  } catch (error) {
    res.status(500).send(error);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return callback(new Error("PLease upload an image"));
    }

    callback(undefined, true);
  },
});

//Post an image
router.post(
  "/formations/:id/image",
  centerAuth,
  upload.single("image"),
  async (req, res) => {
    const _id = req.params.id;

    const formation = await Formation.findById(_id);
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    formation.image = buffer;
    await formation.save();
    res.send(formation);
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//Get an image
router.get("/formations/:id/image", async (req, res) => {
  try {
    const _id = req.params.id;

    const formation = await Formation.findById(_id);
    if (!formation || !formation.image) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(formation.image);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
