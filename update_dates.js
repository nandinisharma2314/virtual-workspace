const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://workflow_user:nandu123!@localhost:5432/workflow_dashboard' });

async function run() {
  const now = new Date();
  
  // Scatter tasks over the last 40 days
  const res = await pool.query('SELECT id FROM tasks');
  const taskIds = res.rows.map(r => r.id);
  
  for (let i = 0; i < taskIds.length; i++) {
    const daysAgo = Math.floor(Math.random() * 40);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    await pool.query(
      'UPDATE tasks SET created_at = $1, updated_at = $2 WHERE id = $3',
      [new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000), date, taskIds[i]]
    );
  }
  
  // Scatter time logs
  const logRes = await pool.query('SELECT id FROM time_logs');
  const logIds = logRes.rows.map(r => r.id);
  
  for (let i = 0; i < logIds.length; i++) {
    const daysAgo = Math.floor(Math.random() * 40);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    await pool.query(
      'UPDATE time_logs SET date = $1, created_at = $1 WHERE id = $2',
      [date, logIds[i]]
    );
  }

  console.log('Successfully scattered dates!');
  process.exit(0);
}
run();
