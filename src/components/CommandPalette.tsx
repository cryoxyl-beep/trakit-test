import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useWatchlist } from '../hooks/useWatchlist';
import { Title } from '../types';
import { Search, Loader2 } from 'lucide-react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Title[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToWatchlist } = useWatchlist();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.results) {
          const mapped = data.results
            .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
            .map((item: any) => ({
              tmdbId: item.id,
              name: item.title || item.name,
              type: item.media_type,
              posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : null,
              genres: [],
              releaseYear: (item.release_date || item.first_air_date) ? parseInt((item.release_date || item.first_air_date).substring(0, 4)) : null,
              overview: item.overview || ''
            }));
          setResults(mapped);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-zinc-900/20 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-zinc-100" onClick={e => e.stopPropagation()}>
        <Command label="Global Command Menu" shouldFilter={false} className="w-full">
          <div className="flex items-center px-4 border-b border-zinc-100">
            <Search className="w-5 h-5 text-zinc-400 mr-2 shrink-0" />
            <Command.Input 
              value={query}
              onValueChange={setQuery}
              autoFocus
              className="w-full h-14 bg-transparent outline-none text-zinc-900 placeholder:text-zinc-400 text-base font-medium" 
              placeholder="Search for movies or shows..." 
            />
            {loading && <Loader2 className="w-5 h-5 text-zinc-400 animate-spin shrink-0" />}
          </div>
          
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            {!loading && query && results.length === 0 && (
              <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                No results found.
              </Command.Empty>
            )}
            
            {results.map((title) => (
              <Command.Item
                key={title.tmdbId}
                value={title.tmdbId.toString()}
                onSelect={() => {
                  addToWatchlist(title);
                  setOpen(false);
                  setQuery('');
                }}
                className="flex items-center gap-4 px-3 py-3 rounded-lg cursor-pointer hover:bg-zinc-100 aria-selected:bg-zinc-100 transition-colors data-[selected=true]:bg-zinc-100"
              >
                {title.posterUrl ? (
                  <img src={title.posterUrl} alt={title.name} className="w-10 h-14 object-cover rounded-md shadow-sm shrink-0" />
                ) : (
                  <div className="w-10 h-14 bg-zinc-200 rounded-md flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-zinc-400">No Img</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-zinc-900 truncate">{title.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                    <span className="capitalize">{title.type}</span>
                    {title.releaseYear && (
                      <>
                        <span>&middot;</span>
                        <span>{title.releaseYear}</span>
                      </>
                    )}
                  </div>
                </div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
