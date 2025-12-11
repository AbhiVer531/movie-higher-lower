const express = require("express");
const router = express.Router();
const GameResult = require("../models/GameResult");

router.use(express.urlencoded({ extended: true }));

const movieList = [
  "Inception", "The Matrix", "Interstellar", "The Godfather",
  "The Dark Knight", "Pulp Fiction", "Fight Club",
  "Forrest Gump", "Gladiator", "Titanic"
];

router.get("/", async (req, res) => {
  try {
    if (!req.session.currentSessionId) {
      req.session.currentSessionId = 1;
    }

    // Get difficulty from query params, default to "easy"
    const difficulty = req.query.difficulty || req.session.difficulty || "easy";
    req.session.difficulty = difficulty;

    // Set standard deviation based on difficulty
    const difficultyMap = {
      easy: 3,
      medium: 2,
      hard: 1
    };
    const sd = difficultyMap[difficulty];

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


    let fakeRating = clipNumberToRange(gaussianRandom(mean=realRating, stdev=sd), 0, 10).toFixed(1);
    while (fakeRating == realRating) {
      fakeRating = clipNumberToRange(gaussianRandom(mean=realRating, stdev=sd), 0, 10).toFixed(1);
    }

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

router.post("/guess", async (req, res) => {
  const guess = req.body.guess;
  const movie = JSON.parse(decodeURIComponent(req.body.movieData));

  const fakeRating = parseFloat(movie.fakeRating);
  const realRating = parseFloat(movie.realRating);

  const wasCorrect =
    (guess === "higher" && realRating > fakeRating) ||
    (guess === "lower" && realRating < fakeRating);

  const sessionId = req.session.currentSessionId;
  const difficulty = req.session.difficulty || "easy";

  await GameResult.create({
    sessionId,
    movieTitle: movie.Title,
    fakeRating,
    realRating,
    userGuess: guess,
    correct: wasCorrect,
    difficulty
  });

  if (!wasCorrect) {
    req.session.currentSessionId += 1; 
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

  res.render("result", {
    movie,
    fakeRating,
    realRating,
    guess,
    wasCorrect,
    sessionEnded: false
  });
});

// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

// clip to range 0-10 (both exclusive)
function clipNumberToRange(num, min, max) {
  return Math.min(Math.max(num, min+0.1), max-0.1);
}

module.exports = router;
