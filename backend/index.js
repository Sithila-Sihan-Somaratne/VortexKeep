// backend/index.js

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Ensure dotenv is loaded to access process.env.
// Using the explicit path for clarity, and it should be only once.
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const authenticateToken = require("./middleware/auth"); // Your authentication middleware

// --- NEW: Require the tasks routes ---
const tasksRoutes = require("./routes/tasks");
// --- END NEW ---

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(bodyParser.json()); // Parse JSON request bodies

// Database setup
const db = new sqlite3.Database("./vortexkeep.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Create users table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )`,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err.message);
        } else {
          console.log("Users table ready.");
        }
      }
    );

    // --- NEW: Create tasks table if it doesn't exist ---
    db.run(
      `CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
      (err) => {
        if (err) {
          console.error("Error creating tasks table:", err.message);
        } else {
          console.log("Tasks table ready.");
        }
      }
    );
    // --- END NEW ---
  }
});

// Load JWT_SECRET from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error(
    "FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file."
  );
  process.exit(1);
}

// Authentication Routes
// Signup
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE constraint failed")) {
            return res
              .status(409)
              .json({ message: "Username or email already exists." });
          }
          console.error("Database insert error:", err.message);
          return res.status(500).json({ message: "Error registering user." });
        }
        const token = jwt.sign(
          { id: this.lastID, username, email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        res
          .status(201)
          .json({ message: "User registered successfully!", token });
      }
    );
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({ message: "Server error during login." });
    }
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    try {
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.json({
        message: "Logged in successfully!",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login." });
    }
  });
});

// --- NEW: Use the tasks routes. Pass the 'db' instance to the tasksRoutes function. ---
// All requests to /api/tasks will be handled by routes defined in tasks.js
app.use("/api/tasks", tasksRoutes(db)); // Pass the db instance
// --- END NEW ---

// --- Existing Protected Route Example ---
// This route will only be accessible if a valid JWT token is provided in the request header.
app.get("/api/protected/profile", authenticateToken, (req, res) => {
  // If we reach this point, authenticateToken middleware has successfully verified the token
  // and attached the user payload to req.user
  res.json({
    message: "Welcome to the protected profile data!",
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    },
    data: "This is sensitive information only for authenticated users.",
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});