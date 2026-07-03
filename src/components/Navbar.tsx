import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Search, User, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-zinc-100">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-lg flex items-center gap-2 text-zinc-900">
          <span className="w-6 h-6 bg-zinc-100 rounded-md flex items-center justify-center border border-zinc-200 text-xs">
            W
          </span>
          Watchlist
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-zinc-50 border border-zinc-100 text-zinc-400">
            <Search size={14} />
            <span className="text-xs">Cmd + K</span>
          </div>
          <Link to="/profile" className="hover:text-zinc-900 transition-colors flex items-center gap-2">
            <User size={16} />
            <span className="hidden sm:inline">{user?.displayName || 'Profile'}</span>
          </Link>
          <button onClick={logout} className="hover:text-zinc-900 transition-colors flex items-center gap-2">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
