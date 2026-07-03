export default async function handler(req: any, res: any) {
  const query = req.query.q || req.query.query;
  if (!query) return res.status(400).json({ error: "Query is required" });

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: "TMDB_API_KEY is not configured in environment variables." });
  }

  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY.trim()}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url, { headers: { "Content-Type": "application/json" } });
    
    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `TMDB API error: ${errText}` });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (e: any) {
    res.status(500).json({ error: "Failed to fetch from TMDB", details: e.message });
  }
}
