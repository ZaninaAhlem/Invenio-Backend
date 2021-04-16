const express = require("express");
const auth = require("../middleware/centerAuth");
const router = new express.Router();
const Center = require("../models/center");
const multer = require("multer");
const sharp = require("sharp");
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
  }
});

//Center logout
router.post("/centers/logout", auth, async (req, res) => {
  try {
    req.center.tokens = req.center.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.center.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//Read center profile
router.get("/centers/me", auth, async (req, res) => {
  res.send(req.center);
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
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    updates.forEach((update) => {
      req.center[update] = req.body[update];
    });

    await req.center.save();

    res.send(req.center);
  } catch (error) {
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

//Upload avatar
router.post(
  "/centers/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.center.avatar = buffer;
    await req.center.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//Delete avatar
router.delete("/centers/me/avatar", auth, async (req, res) => {
  req.center.avatar = undefined;
  await req.center.save();
  res.send();
});

module.exports = router;
