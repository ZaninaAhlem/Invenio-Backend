const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const centerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("invalid password");
        }
      },
    },
    pays: {
      type: String,
      //required: true,
    },
    bio: {
      type: String,
      //required: true,
    },
    specialities: {
      type: String,
      //required: true,
    },
    type: {
      type: String,
      //required: true,
    },
    founded: {
      type: String,
      //required: true,
    },
    adresse: {
      type: String,
      //required: true,
    },
    phoneNumber: {
      type: Number,
      // required: true,
      // validate(value) {
      //   if (!validator.isMobilePhone(value.toString())) {
      //     throw new Error("Invalid phone number");
      //   }
      // },
    },
    categories: [
      {
        type: String,
        //required: true,
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

centerSchema.virtual("formations", {
  ref: "Formation",
  localField: "_id",
  foreignField: "owner",
});

centerSchema.virtual("rooms", {
  ref: "Room",
  localField: "_id",
  foreignField: "centerId",
});

centerSchema.virtual("formateurs", {
  ref: "Formateur",
  localField: "_id",
  foreignField: "center",
});

centerSchema.methods.toJSON = function () {
  const center = this;
  const centerObject = center.toObject();

  // delete centerObject.password;
  delete centerObject.tokens;

  return centerObject;
};

centerSchema.methods.generateAuthToken = async function () {
  const center = this;
  const token = jwt.sign(
    { _id: center._id.toString() },
    process.env.JWT_SECRET
  );

  // center.tokens = center.tokens.concat({ token });

  // await center.save();
  return token;
};

centerSchema.statics.findByCredentials = async (email, password) => {
  const center = await Center.findOne({ email });

  if (!center) {
    throw new Error("Unable to login");
  }

  // const isMatch = await bcrypt.compare(password, center.password);

  if (password !== center.password) {
    throw new Error("Unable to login");
  }

  return center;
};

// centerSchema.pre("save", async function (next) {
//   const center = this;

//   if (center.isModified("password")) {
//     center.password = await bcrypt.hash(center.password, 8);
//   }

//   next();
// });

const Center = mongoose.model("Center", centerSchema);

module.exports = Center;
