import { useState } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';
import { Rating } from '../components/Rating';
import { WatchStatus } from '../types';
import { Loader2, Trash2 } from 'lucide-react';

export default function Watchlist() {
  const { items, titles, ratings, loading, updateStatus, removeTitle, rateTitle } = useWatchlist();
  const [filterStatus, setFilterStatus] = useState<WatchStatus | 'all'>('all');

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  const filteredItems = items.filter(item => 
    filterStatus === 'all' ? true : item.status === filterStatus
  ).sort((a, b) => b.addedAt - a.addedAt);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Watchlist</h1>
        
        <div className="flex items-center gap-2 text-sm">
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value as any)}
            className="bg-transparent border border-zinc-200 rounded-md px-3 py-1.5 outline-none hover:bg-zinc-50 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="to-watch">To Watch</option>
            <option value="watched">Watched</option>
          </select>
        </div>
      </div>

      <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
            <tr>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium w-24">Type</th>
              <th className="px-6 py-3 font-medium w-32">Status</th>
              <th className="px-6 py-3 font-medium w-40">Rating</th>
              <th className="px-6 py-3 font-medium w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                  No items found. Press <kbd className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-xs border border-zinc-200">Alt+K</kbd> to add something.
                </td>
              </tr>
            ) : null}
            {filteredItems.map(item => {
              const title = titles[item.tmdbId];
              if (!title) return null;
              const rating = ratings[item.tmdbId]?.rating || 0;

              return (
                <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                    {title.posterUrl ? (
                      <img src={title.posterUrl} alt={title.name} className="w-8 h-12 object-cover rounded shadow-sm shrink-0" />
                    ) : (
                      <div className="w-8 h-12 bg-zinc-100 rounded flex items-center justify-center text-[10px] text-zinc-400 shrink-0">
                        No Img
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-zinc-900 truncate">{title.name}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">{title.releaseYear}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-zinc-600 bg-zinc-100 px-2 py-1 rounded-md text-xs font-medium">
                      {title.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => updateStatus(item.tmdbId, item.status === 'to-watch' ? 'watched' : 'to-watch')}
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${
                        item.status === 'watched' 
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm' 
                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 shadow-sm'
                      }`}
                    >
                      {item.status === 'watched' ? 'Watched' : 'To Watch'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`transition-opacity ${item.status === 'to-watch' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                      <Rating 
                        rating={rating} 
                        onChange={(r) => rateTitle(item.tmdbId, r)} 
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => removeTitle(item.tmdbId)}
                      className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from watchlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
