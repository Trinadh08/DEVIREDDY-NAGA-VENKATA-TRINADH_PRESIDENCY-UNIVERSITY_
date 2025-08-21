import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, pool } from '../src/db.js';
import { toNullableNumber, safeNutrients } from '../src/utils/sanitize.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function run() {
const dataPath = path.join(__dirname, '..', 'data', 'recipes.json');
const raw = fs.readFileSync(dataPath, 'utf8');
const list = JSON.parse(raw);


console.log(`Ingesting ${list.length} recipes...`);


for (const r of list) {
const cuisine = r.cuisine ?? null;
const title = r.title ?? null;
const rating = toNullableNumber(r.rating);
const prep_time = toNullableNumber(r.prep_time);
const cook_time = toNullableNumber(r.cook_time);
const total_time = toNullableNumber(r.total_time);
const description = r.description ?? null;
const nutrients = safeNutrients(r.nutrients);
const serves = r.serves ?? null;


await query(
`INSERT INTO recipes (cuisine, title, rating, prep_time, cook_time, total_time, description, nutrients, serves)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
ON CONFLICT DO NOTHING`,
[cuisine, title, rating, prep_time, cook_time, total_time, description, nutrients, serves]
);
}


console.log('Done.');
await pool.end();
}


run().catch(async (e) => { console.error(e); await pool.end(); process.exit(1); });