const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/me', async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, name, created_at FROM users WHERE id = $1',
    [req.user.userId]
  );
  const user = result.rows[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

module.exports = router;
