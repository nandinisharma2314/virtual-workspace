require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT * FROM files WHERE id = 32").then(res => { console.log(JSON.stringify(res.rows, null, 2)); pool.end(); }).catch(console.error);
