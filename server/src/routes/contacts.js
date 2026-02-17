const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT c.*, co.name as company_name FROM contacts c LEFT JOIN companies co ON c.company_id = co.id WHERE c.user_id = $1 ORDER BY c.created_at DESC',
    [req.user.userId]
  );
  const rows = result.rows.map((r) => ({
    ...r,
    custom_fields: r.custom_fields || {},
  }));
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, email, phone, company_id, custom_fields } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const cf = custom_fields && typeof custom_fields === 'object' ? custom_fields : {};
  const result = await pool.query(
    'INSERT INTO contacts (user_id, name, email, phone, company_id, custom_fields) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [req.user.userId, name, email || null, phone || null, company_id || null, JSON.stringify(cf)]
  );
  const row = result.rows[0];
  res.status(201).json({ ...row, custom_fields: row.custom_fields || {} });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company_id, custom_fields } = req.body;
  const updates = ['updated_at = CURRENT_TIMESTAMP'];
  const params = [id, req.user.userId];
  let p = 3;
  if (name !== undefined) { updates.push(`name = $${p++}`); params.push(name); }
  if (email !== undefined) { updates.push(`email = $${p++}`); params.push(email); }
  if (phone !== undefined) { updates.push(`phone = $${p++}`); params.push(phone); }
  if (company_id !== undefined) { updates.push(`company_id = $${p++}`); params.push(company_id); }
  if (custom_fields !== undefined && typeof custom_fields === 'object') {
    updates.push(`custom_fields = $${p++}`);
    params.push(JSON.stringify(custom_fields));
  }
  const result = await pool.query(
    `UPDATE contacts SET ${updates.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`,
    params
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  const row = result.rows[0];
  res.json({ ...row, custom_fields: row.custom_fields || {} });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.userId]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  res.status(204).send();
});

module.exports = router;
