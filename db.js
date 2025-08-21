import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;


dotenv.config();


export const pool = new Pool({
host: process.env.PGHOST,
port: process.env.PGPORT,
database: process.env.PGDATABASE,
user: process.env.PGUSER,
password: process.env.PGPASSWORD,
max: 10
});


export async function query(text, params) {
const start = Date.now();
const res = await pool.query(text, params);
const duration = Date.now() - start;
if (process.env.NODE_ENV !== 'test') console.log('executed query', { text, duration, rows: res.rowCount });
return res;
}