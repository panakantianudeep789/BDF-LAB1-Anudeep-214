// ──────────────────────────────────────────────────────────────────
// Lab 2 – SQLite database and CRUD routes
// Backend Development Fundamentals · Year II Term II · Aurora
// Name   : Anudeep panakanti
// Reg No : 214
// Section: 214 CSE-2D
// ──────────────────────────────────────────────────────────────────

const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json()); // parse JSON request bodies

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "books.db");

let db; // will hold the database connection after initialization

// ── initializeDBAndServer ──────────────────────────────────────────
// Opens the SQLite connection and creates the table if it doesn't
// exist, then starts Express only after the DB is ready.
const initializeDBAndServer = async () => {
  try {
    // Open (or create) the database file
    db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });

    // Create the books table if it doesn't exist yet
    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        title   TEXT    NOT NULL,
        author  TEXT    NOT NULL,
        price   INTEGER NOT NULL,
        pages   INTEGER NOT NULL
      );
    `);

    // Seed 10 rows only when the table is empty
    const count = await db.get("SELECT COUNT(*) AS cnt FROM book");
    if (count.cnt === 0) {
      await db.exec(`
        INSERT INTO book (title, author, price, pages) VALUES
          ('The Pragmatic Programmer',      'Andrew Hunt',       499, 352),
          ('Clean Code',                    'Robert C. Martin',  399, 464),
          ('You Don''t Know JS',            'Kyle Simpson',      299, 278),
          ('JavaScript: The Good Parts',   'Douglas Crockford', 349, 176),
          ('Eloquent JavaScript',           'Marijn Haverbeke',  249, 472),
          ('Node.js Design Patterns',       'Mario Casciaro',    599, 660),
          ('Learning SQL',                  'Alan Beaulieu',     449, 338),
          ('Database System Concepts',      'Silberschatz',      799, 1376),
          ('Pro Git',                       'Scott Chacon',      299, 574),
          ('The Web Application Hacker''s Handbook', 'Stuttard', 649, 912);
      `);
      console.log("  Database seeded with 10 books.");
    }

    // Start the HTTP server only after DB is ready
    app.listen(PORT, () => {
      console.log(`\n  Express + SQLite server running!`);
      console.log(`   Local : http://localhost:${PORT}`);
      console.log(`   DB    : ${DB_PATH}\n`);
    });
  } catch (error) {
    console.error("DB initialization failed:", error.message);
    process.exit(1);
  }
};

// ══════════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════════

// ── GET /books/ ───────────────────────────────────────────────────
// Returns all books in the database as a JSON array (HTTP 200)
app.get("/books/", async (req, res) => {
  try {
    const books = await db.all("SELECT * FROM book ORDER BY id");
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /books/:bookId/ ───────────────────────────────────────────
// Returns one book by its id.
// 200 if found, 404 if not found.
app.get("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;
    // ? placeholder prevents SQL injection
    const book = await db.get("SELECT * FROM book WHERE id = ?", [bookId]);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /books/ ──────────────────────────────────────────────────
// Adds a new book. Expects JSON body: { title, author, price, pages }
// Returns 201 Created with the new book's id.
app.post("/books/", async (req, res) => {
  try {
    const { title, author, price, pages } = req.body;
    if (!title || !author || price == null || pages == null) {
      return res
        .status(400)
        .json({ error: "title, author, price and pages are required" });
    }
    const result = await db.run(
      "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)",
      [title, author, price, pages]
    );
    res.status(201).json({ id: result.lastID, message: "Book added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /books/:bookId/ ───────────────────────────────────────────
// Updates an existing book by id.
// Expects JSON body with any subset of { title, author, price, pages }.
// Returns 200 with a success message, or 404 if not found.
app.put("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;

    // Check the book exists first
    const existing = await db.get("SELECT * FROM book WHERE id = ?", [bookId]);
    if (!existing) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Merge incoming fields with existing values (partial update support)
    const title  = req.body.title  ?? existing.title;
    const author = req.body.author ?? existing.author;
    const price  = req.body.price  ?? existing.price;
    const pages  = req.body.pages  ?? existing.pages;

    await db.run(
      "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
      [title, author, price, pages, bookId]
    );
    res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /books/:bookId/ ────────────────────────────────────────
// Removes a book by id.
// Returns 200 with a success message, or 404 if not found.
app.delete("/books/:bookId/", async (req, res) => {
  try {
    const { bookId } = req.params;
    const existing = await db.get("SELECT * FROM book WHERE id = ?", [bookId]);
    if (!existing) {
      return res.status(404).json({ error: "Book not found" });
    }
    await db.run("DELETE FROM book WHERE id = ?", [bookId]);
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: "404 – Route not found",
    path: req.originalUrl,
  });
});

// ── Bootstrap ─────────────────────────────────────────────────────
initializeDBAndServer();

