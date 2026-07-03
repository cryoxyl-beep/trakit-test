import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

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

  app.post("/api/chat", express.json(), async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
      }
      
      const { messages, userWatchlist } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `You are a helpful movie and TV show AI assistant.
You can help users find what to watch and manage their watchlist.
The user's current watchlist items are provided below.
When recommending titles, use the 'recommend_titles' tool to display them in the UI.
When adding to watchlist, use the 'add_to_watchlist' tool.
When removing from watchlist, use the 'remove_from_watchlist' tool.
When changing status, use the 'update_status' tool.
If you need to search TMDB to find a specific title's ID, use 'search_tmdb'.
If the user asks to add something vague, search TMDB first and ask for clarification if there are multiple matches.

Current Watchlist:
${JSON.stringify(userWatchlist || [], null, 2)}`;

      console.log("[DEBUG] GEMINI_API_KEY is present:", !!process.env.GEMINI_API_KEY);

      const filtered = messages.filter((m: any) => m.role !== 'system');
      const formattedMessages: any[] = [];
      
      for (const m of filtered) {
        const role = m.role === 'assistant' ? 'model' : 'user';
        if (formattedMessages.length > 0 && formattedMessages[formattedMessages.length - 1].role === role) {
           formattedMessages[formattedMessages.length - 1].parts[0].text += "\n\n" + (m.content || "");
        } else {
           formattedMessages.push({
             role,
             parts: [{ text: m.content || "" }]
           });
        }
      }

      const chat = ai.chats.create({
        model: "gemini-2.5-flash-lite",
        config: {
          systemInstruction,
          tools: [
            {
              functionDeclarations: [
                {
                  name: "search_tmdb",
                  description: "Search TMDB for movies or TV shows",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      query: { type: Type.STRING }
                    },
                    required: ["query"]
                  }
                },
                {
                  name: "recommend_titles",
                  description: "Recommend titles to the user (this will render rich cards in the UI)",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      titles: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            tmdbId: { type: Type.INTEGER },
                            name: { type: Type.STRING },
                            type: { type: Type.STRING, description: "'movie' or 'tv'" },
                            posterUrl: { type: Type.STRING, description: "Full URL to poster (use getImageUrl equivalent if available, or https://image.tmdb.org/t/p/w342/...) " },
                            releaseYear: { type: Type.INTEGER }
                          },
                          required: ["tmdbId", "name", "type"]
                        }
                      }
                    },
                    required: ["titles"]
                  }
                },
                {
                  name: "add_to_watchlist",
                  description: "Add a specific title to the user's watchlist",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      tmdbId: { type: Type.INTEGER },
                      name: { type: Type.STRING },
                      type: { type: Type.STRING, description: "'movie' or 'tv'" },
                      posterUrl: { type: Type.STRING },
                      releaseYear: { type: Type.INTEGER }
                    },
                    required: ["tmdbId", "name", "type"]
                  }
                },
                {
                  name: "remove_from_watchlist",
                  description: "Remove a title from the watchlist",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      tmdbId: { type: Type.INTEGER }
                    },
                    required: ["tmdbId"]
                  }
                },
                {
                  name: "update_status",
                  description: "Update the watch status of a title",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      tmdbId: { type: Type.INTEGER },
                      status: { type: Type.STRING, description: "'to-watch', 'watched', 'watching', 'dropped', 'on-hold'" }
                    },
                    required: ["tmdbId", "status"]
                  }
                }
              ]
            }
          ]
        },
        history: formattedMessages.slice(0, -1)
      });
      
      let response = await chat.sendMessage({
         message: formattedMessages[formattedMessages.length - 1].parts[0].text
      });
      
      let functionCalls: any[] = [];
      let recommendations: any[] = [];
      
      // Auto-handle search_tmdb on the server
      while (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        
        if (call.name === 'search_tmdb') {
          const query = (call.args as any).query;
          try {
             const data = await fetchFromTMDB("/search/multi", { query });
             const results = data.results.slice(0, 5).map((r: any) => ({
               id: r.id,
               title: r.title || r.name,
               type: r.media_type,
               year: (r.release_date || r.first_air_date)?.substring(0, 4),
               posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w342${r.poster_path}` : null
             }));
             response = await chat.sendMessage({
               message: [{
                 functionResponse: {
                   name: call.name,
                   response: { results }
                 }
               }] as any
             });
          } catch (e) {
             response = await chat.sendMessage({
               message: [{
                 functionResponse: {
                   name: call.name,
                   response: { error: "Failed to search TMDB" }
                 }
               }] as any
             });
          }
        } else if (call.name === 'recommend_titles') {
           recommendations = (call.args as any).titles;
           response = await chat.sendMessage({
             message: [{
               functionResponse: {
                 name: call.name,
                 response: { success: true }
               }
             }] as any
           });
        } else {
           // Other client-side actions
           functionCalls.push({
             name: call.name,
             args: call.args
           });
           response = await chat.sendMessage({
             message: [{
               functionResponse: {
                 name: call.name,
                 response: { success: true }
               }
             }] as any
           });
        }
      }
      
      res.json({
        content: response.text || "",
        functionCalls,
        recommendations
      });
    } catch (e: any) {
      console.error("[DEBUG] /api/chat error:", e);
      res.status(500).json({ error: e.message || "Unknown error" });
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
