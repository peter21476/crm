require('dotenv').config();
require('express-async-errors');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const contactsRoutes = require('./routes/contacts');
const companiesRoutes = require('./routes/companies');
const dealsRoutes = require('./routes/deals');
const settingsRoutes = require('./routes/settings');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({ origin: isProduction ? undefined : (process.env.CLIENT_URL || 'http://localhost:3000'), credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/contacts', authMiddleware, contactsRoutes);
app.use('/api/companies', authMiddleware, companiesRoutes);
app.use('/api/deals', authMiddleware, dealsRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (isProduction) {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });
