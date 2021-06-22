const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    socketId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      // unique: true,
      required: true,
      trim: true,
      lowercase: true,
      // validate(value) {
      //   if (!validator.isEmail(value)) {
      //     throw new Error("Email is invalid");
      //   }
      // },
    },
    password: {
      type: String,
      required: true,
      // minlength: 7,
      trim: true,
      // validate(value) {
      //   if (value.toLowerCase().includes("password")) {
      //     throw new Error("invalid password");
      //   }
      // },
    },
    age: {
      type: Number,
      default: 18,
      // validate(value) {
      //   if (value < 0) {
      //     throw new Error(" Age must be a positive number");
      //   }
      // },
    },
    dateOfBirth: {
      type: Number,
      //required: true,
      // validate(value) {
      //   if (!validator.isDate(value)) {
      //     throw new Error("Invalid Date");
      //   }
      // },
    },
    pays: {
      type: String,
      //required: true,
    },
    ville: {
      type: String,
      //required: true,
    },
    adresse: {
      type: String,
      //required: true,
    },
    codePostale: {
      type: Number,
      //required: true,
    },
    formations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Formation",
        // unique: true,
      },
    ],
    notifications: [
      {
        center: {
          type: String,
        },
        avatar: {
          type: String,
        },
        formation: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Formation",
        },
        notification: {
          type: String,
        },
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Center",
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

userSchema.virtual("rooms", {
  ref: "Room",
  localField: "_id",
  foreignField: "userId",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  // delete userObject.password;
  delete userObject.tokens;
  //delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  user.tokens = user.tokens.concat({ token });

  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  console.log(email);
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  // const isMatch = await bcrypt.compare(password, user.password);

  if (password !== user.password) {
    throw new Error("Unable to login");
  }

  return user;
};

//Hash the plain text password before saving
// userSchema.pre("save", async function (next) {
//   const user = this;

//   if (user.isModified("password")) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }

//   next();
// });

const User = mongoose.model("User", userSchema);

module.exports = User;
