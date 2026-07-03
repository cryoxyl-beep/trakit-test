import { useState } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';
import { Rating } from '../components/Rating';
import { WatchStatus } from '../types';
import { Loader2, Trash2, Plus, Filter, ArrowUpDown, MoreHorizontal, Search } from 'lucide-react';

export default function Watchlist() {
  const { items, titles, ratings, loading, updateStatus, removeTitle, rateTitle } = useWatchlist();
  const [filterStatus, setFilterStatus] = useState<WatchStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 dark:text-zinc-600" />
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    const titleMatch = titles[item.tmdbId]?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const statusMatch = filterStatus === 'all' ? true : item.status === filterStatus;
    return titleMatch && statusMatch;
  }).sort((a, b) => b.addedAt - a.addedAt);

  const statuses: { value: WatchStatus | 'all', label: string, color?: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'to-watch', label: 'To Watch', color: 'bg-blue-500' },
    { value: 'watching', label: 'Watching', color: 'bg-amber-500' },
    { value: 'watched', label: 'Watched', color: 'bg-emerald-500' },
    { value: 'dropped', label: 'Dropped', color: 'bg-red-500' },
    { value: 'on-hold', label: 'On Hold', color: 'bg-zinc-500' },
  ];

  const getStatusColor = (status: WatchStatus) => {
    return statuses.find(s => s.value === status)?.color || 'bg-zinc-500';
  };

  const formatRelativeTime = (timestamp: number) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) return 'Today';
    if (daysDifference === -1) return 'Yesterday';
    if (daysDifference > -7 && daysDifference < 0) return rtf.format(daysDifference, 'day');
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Watchlist</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage and track everything you want to watch.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-px overflow-x-auto">
        {statuses.map(status => (
          <button
            key={status.value}
            onClick={() => setFilterStatus(status.value)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              filterStatus === status.value
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {status.label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-normal text-zinc-600 dark:text-zinc-400">
              {status.value === 'all' 
                ? items.length 
                : items.filter(i => i.status === status.value).length}
            </span>
          </button>
        ))}
        <button className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors flex items-center gap-1 border-b-2 border-transparent">
          <Plus size={16} />
          Add custom
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <Filter size={14} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
            <ArrowUpDown size={14} />
            Sort
          </button>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Filter titles..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm bg-transparent outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 w-48 transition-all"
            />
          </div>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add to watchlist
        </button>
      </div>

      {/* Table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
            <tr>
              <th className="px-6 py-3.5 font-medium">Title</th>
              <th className="px-6 py-3.5 font-medium w-24 hidden sm:table-cell">Type</th>
              <th className="px-6 py-3.5 font-medium w-40">Status</th>
              <th className="px-6 py-3.5 font-medium w-40 hidden md:table-cell">Rating</th>
              <th className="px-6 py-3.5 font-medium w-32 hidden lg:table-cell">Added</th>
              <th className="px-6 py-3.5 font-medium w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                  <div className="flex flex-col items-center gap-2">
                    <p>No items found.</p>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:underline"
                    >
                      Search to add titles
                    </button>
                  </div>
                </td>
              </tr>
            ) : null}
            {filteredItems.map(item => {
              const title = titles[item.tmdbId];
              if (!title) return null;
              const rating = ratings[item.tmdbId]?.rating || 0;

              return (
                <tr key={item.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-4">
                      {title.posterUrl ? (
                        <img src={title.posterUrl} alt={title.name} className="w-10 h-14 object-cover rounded-md shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 shrink-0" />
                      ) : (
                        <div className="w-10 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-md border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">
                          No Img
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{title.name}</div>
                        <div className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 truncate max-w-xs">{title.overview || (title.releaseYear ? `Released ${title.releaseYear}` : '')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 hidden sm:table-cell">
                    <span className="capitalize text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-xs font-medium">
                      {title.type}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.tmdbId, e.target.value as WatchStatus)}
                      className="text-sm bg-transparent border-none outline-none cursor-pointer group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 py-1 px-2 rounded -ml-2 text-zinc-700 dark:text-zinc-300"
                    >
                      {statuses.filter(s => s.value !== 'all').map(s => (
                        <option key={s.value} value={s.value} className="dark:bg-zinc-900">{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell">
                    <div className={`transition-opacity ${item.status === 'to-watch' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                      <Rating 
                        rating={rating} 
                        onChange={(r) => rateTitle(item.tmdbId, r)} 
                      />
                    </div>
                  </td>
                  <td className="px-6 py-3 hidden lg:table-cell text-zinc-500 dark:text-zinc-400 text-sm">
                    {formatRelativeTime(item.addedAt)}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => removeTitle(item.tmdbId)}
                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* New row button */}
            <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group" onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}>
               <td colSpan={6} className="px-6 py-4">
                 <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors font-medium">
                   <Plus size={18} />
                   <span>New...</span>
                 </div>
               </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
