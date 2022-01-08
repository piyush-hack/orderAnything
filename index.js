const express = require("express");
const mongoose = require("mongoose");
// const auth = require('./middleware/auth');
const cors = require("cors");
const path = require("path");

const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
const app = express();
app.use(cookieParser());
app.use(cors());

mongoose.connect(
  "mongodb://localhost:27017/orderAnything",
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("I'm connected to database");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Adding Router to Different Routes

const userrouter = require("./routes/user");
const profilerouter = require("./routes/profile");
const adminrouter = require("./routes/admin");
const dprouter = require("./routes/delperProfile");

// redirecting
app.use("/user", userrouter);
app.use("/profile", profilerouter);
app.use("/admin", adminrouter);
app.use("/dp", dprouter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
  console.log(`connected to the port ${port}`);
});
