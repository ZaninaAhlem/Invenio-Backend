const mongoose = require("mongoose");

const url = process.env.MONGODB_URL;

mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

// MONGODB_URL=mongodb+srv://Invenio:invenio2021@cluster0.2dmqc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

//MONGODB_URL=mongodb://127.0.0.1:27017/invenio-api
