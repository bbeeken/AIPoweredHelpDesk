const sql = require('mssql');
require('dotenv').config();

let pool = null;

async function connect() {
  if (pool) return pool;
  const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'HelpDeskDB',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
      enableArithAbort: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };
  pool = await sql.connect(config);
  return pool;
}

async function query(q, params = []) {
  if (!pool) await connect();
  const request = pool.request();
  params.forEach((p, i) => request.input(`p${i}`, p));
  let processed = q;
  let iParam = 0;
  processed = processed.replace(/\?/g, () => `@p${iParam++}`);
  const result = await request.query(processed);
  return result.recordset;
}

module.exports = { connect, query };
