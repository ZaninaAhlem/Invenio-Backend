const express = require("express");
const auth = require("../middleware/userAuth");
const router = new express.Router();
const Center = require("../models/center");
const User = require("../models/user");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

//Create a user
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
    console.log("email sent");
  } catch (error) {
    res.status(400).send(error);
  }
});

//User login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

//Read user formations
router.get("/users/me/formations", auth, async (req, res) => {
  try {
    const user = req.user;
    user.populate("formations").execPopulate(function (error, user) {
      res.send(user.formations);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

//follow a center
router.post("/users/follow/:id", auth, async (req, res) => {
  try {
    var exist = false;
    const center = await Center.findById(req.params.id);
    if (!center) {
      return res.status(404).send({ message: "can't find center" });
    }
    const id = req.user._id;
    const centerId = center.id;
    req.user.followings.forEach((following) => {
      if (following == centerId) return (exist = true);
    });
    if (!exist) {
      center.followers.push(id);
      req.user.followings.push(centerId);
      await center.save();
      await req.user.save();
      res.send(center);
    }
    res.status(404).send({ message: "already following" });
  } catch (error) {
    res.status(500).send(error);
  }
});

//Unfollow a center
router.post("/users/unfollow/:id", auth, async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);
    if (!center) {
      return res.status(404).send({ message: "can't find center" });
    }
    const centerId = center.id;
    const userId = req.user.id;
    const index = req.user.followings.indexOf(centerId);
    if (index > -1) {
      req.user.followings.splice(index, 1);
      req.user.save();

      const indexF = center.followers.indexOf(userId);
      if (indexF > -1) {
        center.followers.splice(indexF, 1);
        center.save();
      }
    }
    res.send({ message: "successfully unfollowed" });
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

//Read followings
router.get("/users/follow", auth, async (req, res) => {
  try {
    const user = req.user;
    user.populate("followings").execPopulate(function (error, user) {
      res.send(user.followings);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

//User logout
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

//Read user Profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//Update user profile
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    "name",
    "email",
    "password",
    "age",
    "dateOfBirth",
    "pays",
    "ville",
    "adresse",
    "codePostale",
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }
  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });

    await req.user.save();

    /*const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });*/

    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Delete user
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
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

//Upload user avatar
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

//Delete user avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

module.exports = router;
