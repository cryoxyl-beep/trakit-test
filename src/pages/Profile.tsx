import { useWatchlist } from '../hooks/useWatchlist';
import { useAuth } from '../contexts/AuthContext';
import { Rating } from '../components/Rating';

export default function Profile() {
  const { user } = useAuth();
  const { items, titles, ratings } = useWatchlist();

  const watchedItems = items.filter(i => i.status === 'watched');
  const ratedItems = watchedItems.filter(i => ratings[i.tmdbId]);
  
  const avgRating = ratedItems.length > 0 
    ? (ratedItems.reduce((acc, curr) => acc + ratings[curr.tmdbId].rating, 0) / ratedItems.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6">
        {user?.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-20 h-20 rounded-full border border-zinc-200 shadow-sm" />
        ) : (
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-xl font-medium text-zinc-400 border border-zinc-200 shadow-sm">
            {user?.isAnonymous ? 'G' : (user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U')}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{user?.isAnonymous ? 'Guest' : (user?.displayName || 'Profile')}</h1>
          <p className="text-zinc-500">{user?.isAnonymous ? 'Guest Account' : user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-sm">
          <div className="text-zinc-500 text-sm mb-1 font-medium">Total Watched</div>
          <div className="text-3xl font-semibold">{watchedItems.length}</div>
        </div>
        <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-sm">
          <div className="text-zinc-500 text-sm mb-1 font-medium">Avg Rating</div>
          <div className="text-3xl font-semibold flex items-end gap-1">
             {avgRating} <span className="text-sm font-normal text-zinc-400 mb-1">/ 5</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-6">Recent Ratings</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {ratedItems.length === 0 ? (
            <p className="text-zinc-500 text-sm col-span-full">No ratings yet.</p>
          ) : (
            ratedItems.sort((a, b) => ratings[b.tmdbId].ratedAt - ratings[a.tmdbId].ratedAt).map(item => {
              const title = titles[item.tmdbId];
              const rating = ratings[item.tmdbId].rating;
              if (!title) return null;

              return (
                <div key={item.id} className="space-y-3 group">
                  {title.posterUrl ? (
                    <img src={title.posterUrl} alt={title.name} className="w-full aspect-[2/3] object-cover rounded-lg shadow-sm border border-zinc-200 group-hover:border-zinc-300 transition-colors" />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-zinc-100 rounded-lg flex items-center justify-center border border-zinc-200 text-xs text-zinc-400">
                      No Img
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm text-zinc-900 truncate" title={title.name}>{title.name}</div>
                    <div className="mt-1">
                      <Rating rating={rating} readOnly />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
