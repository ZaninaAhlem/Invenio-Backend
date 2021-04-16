const jwt = require("jsonwebtoken");
const Center = require("../models/center");

const centerAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const center = await Center.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!center) {
      throw new Error();
    }

    req.token = token;
    req.center = center;
    next();
  } catch (error) {
    res.status(401).send({ Error: "Please authenticate" });
  }
};

module.exports = centerAuth;
