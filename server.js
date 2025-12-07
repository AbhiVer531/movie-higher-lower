require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB connection error:", err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "movie_higher_lower_secret_key",
    resave: false,
    saveUninitialized: true
  })
);

const gameRouter = require("./routes/gameRouter");
app.use("/game", gameRouter);

const historyRouter = require("./routes/historyRouter");
app.use("/history", historyRouter);

const GameResult = require("./models/GameResult");

app.post("/reset", async (req, res) => {
  await GameResult.deleteMany({});
  req.session.currentSessionId = 1;
  res.redirect("/");
});

app.get("/", (req, res) => {
  if (!req.session.currentSessionId) {
    req.session.currentSessionId = 1;
  }
  res.render("home");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
