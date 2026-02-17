const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const result = await pool.query(
    `SELECT d.*, c.name as contact_name, co.name as company_name 
     FROM deals d 
     LEFT JOIN contacts c ON d.contact_id = c.id 
     LEFT JOIN companies co ON d.company_id = co.id 
     WHERE d.user_id = $1 ORDER BY d.created_at DESC`,
    [req.user.userId]
  );
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { title, value, stage, contact_id, company_id } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const result = await pool.query(
    'INSERT INTO deals (user_id, title, value, stage, contact_id, company_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [req.user.userId, title, value || 0, stage || 'lead', contact_id || null, company_id || null]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, value, stage, contact_id, company_id } = req.body;
  const result = await pool.query(
    `UPDATE deals SET 
      title = COALESCE($2, title), 
      value = COALESCE($3, value), 
      stage = COALESCE($4, stage),
      contact_id = COALESCE($5, contact_id),
      company_id = COALESCE($6, company_id),
      updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1 AND user_id = $7 RETURNING *`,
    [id, title, value, stage, contact_id, company_id, req.user.userId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Deal not found' });
  }
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM deals WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.userId]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Deal not found' });
  }
  res.status(204).send();
});

module.exports = router;
