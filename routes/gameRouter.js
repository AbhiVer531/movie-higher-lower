const express = require("express");
const router = express.Router();
const GameResult = require("../models/GameResult");

// Needed for POST parsing
router.use(express.urlencoded({ extended: true }));

const movieList = [
  "Inception", "The Matrix", "Interstellar", "The Godfather",
  "The Dark Knight", "Pulp Fiction", "Fight Club",
  "Forrest Gump", "Gladiator", "Titanic"
];

// GET /game — fetch a real movie
router.get("/", async (req, res) => {
  try {
    // Ensure session ID exists
    if (!req.session.currentSessionId) {
      req.session.currentSessionId = 1;
    }

    const randomMovie = movieList[Math.floor(Math.random() * movieList.length)];

    const apiKey = process.env.OMDB_API_KEY;
    const apiUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(randomMovie)}&apikey=${apiKey}`;

    const response = await fetch(apiUrl);
    const movieData = await response.json();

    const movieTitle = movieData.Title;
    const movieYear = movieData.Year;
    const realRating = parseFloat(movieData.imdbRating);
    const posterUrl = movieData.Poster;
    const moviePlot = movieData.Plot;

    const fakeRating = (Math.random() * 10).toFixed(1);

    res.render("game", {
      movieTitle,
      movieYear,
      posterUrl,
      moviePlot,
      fakeRating,
      realRating
    });

  } catch (err) {
    console.error(err);
    res.send("Error fetching movie data");
  }
});

// POST /game/guess
router.post("/guess", async (req, res) => {
  const guess = req.body.guess;
  const movie = JSON.parse(decodeURIComponent(req.body.movieData));

  const fakeRating = parseFloat(movie.fakeRating);
  const realRating = parseFloat(movie.realRating);

  const wasCorrect =
    (guess === "higher" && realRating > fakeRating) ||
    (guess === "lower" && realRating < fakeRating);

  const sessionId = req.session.currentSessionId;

  // Save result
  await GameResult.create({
    sessionId,
    movieTitle: movie.Title,
    fakeRating,
    realRating,
    userGuess: guess,
    correct: wasCorrect
  });

  // If user guesses wrong → end session
  if (!wasCorrect) {
    req.session.currentSessionId += 1; // next session will start on next Start Game
    res.render("result", {
      movie,
      fakeRating,
      realRating,
      guess,
      wasCorrect,
      sessionEnded: true
    });
    return;
  }

  // If correct → continue game
  res.render("result", {
    movie,
    fakeRating,
    realRating,
    guess,
    wasCorrect,
    sessionEnded: false
  });
});

module.exports = router;
