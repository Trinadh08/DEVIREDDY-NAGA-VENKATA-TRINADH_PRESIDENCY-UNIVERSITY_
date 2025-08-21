import React, { useEffect, useMemo, useState } from 'react'
<td>{r.total_time ?? '—'}</td>
<td>{r.serves || '-'}</td>
</tr>
))}
</tbody>
</table>
</div>


<div className="pagination">
<button className="button" disabled={loading || page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
<span className="muted">Page {page} / {totalPages}</span>
<button className="button" disabled={loading || page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
</div>
</div>


<div className={"drawer" + (drawer? ' open': '')}>
{drawer && (
<>
<header>
<div className="pill">{drawer.cuisine || 'Unknown cuisine'}</div>
<h2 style={{marginBottom: 6}}>{drawer.title}</h2>
<div className="muted"><Stars value={drawer.rating} /> &nbsp;•&nbsp; Total {drawer.total_time ?? '—'} mins</div>
</header>
<div className="section">
<div className="kv">
<div className="muted">Description</div>
<div>{drawer.description || '—'}</div>
<div className="muted">Total Time</div>
<div>
{drawer.total_time ?? '—'} min
<details style={{marginTop: 8}}>
<summary className="pill">Expand</summary>
<div className="kv" style={{marginTop: 8}}>
<div className="muted">Prep Time</div>
<div>{drawer.prep_time ?? '—'} min</div>
<div className="muted">Cook Time</div>
<div>{drawer.cook_time ?? '—'} min</div>
</div>
</details>
</div>
</div>


<h3 style={{marginTop: 16}}>Nutrition</h3>
<table className="table" style={{marginTop: 8}}>
<tbody className="tbody">
{(() => {
const n = drawer.nutrients || {};
const keys = [
'calories',
'carbohydrateContent',
'cholesterolContent',
'fiberContent',
'proteinContent',
'saturatedFatContent',
'sodiumContent',
'sugarContent',
'fatContent'
];
return keys.map(k => (
<tr key={k}>
<td className="muted" style={{width: 220}}>{k}</td>
<td>{n[k] ?? '—'}</td>
</tr>
))
})()}
</tbody>
</table>
</div>


<div className="section" style={{paddingBottom: 40}}>
<button className="button" onClick={()=>setDrawer(null)}>Close</button>
</div>
</>
)}
</div>
</div>
)
}