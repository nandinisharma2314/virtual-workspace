const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT * FROM files').then(res => { console.log(res.rows); pool.end(); }).catch(console.error);
