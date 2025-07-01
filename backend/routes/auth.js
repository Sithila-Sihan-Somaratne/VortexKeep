// TO DO LIST/Backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Export a function that accepts the database instance
module.exports = (db) => {
  const router = express.Router();

  /**
   * @route POST /api/auth/signup
   * @desc Register a new user
   * @access Public
   */
  router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password.length < 8) { // Minimum length, frontend strong validator is better but reinforce here
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    try {
      // Check if user with this email already exists
      db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
          console.error('Database error during signup email check:', err.message);
          return res.status(500).json({ message: 'Internal server error.' });
        }
        if (row) {
          return res.status(409).json({ message: 'User with that email already exists.' });
        }

        // Hash the password
        const password_hash = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Insert new user into the database
        db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          [username, email, password_hash],
          function(insertErr) { // Use function() to access 'this' context for lastID
            if (insertErr) {
              console.error('Database error during user insertion:', insertErr.message);
              // Handle unique constraint error for username if needed, though email is primary for login
              if (insertErr.message.includes('UNIQUE constraint failed: users.username')) {
                return res.status(409).json({ message: 'Username already taken.' });
              }
              return res.status(500).json({ message: 'Failed to register user.' });
            }

            const userId = this.lastID; // Get the ID of the newly inserted user

            // Generate JWT (JSON Web Token)
            // Use a secret key from environment variables
            const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

            // Send success response with token and user ID
            res.status(201).json({ message: 'User registered successfully!', token, userId });
          }
        );
      });
    } catch (error) {
      console.error('Unhandled signup error:', error);
      res.status(500).json({ message: 'Internal server error during signup.' });
    }
  });

  /**
   * @route POST /api/auth/login
   * @desc Authenticate user & get token
   * @access Public
   */
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      // Find the user by email
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          console.error('Database error during login email check:', err.message);
          return res.status(500).json({ message: 'Internal server error.' });
        }
        if (!user) {
          // Use generic message to prevent user enumeration attacks
          return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send success response with token and user ID
        res.status(200).json({ message: 'Logged in successfully!', token, userId: user.id });
      });
    } catch (error) {
      console.error('Unhandled login error:', error);
      res.status(500).json({ message: 'Internal server error during login.' });
    }
  });

  return router;
};