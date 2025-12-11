const express = require("express");
const router = express.Router();
const GameResult = require("../models/GameResult");

router.use(express.urlencoded({ extended: true }));

const movieList = [
  "Inception", "The Matrix", "Interstellar", "The Godfather",
  "The Dark Knight", "Pulp Fiction", "Fight Club", "Forrest Gump",
  "Gladiator", "Titanic", "The Shawshank Redemption", "Parasite",
  "Joker", "The Lion King", "Avatar", "Avengers Endgame",
  "The Silence of the Lambs", "Se7en", "Goodfellas", "The Usual Suspects",
  "Whiplash", "Moonlight", "La La Land", "Get Out",
  "A Quiet Place", "Hereditary", "The Lighthouse", "Uncut Gems",
  "Knives Out", "Dune", "Everything Everywhere All at Once"
];

router.get("/", async (req, res) => {
  try {
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

    // Generate fake rating closer to real rating for difficulty
    const spread = 1.2; // Spread range around real rating
    const offset = (Math.random() * 2 - 1) * spread;
    let fakeRating = realRating + offset;
    
    // Clamp to [0, 10] and ensure it's not equal to real rating
    fakeRating = Math.min(10, Math.max(0, fakeRating));
    if (Math.abs(fakeRating - realRating) < 0.2) {
      fakeRating = realRating + (fakeRating > realRating ? 0.3 : -0.3);
      fakeRating = Math.min(10, Math.max(0, fakeRating));
    }
    fakeRating = parseFloat(fakeRating.toFixed(1));

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

  await GameResult.create({
    sessionId,
    movieTitle: movie.Title,
    fakeRating,
    realRating,
    userGuess: guess,
    correct: wasCorrect
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

module.exports = router;
