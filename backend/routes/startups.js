const express = require("express");
const router = express.Router();

const startups = require("../data/startups");
const state = require("../data/userState");

// GET /api/startups
router.get("/", (req, res) => {
  const { mode } = req.query;

  if (mode === "feed") {
    const unseen = startups.filter(
      (s) => !state.liked.has(s.id) && !state.passed.has(s.id)
    );
    return res.json(unseen);
  }

  res.json(startups);
});

// GET /api/startups/:id
router.get("/:id", (req, res) => {
  const startup = startups.find((s) => s.id === req.params.id);
  if (!startup) return res.status(404).json({ error: "Not found" });

  res.json(startup);
});

// POST /api/startups/:id/like
router.post("/:id/like", (req, res) => {
  state.liked.add(req.params.id);
  state.passed.delete(req.params.id);
  res.json({ success: true });
});

// POST /api/startups/:id/pass
router.post("/:id/pass", (req, res) => {
  state.passed.add(req.params.id);
  state.liked.delete(req.params.id);
  res.json({ success: true });
});

// GET /api/startups/user/watchlist
router.get("/user/watchlist", (req, res) => {
  const list = startups.filter((s) => state.liked.has(s.id));
  res.json(list);
});

module.exports = router;