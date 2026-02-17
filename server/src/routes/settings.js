const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/custom-fields', async (req, res) => {
  const { entity_type } = req.query;
  let query = 'SELECT * FROM custom_fields WHERE user_id = $1';
  const params = [req.user.userId];
  if (entity_type) {
    query += ' AND entity_type = $2';
    params.push(entity_type);
  }
  query += ' ORDER BY entity_type, display_order, field_name';
  const result = await pool.query(query, params);
  const rows = result.rows.map((r) => ({
    ...r,
    slug: r.slug || r.field_name?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') || `field_${r.id}`,
  }));
  res.json(rows);
});

router.post('/custom-fields', async (req, res) => {
  const { entity_type, field_name, field_type } = req.body;
  if (!entity_type || !field_name) {
    return res.status(400).json({ error: 'entity_type and field_name are required' });
  }
  if (!['contact', 'company'].includes(entity_type)) {
    return res.status(400).json({ error: 'entity_type must be contact or company' });
  }
  const allowedTypes = ['text', 'number', 'email', 'phone', 'date', 'url'];
  const type = allowedTypes.includes(field_type) ? field_type : 'text';
  const slug = field_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  if (!slug) {
    return res.status(400).json({ error: 'Invalid field name' });
  }
  try {
    const orderResult = await pool.query(
      'SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM custom_fields WHERE user_id = $1 AND entity_type = $2',
      [req.user.userId, entity_type]
    );
    const displayOrder = orderResult.rows[0]?.next_order ?? 0;
    const result = await pool.query(
      'INSERT INTO custom_fields (user_id, entity_type, field_name, slug, field_type, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.userId, entity_type, field_name.trim(), slug, type, displayOrder]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A field with this name already exists' });
    }
    if (err.code === '42P01') {
      return res.status(500).json({ error: 'Custom fields table not found. Restart the server to create it.' });
    }
    throw err;
  }
});

router.delete('/custom-fields/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM custom_fields WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.user.userId]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Custom field not found' });
  }
  res.status(204).send();
});

module.exports = router;
