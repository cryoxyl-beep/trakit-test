import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchFromTMDB(endpoint: string, queryParams: Record<string, string> = {}) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not configured in environment variables.");
  }

  const params = new URLSearchParams({
    api_key: TMDB_API_KEY.trim(),
    ...queryParams,
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`TMDB API error (${response.status}): ${errText}`);
  }

  return response.json();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // TMDB API routes
  app.get("/api/tmdb/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "Query is required" });
    try {
      const data = await fetchFromTMDB("/search/multi", { query });
      res.json(data);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/tmdb/details", async (req, res) => {
    const id = req.query.id as string;
    const type = req.query.type as string; // 'movie' or 'tv'
    if (!id || !type) return res.status(400).json({ error: "id and type are required" });
    try {
      const data = await fetchFromTMDB(`/${type}/${id}`);
      res.json(data);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/tmdb/similar", async (req, res) => {
    const id = req.query.id as string;
    const type = req.query.type as string;
    if (!id || !type) return res.status(400).json({ error: "id and type are required" });
    try {
      const data = await fetchFromTMDB(`/${type}/${id}/similar`);
      res.json(data);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/tmdb/recommendations", async (req, res) => {
    const id = req.query.id as string;
    const type = req.query.type as string;
    if (!id || !type) return res.status(400).json({ error: "id and type are required" });
    try {
      const data = await fetchFromTMDB(`/${type}/${id}/recommendations`);
      res.json(data);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Legacy route for compatibility with unmodified components
  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: "Query is required" });
    try {
      const data = await fetchFromTMDB("/search/multi", { query });
      res.json(data);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
