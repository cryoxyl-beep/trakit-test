import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }
    try {
      const TMDB_API_KEY = process.env.TMDB_API_KEY;
      if (!TMDB_API_KEY) {
        console.error("TMDB_API_KEY is not configured in the environment variables.");
        return res.status(500).json({ error: "TMDB_API_KEY is not configured in environment variables." });
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      let url = `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}`;
      
      // Auto-detect if user provided a v4 API Read Access Token (JWT starting with eyJ) or a standard v3 API Key
      if (TMDB_API_KEY.trim().startsWith("eyJ") || TMDB_API_KEY.trim().length > 60) {
        headers["Authorization"] = `Bearer ${TMDB_API_KEY.trim()}`;
        console.log(`Searching TMDB for "${query}" using v4 Read Access Token (JWT)...`);
      } else {
        url += `&api_key=${TMDB_API_KEY.trim()}`;
        console.log(`Searching TMDB for "${query}" using v3 API Key...`);
      }

      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        const errText = await response.text();
        console.error(`TMDB API returned error status ${response.status}:`, errText);
        return res.status(response.status).json({ error: `TMDB API error: ${errText}` });
      }

      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      console.error("Failed to fetch from TMDB:", e);
      res.status(500).json({ error: "Failed to fetch from TMDB", details: e.message });
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
