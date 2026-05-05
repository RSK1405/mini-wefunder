// server.js — Mini Wefunder API
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const startupRoutes = require("./routes/startups");
const dealRoomRoutes = require("./routes/dealRoom");
const analyzeRoute   = require("./routes/analyze");

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Request logger (dev only)
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/startups", startupRoutes);
app.use("/api/deal-room", dealRoomRoutes);
app.use("/api/analyze",   analyzeRoute); 

// Health check
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Mini Wefunder API running on http://localhost:${PORT}`);
  console.log(
    `🤖 AI mode: ${process.env.OPENAI_API_KEY ? "OpenAI GPT-4o-mini" : "Mock (no API key)"}\n`
  );
});
