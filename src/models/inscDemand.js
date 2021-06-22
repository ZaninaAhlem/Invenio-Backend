const mongoose = require("mongoose");

const inscDemand = new mongoose.Schema({
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Formation",
  },
  responses: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
      name: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
      },
      response: [
        {
          type: String,
          required: true,
        },
      ],
    },
  ],
});

const InscDemand = mongoose.model("InscDemand", inscDemand);

module.exports = InscDemand;
