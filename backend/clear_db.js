require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function clearDB() {
  try {
    const res = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    const tables = res.rows.map(row => row.tablename);
    
    if (tables.length > 0) {
      const truncateQuery = `TRUNCATE TABLE "${tables.join('", "')}" CASCADE;`;
      console.log('Running:', truncateQuery);
      await pool.query(truncateQuery);
      console.log('Database cleared.');
    } else {
      console.log('No tables found in public schema.');
    }
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    pool.end();
  }
}

clearDB();
