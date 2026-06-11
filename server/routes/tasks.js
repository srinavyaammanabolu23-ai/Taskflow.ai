const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Utility to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Apply authentication middleware to all task routes
router.use(authenticateToken);

// Get all tasks for the logged-in user
router.get('/', (req, res) => {
  db.all('SELECT * FROM tasks WHERE userId = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Parse tags back into an array
    const tasks = rows.map(row => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : []
    }));
    
    res.json(tasks);
  });
});

// Create a new task
router.post('/', (req, res) => {
  const { title, description, status, priority, dueDate, tags } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const id = generateId();
  const now = new Date().toISOString();
  const tagsString = JSON.stringify(tags || []);

  db.run(
    `INSERT INTO tasks (id, title, description, status, priority, dueDate, tags, userId, createdAt, updatedAt) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, title, description || '', status || 'todo', priority || 'medium', 
      dueDate || null, tagsString, req.user.id, now, now
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Return the newly created task
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        row.tags = row.tags ? JSON.parse(row.tags) : [];
        res.status(201).json(row);
      });
    }
  );
});

// Update a task
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, tags } = req.body;
  const now = new Date().toISOString();

  // Make sure the task belongs to the user
  db.get('SELECT * FROM tasks WHERE id = ? AND userId = ?', [id, req.user.id], (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: 'Task not found or unauthorized.' });

    const tagsString = tags !== undefined ? JSON.stringify(tags) : task.tags;

    db.run(
      `UPDATE tasks SET 
       title = ?, description = ?, status = ?, priority = ?, dueDate = ?, tags = ?, updatedAt = ? 
       WHERE id = ? AND userId = ?`,
      [
        title || task.title, 
        description !== undefined ? description : task.description, 
        status || task.status, 
        priority || task.priority, 
        dueDate !== undefined ? dueDate : task.dueDate, 
        tagsString,
        now, 
        id, 
        req.user.id
      ],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Return updated task
        db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          row.tags = row.tags ? JSON.parse(row.tags) : [];
          res.json(row);
        });
      }
    );
  });
});

// Delete a task
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ? AND userId = ?', [id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Task not found or unauthorized.' });
    
    res.json({ message: 'Task deleted successfully.', id });
  });
});

module.exports = router;
