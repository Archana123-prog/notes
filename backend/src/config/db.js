const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Configure Neon PostgreSQL connection pool
const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString && connectionString.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Neon PostgreSQL client:', err.message);
});

// Helper for running queries
const query = (text, params) => pool.query(text, params);

// Database initialization routine (creates tables if they do not exist)
const initDB = async () => {
  if (!connectionString || connectionString.includes('YOUR_NEON_PASSWORD') || connectionString.includes('username:password')) {
    console.warn('\n⚠️ [Neon DB Notice]: DATABASE_URL in .env has not been updated with your real Neon credentials.');
    console.warn('👉 Please update DATABASE_URL in backend/.env with your connection string from https://console.neon.tech');
    console.warn('   Example: postgresql://neondb_owner:YOUR_KEY@ep-cool-cloud-123.us-east-2.aws.neon.tech/neondb?sslmode=require\n');
    return false;
  }

  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully to Neon PostgreSQL database.');

    // Create Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT DEFAULT '',
        category VARCHAR(100) DEFAULT 'General',
        tags TEXT[] DEFAULT ARRAY[]::TEXT[],
        color VARCHAR(50) DEFAULT '#ffffff',
        is_pinned BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);`);

    client.release();
    console.log('✅ Neon DB tables (users, notes) verified and ready.');
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to Neon DB or initialize tables:', err.message);
    console.error('👉 Check your DATABASE_URL in backend/.env to ensure proper host, credentials, and network access.');
    return false;
  }
};

module.exports = {
  pool,
  query,
  initDB,
};
