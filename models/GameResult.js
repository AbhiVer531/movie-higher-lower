const mongoose = require("mongoose");

const GameResultSchema = new mongoose.Schema({
    sessionId: Number,
    movieTitle: String,
    fakeRating: Number,
    realRating: Number,
    userGuess: String,
    correct: Boolean,
    difficulty: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GameResult", GameResultSchema);