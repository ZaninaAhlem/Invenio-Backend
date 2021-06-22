const express = require("express");
const centerAuth = require("../middleware/centerAuth");
const userAuth = require("../middleware/userAuth");
const router = new express.Router();
const multer = require("multer");
const Formation = require("../models/formation");
const Center = require("../models/center");
const InscriptionForm = require("../models/inscriptionForm");
const path = require("path");
const fs = require("fs");
const uniqid = require("uniqid");

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
    // const parts = req.query.sortBy.split("_");
    // sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    sort = -1;
  }

  try {
    formations = await Formation.find({})
      .sort(sort)
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip))
      .exec();
    res.send(formations);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//Read a center's reacent formations
router.get("/center/formations/:id", async (req, res) => {
  const _id = req.params.id;
  const sort = {};

  if (req.query.sortBy) {
    // const parts = req.query.sortBy.split("_");
    sort = -1;
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
    res.status(200).send(formation);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//Read Subscribers
router.get("/formations/inscriptions", centerAuth, async (req, res) => {
  center = req.center;
  try {
    center
      .populate({
        path: "formations",
      })
      .execPopulate(function (error, formation) {
        var subscribers = [];
        for (const val of center.formations) {
          var subscriber = {
            id: val._id,
            title: val.title,
            subscribers: val.subscribers,
          };
          subscribers.push(subscriber);
        }
        res.status(200).send(subscribers);
      });

    // formation.populate("subscribers").execPopulate(function (error, formation) {
    //   res.send(formation.subscribers);
    // });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//Update formation
router.patch("/formations/:id", centerAuth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "title",
    "description",
    "date",
    "category",
    "image",
    "inscriptionForm",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    console.log("Invalid updates");
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
    console.log(error);
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
  dest: "upload",
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

router.post("/upload", upload.single("file"), async (req, res) => {
  const tempPath = req.file.path;
  const id = uniqid();
  const targetPath = path.join(__dirname, `../upload/${id}.png`);

  if (path.extname(req.file.originalname).toLowerCase() === ".png") {
    fs.rename(tempPath, targetPath, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log("id", id);
      res.status(200).send(id);
    });
  } else {
    fs.unlink(tempPath, (err) => {
      if (err) return console.log(err);

      res
        .status(403)
        .contentType("text/plain")
        .send("Only .png files are allowed!");
    });
  }
});

//Get an image
router.get("/image/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    res.set("Content-Type", "image/png");
    res.send(path.join(__dirname, `../upload/cardImage/${_id}.png`));
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
