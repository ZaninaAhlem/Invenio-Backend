const mongoose = require("mongoose");
const validator = require("validator");

const formationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
    },
    subscribers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        //unique: true,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Center",
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

formationSchema.methods.toJSON = function () {
  const formation = this;
  const formationSchema = formation.toObject();

  delete formationSchema.image;

  return formationSchema;
};

const Formation = mongoose.model("Formation", formationSchema);

module.exports = Formation;
