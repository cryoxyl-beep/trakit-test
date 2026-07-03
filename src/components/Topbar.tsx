import { Search, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function Topbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30 px-6 flex items-center justify-between transition-colors">
      <div className="flex-1 max-w-xl">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
          className="w-full flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-transparent dark:border-zinc-800 rounded-lg text-sm transition-colors text-left"
        >
          <Search size={16} />
          <span className="flex-1">Search movies, shows, anime... or ask AI</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 font-sans text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded text-zinc-400">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-zinc-950"></span>
        </button>
      </div>
    </header>
  );
}
