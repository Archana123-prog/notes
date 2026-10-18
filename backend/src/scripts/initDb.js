const { initDB, pool } = require('../config/db');

const run = async () => {
  console.log('🚀 Running manual database initialization for Neon PostgreSQL...');
  const success = await initDB();
  if (success) {
    console.log('🎉 Database initialization complete!');
  } else {
    console.log('⚠️ Could not complete initialization. Please verify your connection string.');
  }
  await pool.end();
  process.exit(success ? 0 : 1);
};

run();
