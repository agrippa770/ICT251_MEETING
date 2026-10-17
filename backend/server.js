require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// GET all meetings
app.get('/api/meetings', (req, res) => {
  const rows = db.prepare('SELECT * FROM meetings ORDER BY id').all();
  res.json(rows);
});

// GET one meeting
app.get('/api/meetings/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM meetings WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Meeting not found' });
  res.json(row);
});

// POST create a meeting
app.post('/api/meetings', (req, res) => {
  const { book_title, author, meeting_date, meeting_time, location, host_name } = req.body;
  if (!book_title) return res.status(400).json({ error: 'book_title is required' });

  const result = db.prepare(`
    INSERT INTO meetings (book_title, author, meeting_date, meeting_time, location, host_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(book_title, author, meeting_date, meeting_time, location, host_name);

  const created = db.prepare('SELECT * FROM meetings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT update a meeting
app.put('/api/meetings/:id', (req, res) => {
  const { book_title, author, meeting_date, meeting_time, location, host_name } = req.body;
  if (!book_title) return res.status(400).json({ error: 'book_title is required' });

  const result = db.prepare(`
    UPDATE meetings
    SET book_title = ?, author = ?, meeting_date = ?, meeting_time = ?,
        location = ?, host_name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(book_title, author, meeting_date, meeting_time, location, host_name, req.params.id);

  if (result.changes === 0) return res.status(404).json({ error: 'Meeting not found' });
  const updated = db.prepare('SELECT * FROM meetings WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE a meeting
app.delete('/api/meetings/:id', (req, res) => {
  const result = db.prepare('DELETE FROM meetings WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Meeting not found' });
  res.json({ message: 'Meeting deleted', id: Number(req.params.id) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));