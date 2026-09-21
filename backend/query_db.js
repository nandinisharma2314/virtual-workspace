import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/workflow' });
await client.connect();

const res = await client.query('SELECT id, name, created_at FROM files ORDER BY created_at DESC LIMIT 5;');
console.log(res.rows);

await client.end();
