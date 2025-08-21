import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

// Fallback sample data (used when backend isn't running)
const FALLBACK_RECIPES = [
  {
    id: 1,
    cuisine: "Southern Recipes",
    title: "Sweet Potato Pie",
    rating: 4.8,
    prep_time: 15,
    cook_time: 100,
    total_time: 115,
    description:
      "Shared from a Southern recipe, this homemade sweet potato pie is easy to make with boiled sweet potato. Try it, it may just be the best you've ever tasted!",
    nutrients: {
      calories: "389 kcal",
      carbohydrateContent: "48 g",
      cholesterolContent: "78 mg",
      fiberContent: "3 g",
      proteinContent: "5 g",
      saturatedFatContent: "10 g",
      sodiumContent: "254 mg",
      sugarContent: "28 g",
      fatContent: "21 g",
    },
    serves: "8 servings",
  },
  // you can add more sample records here
];

function parseComparator(value) {
  if (!value) return null;
  const m = String(value).trim().match(/^(<=|>=|=|<|>)\s*(\d+(\.\d+)?)$/);
  if (!m) return null;
  return { op: m[1], val: Number(m[2]) };
}

function Stars({ value }) {
  const v = typeof value === "number" ? value : 0;
  const full = Math.floor(Math.max(0, Math.min(5, v)));
  return (
    <span className="stars" title={v ? `${v} / 5` : "No rating"}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < full ? "star filled" : "star empty"}>
          {i < full ? "★" : "☆"}
        </span>
      ))}
      <span className="rating-number">{v ? ` ${v}` : ""}</span>
    </span>
  );
}

