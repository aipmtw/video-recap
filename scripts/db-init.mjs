import { readFile } from 'node:fs/promises';
import sql from 'mssql';

const cfg = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  port: Number(process.env.AZURE_SQL_PORT || 1433),
  options: { encrypt: process.env.AZURE_SQL_ENCRYPT !== 'false' }
};

const ddl = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');
const pool = await sql.connect(cfg);
await pool.request().batch(ddl);
console.log('Schema applied.');
await pool.close();
