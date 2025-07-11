const fs = require('fs');
const path = require('path');
const sql = require('mssql');
require('dotenv').config();

async function run() {
  const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'HelpDeskDB',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
      enableArithAbort: true
    }
  };

  const schema = fs.readFileSync(path.join(__dirname, 'migrations', 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, 'migrations', 'seed.sql'), 'utf8');

  try {
    const pool = await sql.connect(config);
    console.log('Running schema migration...');
    await pool.batch(schema);
    console.log('Seeding data...');
    await pool.batch(seed);
    console.log('Database setup complete');
    await pool.close();
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}
