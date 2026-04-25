const express = require('express');
const cors = require('cors');
const path = require('path');

// Only load .env file in local development — on Hostinger, env vars come from the panel
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

const { initializeDatabase } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://rfdailyreports.com', 'https://www.rfdailyreports.com']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/export', require('./routes/export')); // Ajout de la route d'export

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── Serve Frontend in Production ──
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// ── Error Handler ──
app.use(errorHandler);

// ── Start (async for sql.js init) ──
async function start() {
  await initializeDatabase();
  
  // Initialiser les rappels automatiques
  const { initReminderCron } = require('./services/reminderService');
  initReminderCron();

  app.listen(PORT, () => {
    console.log(`🚀 RS.Tracking API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  console.log(`📦 Database: PostgreSQL (Supabase)`);
  });
}

start().catch(err => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

module.exports = app;
