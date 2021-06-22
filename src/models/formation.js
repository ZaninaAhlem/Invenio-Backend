const mongoose = require("mongoose");

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
        name: {
          type: String,
        },
        avatar: {
          type: String,
        },
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Center",
    },
    inscriptionForm: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "InscriptionForm",
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

formationSchema.methods.toJSON = function () {
  const formation = this;
  const formationSchema = formation.toObject();

  return formationSchema;
};

const Formation = mongoose.model("Formation", formationSchema);

module.exports = Formation;
