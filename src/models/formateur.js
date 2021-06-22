const mongoose = require("mongoose");

const formateurSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  center: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Center",
  },
});

const Formateur = mongoose.model("Formateur", formateurSchema);

module.exports = Formateur;
