import express from 'express';
const page = Math.max(parseInt(req.query.page || '1', 10), 1);
const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
const offset = (page - 1) * limit;


const total = (await query('SELECT COUNT(*)::int AS c FROM recipes')).rows[0].c;
const result = await query(
`SELECT id, title, cuisine, rating, prep_time, cook_time, total_time, description, nutrients, serves
FROM recipes
ORDER BY rating DESC NULLS LAST, id ASC
LIMIT $1 OFFSET $2`,
[limit, offset]
);


res.json({ page, limit, total, data: result.rows });
});


// GET /api/recipes/search
router.get('/search', async (req, res) => {
const { title, cuisine, total_time, rating, calories } = req.query;


const where = [];
const params = [];


if (title) {
params.push(`%${title}%`);
where.push(`title ILIKE $${params.length}`);
}
if (cuisine) {
params.push(cuisine);
where.push(`cuisine = $${params.length}`);
}


// total_time comparator
const tt = parseComparator(total_time);
if (tt) {
params.push(Number(tt.val));
where.push(`total_time ${tt.op} $${params.length}`);
}


// rating comparator
const rr = parseComparator(rating);
if (rr) {
params.push(Number(rr.val));
where.push(`rating ${rr.op} $${params.length}`);
}


// calories comparator (extract numeric part from nutrients->>'calories')
const cc = parseComparator(calories);
if (cc) {
// strip non-digits and cast to numeric
const calExpr = `NULLIF(regexp_replace(nutrients->>'calories', '[^0-9.]', '', 'g'), '')::numeric`;
params.push(Number(cc.val));
where.push(`${calExpr} ${cc.op} $${params.length}`);
}


const sql = `SELECT id, title, cuisine, rating, prep_time, cook_time, total_time, description, nutrients, serves
FROM recipes
${where.length ? 'WHERE ' + where.join(' AND ') : ''}
ORDER BY rating DESC NULLS LAST, id ASC
LIMIT 200`;


const result = await query(sql, params);
res.json({ data: result.rows });
});


export default router;