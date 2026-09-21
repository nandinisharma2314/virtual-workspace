const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://workflow_user:nandu123!@localhost:5432/workflow_dashboard' });

async function run() {
  // 1. Create a project
  const projectRes = await pool.query("INSERT INTO projects (name, status) VALUES ('Website Redesign', 'active') RETURNING id");
  const projectId = projectRes.rows[0].id;

  // 2. Create 4 sprints
  const sprintRes1 = await pool.query(`INSERT INTO sprints (name, project_id, status) VALUES ('Sprint 1', ${projectId}, 'completed') RETURNING id`);
  const sprintRes2 = await pool.query(`INSERT INTO sprints (name, project_id, status) VALUES ('Sprint 2', ${projectId}, 'completed') RETURNING id`);
  const sprintRes3 = await pool.query(`INSERT INTO sprints (name, project_id, status) VALUES ('Sprint 3', ${projectId}, 'completed') RETURNING id`);
  const sprintRes4 = await pool.query(`INSERT INTO sprints (name, project_id, status) VALUES ('Sprint 4', ${projectId}, 'active') RETURNING id`);
  
  const sprintIds = [sprintRes1.rows[0].id, sprintRes2.rows[0].id, sprintRes3.rows[0].id, sprintRes4.rows[0].id];

  // 3. Get all tasks
  const tasksRes = await pool.query('SELECT id FROM tasks');
  const taskIds = tasksRes.rows.map(r => r.id);

  // 4. Distribute tasks
  for (let i = 0; i < taskIds.length; i++) {
    const sprintId = sprintIds[i % 4]; // Distribute evenly
    
    // For earlier sprints, higher chance of being completed
    let status = 'todo';
    if (sprintId === sprintIds[0] || sprintId === sprintIds[1]) {
        status = Math.random() > 0.1 ? 'completed' : 'todo';
    } else if (sprintId === sprintIds[2]) {
        status = Math.random() > 0.3 ? 'completed' : 'in-progress';
    } else {
        status = Math.random() > 0.8 ? 'completed' : 'todo';
    }

    await pool.query(
      'UPDATE tasks SET project_id = $1, sprint_id = $2, status = $3 WHERE id = $4',
      [projectId, sprintId, status, taskIds[i]]
    );
  }

  console.log('Successfully seeded project, sprints, and assigned tasks!');
  process.exit(0);
}
run();
