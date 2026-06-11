const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

// Utility to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, avatarColor } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.status(400).json({ error: 'Email already exists.' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = generateId();

      // Insert new user
      db.run(
        'INSERT INTO users (id, name, email, password, avatarColor) VALUES (?, ?, ?, ?, ?)',
        [id, name, email, hashedPassword, avatarColor || '#34d399'],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          
          // Generate token
          const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '24h' });
          
          res.status(201).json({
            token,
            user: { id, name, email, avatarColor: avatarColor || '#34d399' }
          });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor
      }
    });
  });
});

// Get current user (protected route)
router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, avatarColor FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    
    res.json({ user });
  });
});

module.exports = router;
