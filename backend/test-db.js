const Database = require('better-sqlite3');
const db = new Database('./workflow.db');
console.log(db.prepare('SELECT id, name, url FROM files').all());
