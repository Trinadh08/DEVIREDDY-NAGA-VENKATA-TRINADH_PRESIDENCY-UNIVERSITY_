export async function fetchRecipes() {
  const res = await fetch("http://localhost:5000");
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return res.json();
}
