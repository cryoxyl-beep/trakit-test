import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useWatchlist } from '../hooks/useWatchlist';
import { Title } from '../types';
import { Search, Loader2 } from 'lucide-react';
import { tmdbService, getImageUrl } from '../lib/tmdbService';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Title[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToWatchlist } = useWatchlist();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'KeyK' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);

    const handleOpenSearch = () => {
      setOpen(true);
    };
    window.addEventListener('open-search', handleOpenSearch);

    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-search', handleOpenSearch);
    };
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await tmdbService.searchMulti(query);
        if (data.results) {
          const mapped = data.results
            .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
            .map((item: any) => ({
              tmdbId: item.id,
              name: item.title || item.name,
              type: item.media_type,
              posterUrl: getImageUrl(item.poster_path, "w342"),
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-zinc-900/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 transition-colors" onClick={e => e.stopPropagation()}>
        <Command label="Global Command Menu" shouldFilter={false} className="w-full">
          <div className="flex items-center px-4 border-b border-zinc-100 dark:border-zinc-800">
            <Search className="w-5 h-5 text-zinc-400 mr-2 shrink-0" />
            <Command.Input 
              value={query}
              onValueChange={setQuery}
              autoFocus
              className="w-full h-14 bg-transparent outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-base font-medium" 
              placeholder="Search for movies or shows..." 
            />
            {loading && <Loader2 className="w-5 h-5 text-zinc-400 animate-spin shrink-0" />}
          </div>
          
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            {!loading && query && results.length === 0 && (
              <Command.Empty className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
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
                className="flex items-center gap-4 px-3 py-3 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-900 transition-colors data-[selected=true]:bg-zinc-100 dark:data-[selected=true]:bg-zinc-900"
              >
                {title.posterUrl ? (
                  <img src={title.posterUrl} alt={title.name} className="w-10 h-14 object-cover rounded-md shadow-sm shrink-0 border border-zinc-200/50 dark:border-zinc-800/50" />
                ) : (
                  <div className="w-10 h-14 bg-zinc-200 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50 rounded-md flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">No Img</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{title.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
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
