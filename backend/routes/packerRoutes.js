const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all packer entries
router.get('/entries', (req, res) => {
  const query = 'SELECT * FROM packer_entries ORDER BY date DESC, time_in DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching entries:', err);
      return res.status(500).json({ error: 'Failed to fetch entries' });
    }
    res.json(results);
  });
});

// GET single entry by ID
router.get('/entries/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('SELECT * FROM packer_entries WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching entry:', err);
      return res.status(500).json({ error: 'Failed to fetch entry' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    res.json(results[0]);
  });
});

// POST new packer entry
router.post('/entries', (req, res) => {
  const { date, billNumber, packerName, timeIn, timeOut } = req.body;

  // Validation
  if (!date || !billNumber || !packerName || !timeIn) {
    return res.status(400).json({ 
      error: 'Date, Bill Number, Packer Name, and Time In are required' 
    });
  }

  const query = `
    INSERT INTO packer_entries 
    (date, bill_number, packer_name, time_in, time_out) 
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [date, billNumber, packerName, timeIn, timeOut || null],
    (err, result) => {
      if (err) {
        console.error('Error creating entry:', err);
        return res.status(500).json({ error: 'Failed to create entry' });
      }

      res.status(201).json({
        message: 'Entry created successfully',
        id: result.insertId
      });
    }
  );
});

// PUT update packer entry
router.put('/entries/:id', (req, res) => {
  const { id } = req.params;
  const { date, billNumber, packerName, timeIn, timeOut } = req.body;

  // Validation
  if (!date || !billNumber || !packerName || !timeIn) {
    return res.status(400).json({ 
      error: 'Date, Bill Number, Packer Name, and Time In are required' 
    });
  }

  const query = `
    UPDATE packer_entries 
    SET date = ?, bill_number = ?, packer_name = ?, time_in = ?, time_out = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [date, billNumber, packerName, timeIn, timeOut || null, id],
    (err, result) => {
      if (err) {
        console.error('Error updating entry:', err);
        return res.status(500).json({ error: 'Failed to update entry' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      res.json({ message: 'Entry updated successfully' });
    }
  );
});

// DELETE packer entry
router.delete('/entries/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM packer_entries WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting entry:', err);
      return res.status(500).json({ error: 'Failed to delete entry' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted successfully' });
  });
});

// GET packer statistics (for reports)
router.get('/stats', (req, res) => {
  const { startDate, endDate } = req.query;
  
  let query = `
    SELECT 
      packer_name,
      COUNT(*) as total_bills,
      DATE(date) as work_date
    FROM packer_entries
    WHERE 1=1
  `;
  const params = [];

  if (startDate && endDate) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }

  query += ' GROUP BY packer_name, DATE(date) ORDER BY date DESC';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching stats:', err);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
    res.json(results);
  });
});

module.exports = router;