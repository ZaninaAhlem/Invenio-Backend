const mongoose = require("mongoose");

const inscriptionFormSchema = new mongoose.Schema({
  labels: [
    {
      type: String,
      required: true,
    },
  ],
});

const InscriptionForm = mongoose.model(
  "InscriptionForm",
  inscriptionFormSchema
);

module.exports = InscriptionForm;
