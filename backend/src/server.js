const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

const { initDB, query } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ==========================================
// Middleware Configuration
// ==========================================

// 1. CORS Configuration to connect Backend to React Frontend
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173', // Vite standard React port
  'http://localhost:3000', // Create-React-App standard port
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. HTTP Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ==========================================
// API Routes
// ==========================================

// Root welcome message
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Notes Taking Application API',
    version: '1.0.0',
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Bearer Token required)',
      },
      notes: {
        listNotes: 'GET /api/notes?search=&category=&pinned=&archived=',
        getNote: 'GET /api/notes/:id',
        createNote: 'POST /api/notes',
        updateNote: 'PUT /api/notes/:id',
        togglePin: 'PATCH /api/notes/:id/pin',
        deleteNote: 'DELETE /api/notes/:id',
      },
      health: 'GET /api/health',
    },
  });
});

// Health check endpoint (checks server & Neon DB status)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const testResult = await query('SELECT NOW() AS current_time');
    if (testResult && testResult.rows.length > 0) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      type: 'Neon PostgreSQL',
      status: dbStatus,
    },
    clientUrl: CLIENT_URL,
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// ==========================================
// Server Start
// ==========================================
app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Notes API Server is running on: http://localhost:${PORT}`);
  console.log(`🌐 Configured for Frontend (React JS): ${CLIENT_URL}`);
  console.log(`📦 Database: Neon PostgreSQL`);
  console.log(`======================================================\n`);

  // Attempt DB connection and verify tables
  await initDB();
});

module.exports = app;
