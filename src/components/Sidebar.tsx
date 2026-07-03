import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Home, ListVideo, Library, Compass, BarChart2, Users, Settings, LogOut } from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Watchlist", path: "/watchlist", icon: ListVideo },
    { name: "Library", path: "/library", icon: Library },
    { name: "Discover", path: "/discover", icon: Compass },
    { name: "Stats", path: "/stats", icon: BarChart2 },
    { name: "Friends", path: "/friends", icon: Users },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-50 border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 flex flex-col z-40 transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <Link to="/" className="font-semibold tracking-tight text-lg flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
          <span className="w-6 h-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-md flex items-center justify-center text-xs shadow-sm">
            W
          </span>
          Watchlist
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/watchlist'); // treating / and /watchlist closely
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-200/50 text-zinc-900 dark:bg-zinc-800/50 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
        >
          <Settings size={18} />
          Settings
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>

        <div className="mt-4 flex items-center gap-3 px-3 py-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700" />
          ) : (
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {user?.isAnonymous ? 'G' : (user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U')}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
              {user?.isAnonymous ? "Guest" : (user?.displayName || "Profile")}
            </span>
            {!user?.isAnonymous && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
