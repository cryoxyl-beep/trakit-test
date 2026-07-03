export const getImageUrl = (path: string | null, size: "w342" | "w500" | "original" = "w342") => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const tmdbService = {
  searchMulti: async (query: string) => {
    const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Failed to fetch from TMDB");
    return res.json();
  },

  getDetails: async (tmdbId: number, mediaType: "movie" | "tv") => {
    const res = await fetch(`/api/tmdb/details?id=${tmdbId}&type=${mediaType}`);
    if (!res.ok) throw new Error("Failed to fetch details");
    return res.json();
  },

  getSimilar: async (tmdbId: number, mediaType: "movie" | "tv") => {
    const res = await fetch(`/api/tmdb/similar?id=${tmdbId}&type=${mediaType}`);
    if (!res.ok) throw new Error("Failed to fetch similar");
    return res.json();
  },

  getRecommendations: async (tmdbId: number, mediaType: "movie" | "tv") => {
    const res = await fetch(`/api/tmdb/recommendations?id=${tmdbId}&type=${mediaType}`);
    if (!res.ok) throw new Error("Failed to fetch recommendations");
    return res.json();
  }
};
