import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Load recipes from JSON
let recipes = [];
try {
  const data = fs.readFileSync("./src/recipes.json", "utf-8");
  recipes = JSON.parse(data);
} catch (err) {
  console.error("❌ Error loading recipes.json:", err.message);
}

// API route
app.get("/recipes", (req, res) => {
  res.json(recipes);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
