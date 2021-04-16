const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const centerRouter = require("./routers/center");
const formationRouter = require("./routers/formation");
const searchRouter = require("./routers/search");

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(centerRouter);
app.use(formationRouter);
app.use(searchRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
