const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET all homestays
// http://localhost:5000/api/homestays
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM homestays WHERE status = 'available' ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single homestay by ID
// http://localhost:5000/api/homestays/1
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM homestays WHERE id = ? AND status = 'available'",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Homestay not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET search homestays
// http://localhost:5000/api/homestays/search?guests=4&name=Anderson
router.get('/search/filter', async (req, res) => {
  try {
    const { guests, name } = req.query;
    let sql    = "SELECT * FROM homestays WHERE status = 'available'";
    let params = [];

    if (guests) {
      sql += " AND max_guests >= ?";
      params.push(parseInt(guests));
    }

    if (name && name !== 'All Homestays') {
      sql += " AND name LIKE ?";
      params.push(`%${name}%`);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;