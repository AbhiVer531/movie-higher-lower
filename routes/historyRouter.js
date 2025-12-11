const express = require("express");
const router = express.Router();
const GameResult = require("../models/GameResult");

router.get("/", async (req, res) => {
  const results = await GameResult.find().sort({ timestamp: -1 });

  const sessions = {};
  results.forEach(r => {
    if (!sessions[r.sessionId]) sessions[r.sessionId] = [];
    sessions[r.sessionId].push(r);
  });

  const sessionArray = Object.keys(sessions)
    .sort((a, b) => b - a)
    .map(sessionId => ({
      sessionId,
      rounds: sessions[sessionId],
      correct: sessions[sessionId].filter(r => r.correct).length,
      total: sessions[sessionId].length,
      accuracy: ((sessions[sessionId].filter(r => r.correct).length) / sessions[sessionId].length * 100).toFixed(1),
      difficulty: sessions[sessionId][0]?.difficulty || "unknown"
    }));

  res.render("history", { sessionArray });
});

module.exports = router;
