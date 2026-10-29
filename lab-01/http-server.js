// ──────────────────────────────────────────────────────
// Lab 1 – Step 3: Plain HTTP server (kept for reference)
// Run separately with: node http-server.js
// ──────────────────────────────────────────────────────
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello");
});

server.listen(3001, () => {
  console.log("Plain HTTP server running on http://localhost:3001");
});