export default function App() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // filters
  const [fTitle, setFTitle] = useState("");
  const [fCuisine, setFCuisine] = useState("");
  const [fRating, setFRating] = useState("");
  const [fTotalTime, setFTotalTime] = useState("");
  const [fCalories, setFCalories] = useState("");

  // fetch page from backend; if fails, use fallback
  async function fetchPage(p = page, lim = limit) {
    setLoading(true);
    setUsingFallback(false);
    try {
      const res = await fetch(`${API}/recipes?page=${p}&limit=${lim}`);
      if (!res.ok) throw new Error("Network response not ok");
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || (json.data ? json.data.length : 0));
    } catch (e) {
      // fallback local data
      setUsingFallback(true);
      setData(FALLBACK_RECIPES);
      setTotal(FALLBACK_RECIPES.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // search — tries backend /search ; if fails, filters fallback locally
  async function runSearch() {
    setLoading(true);
    setUsingFallback(false);
    try {
      const params = new URLSearchParams();
      if (fTitle) params.set("title", fTitle);
      if (fCuisine) params.set("cuisine", fCuisine);
      if (fRating) params.set("rating", fRating);
      if (fTotalTime) params.set("total_time", fTotalTime);
      if (fCalories) params.set("calories", fFCaloriesValueOrRaw(fCalories));
      const res = await fetch(`${API}/recipes/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      setData(json.data || []);
      setTotal((json.data && json.data.length) || 0);
      setPage(1);
    } catch (e) {
      // local filter on fallback
      setUsingFallback(true);
      const filtered = FALLBACK_RECIPES.filter((r) => {
        if (fTitle && !r.title.toLowerCase().includes(fTitle.toLowerCase()))
          return false;
        if (fCuisine && String(r.cuisine).toLowerCase() !== fCuisine.toLowerCase())
          return false;
        if (fRating) {
          const cmp = parseComparator(fRating);
          if (cmp) {
            const val = Number(r.rating || 0);
            if (!compareNumber(val, cmp.op, cmp.val)) return false;
          }
        }
        if (fTotalTime) {
          const cmp = parseComparator(fTotalTime);
          if (cmp) {
            const val = Number(r.total_time || 0);
            if (!compareNumber(val, cmp.op, cmp.val)) return false;
          }
        }
        if (fCalories) {
          const cmp = parseComparator(fCalories);
          if (cmp) {
            const calStr = (r.nutrients && r.nutrients.calories) || "";
            const calNum = extractNumber(calStr);
            if (!compareNumber(calNum, cmp.op, cmp.val)) return false;
          }
        }
        return true;
      });
      setData(filtered);
      setTotal(filtered.length);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }

  function extractNumber(s) {
    if (!s) return null;
    const m = String(s).match(/(\d+(\.\d+)?)/);
    return m ? Number(m[1]) : null;
  }

  function compareNumber(a, op, b) {
    if (a === null || a === undefined) return false;
    switch (op) {
      case "<":
        return a < b;
      case "<=":
        return a <= b;
      case ">":
        return a > b;
      case ">=":
        return a >= b;
      case "=":
        return a === b;
      default:
        return false;
    }
  }

  function fFCaloriesValueOrRaw(s) {
    // keep user input as-is (backend expects expressions like <=400)
    return s;
  }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit || 1)),
    [total, limit]
  );

  return (
    <div className="app-container">
      <header className="header">
        <h1>🍽️ Recipes</h1>
        <p className="muted">
          Paginated, sorted by rating. Click a row to see details.
          {usingFallback ? " (Using local sample data — backend not available)" : ""}
        </p>
      </header>

      <div className="card">
        <div className="controls">
          <input
            className="input"
            placeholder="Title contains…"
            value={fTitle}
            onChange={(e) => setFTitle(e.target.value)}
          />
          <input
            className="input"
            placeholder="Cuisine (exact)"
            value={fCuisine}
            onChange={(e) => setFCuisine(e.target.value)}
          />
          <input
            className="input"
            placeholder="Rating (e.g. >=4.5)"
            value={fRating}
            onChange={(e) => setFRating(e.target.value)}
          />
          <input
            className="input"
            placeholder="Total time (e.g. <=30)"
            value={fTotalTime}
            onChange={(e) => setFTotalTime(e.target.value)}
          />
          <input
            className="input"
            placeholder="Calories (e.g. <=400)"
            value={fCalories}
            onChange={(e) => setFCalories(e.target.value)}
          />
          <button className="button" onClick={runSearch} disabled={loading}>
            Search
          </button>
          <div style={{ flex: 1 }} />
          <label className="muted">Per page:&nbsp;</label>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            {[15, 20, 25, 30, 40, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Cuisine</th>
                <th>Rating</th>
                <th>Total Time</th>
                <th>Serves</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="fallback">
                    Loading…
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="fallback">
                    No results found.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id} className="row" onClick={() => setDrawer(r)}>
                    <td className="truncate" title={r.title}>
                      {r.title}
                    </td>
                    <td>{r.cuisine || "-"}</td>
                    <td>
                      <Stars value={r.rating} />
                    </td>
                    <td>{r.total_time ?? "—"}</td>
                    <td>{r.serves ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            className="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="muted">
            Page {page} / {totalPages}
          </span>
          <button
            className="button"
            disabled={loading || page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <div className={"drawer " + (drawer ? "open" : "")}>
        {drawer && (
          <>
            <header>
              <div className="pill">{drawer.cuisine || "Unknown cuisine"}</div>
              <h2>{drawer.title}</h2>
              <div className="muted">
                <Stars value={drawer.rating} /> &nbsp;•&nbsp; Total {drawer.total_time ?? "—"} mins
              </div>
            </header>

            <div className="section">
              <div className="kv">
                <div className="muted">Description</div>
                <div>{drawer.description || "—"}</div>

                <div className="muted">Total Time</div>
                <div>
                  {drawer.total_time ?? "—"} min
                  <details style={{ marginTop: 8 }}>
                    <summary className="pill">Expand</summary>
                    <div className="kv" style={{ marginTop: 8 }}>
                      <div className="muted">Prep Time</div>
                      <div>{drawer.prep_time ?? "—"} min</div>
                      <div className="muted">Cook Time</div>
                      <div>{drawer.cook_time ?? "—"} min</div>
                    </div>
                  </details>
                </div>
              </div>

              <h3 style={{ marginTop: 16 }}>Nutrition</h3>
              <table className="nutri-table">
                <tbody>
                  {[
                    "calories",
                    "carbohydrateContent",
                    "cholesterolContent",
                    "fiberContent",
                    "proteinContent",
                    "saturatedFatContent",
                    "sodiumContent",
                    "sugarContent",
                    "fatContent",
                  ].map((k) => (
                    <tr key={k}>
                      <td className="muted key">{k}</td>
                      <td>{(drawer.nutrients && drawer.nutrients[k]) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section" style={{ paddingBottom: 40 }}>
              <button className="button" onClick={() => setDrawer(null)}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}