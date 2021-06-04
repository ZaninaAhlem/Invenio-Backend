const mongoose = require("mongoose");

const url = process.env.MONGODB_URL;

mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
