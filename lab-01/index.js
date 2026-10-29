// ──────────────────────────────────────────────────────────────────
// Lab 1 – Node.js and Express server
// Backend Development Fundamentals · Year II Term II · Aurora
// Name   : Anudeep panakanti
// Reg No : 214
// Section: 214 CSE-2D
// ──────────────────────────────────────────────────────────────────

const express = require("express");

// Create the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// ── Route 1: GET / ─────────────────────────────────────────────────
// Returns a plain-text welcome message with HTTP 200
app.get("/", (req, res) => {
  res.status(200).send("HELLO Anudeep!!!");
});

// ── Route 2: GET /about ────────────────────────────────────────────
// Returns JSON containing student name and section with HTTP 200
app.get("/about", (req, res) => {
  res.status(200).json({
    name: "Anudeep panakanti",
    section: "214 CSE-2D",
  });
});

// ── Route 3: GET /time ─────────────────────────────────────────────
// Returns the current server date and time as JSON with HTTP 200
app.get("/time", (req, res) => {
  const now = new Date();
  res.status(200).json({
    currentTime: now.toISOString(),           // ISO-8601 format
    readable: now.toLocaleString("en-IN", {   // human-readable local time
      timeZone: "Asia/Kolkata",
    }),
    timestamp: now.getTime(),                 // Unix timestamp (ms)
  });
});

// ── 404 handler ────────────────────────────────────────────────────
// Catches every request that did not match any route above
app.use((req, res) => {
  res.status(404).json({
    error: "404 - Route not found",
    path: req.originalUrl,
    message: "The requested endpoint does not exist on this server.",
  });
});

// ── Start the server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Express server is running!`);
  console.log(`   Local:  http://localhost:${PORT}`);
  console.log(`\n   Routes:`);
  console.log(`   GET  /       -> Welcome message  (200)`);
  console.log(`   GET  /about  -> Student info JSON (200)`);
  console.log(`   GET  /time   -> Current date/time (200)`);
  console.log(`   *            -> 404 handler       (404)\n`);
});
