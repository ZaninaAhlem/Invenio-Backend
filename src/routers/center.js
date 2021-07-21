const express = require("express");
const auth = require("../middleware/centerAuth");
const router = new express.Router();
const Center = require("../models/center");
const Room = require("../chat/models/room");
const Message = require("../chat/models/message");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uniqid = require("uniqid");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

//Create a center
router.post("/centers", async (req, res) => {
  const center = new Center(req.body);

  try {
    await center.save();
    sendWelcomeEmail(center.email, center.name);
    const token = await center.generateAuthToken();
    res.status(201).send({ center, token });
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
});

//Center login
router.post("/centers/login", async (req, res) => {
  try {
    const center = await Center.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await center.generateAuthToken();
    res.send({ center, token });
  } catch (error) {
    res.status(400).send();
    console.log(error);
  }
});

//Center logout
router.post("/centers/logout", auth, async (req, res) => {
  try {
    req.center.tokens = req.center.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.center.save();
  } catch (error) {
    res.status(500).send();
  }
});

//Read center profile
router.get("/centers/me", auth, async (req, res) => {
  res.send(req.center);
});

//Read center by id
router.get("/centers/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const center = await Center.findById(_id);

    if (!center) {
      return res.status(404).send();
    }
    res.status(200).send(center);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//Read Followers
router.get("/centers/followers", auth, async (req, res) => {
  try {
    req.center.populate("followers").execPopulate(function (error, center) {
      res.send(center.followers);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

//Update center
router.patch("/centers/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "email",
    "password",
    "phoneNumber",
    "pays",
    "adresse",
    "avatar",
    "bio",
    "type",
    "founded",
    "specialities",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    console.log("Invalid updates");
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    updates.forEach((update) => {
      req.center[update] = req.body[update];
    });

    await req.center.save();

    console.log("updated");
    res.send(req.center);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//Delete center
router.delete("/centers/me", auth, async (req, res) => {
  try {
    await req.center.remove();
    sendCancelationEmail(req.center.email, req.center.name);
    res.send(req.center);
    console.log("email sent");
  } catch (error) {
    res.status(500).send(errors);
    console.log(error);
  }
});

const upload = multer({
  dest: "../upload",
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

router.post("/upload/avatar", upload.single("file"), async (req, res) => {
  const tempPath = req.file.path;
  const id = uniqid();
  const targetPath = path.join(__dirname, `../upload/${id}.png`);

  if (
    path.extname(req.file.originalname).toLowerCase() === ".png" ||
    path.extname(req.file.originalname).toLowerCase() === ".jpg" ||
    path.extname(req.file.originalname).toLowerCase() === ".jpeg"
  ) {
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

//Delete avatar
router.delete("/centers/me/avatar", auth, async (req, res) => {
  req.center.avatar = undefined;
  await req.center.save();
  res.send();
});

module.exports = router;
