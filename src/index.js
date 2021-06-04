const express = require("express");
require("./db/mongoose");
const cors = require("cors");
const userRouter = require("./routers/user");
const centerRouter = require("./routers/center");
const formationRouter = require("./routers/formation");
const searchRouter = require("./routers/search");
const roomRouter = require("./routers/room");

const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(userRouter);
app.use(centerRouter);
app.use(formationRouter);
app.use(searchRouter);
app.use(roomRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
