import { LogIn, Tv } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user, loginWithGoogle } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-900 border border-zinc-200">
            <Tv size={24} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Watchlist</h1>
            <p className="text-sm text-zinc-500 mt-2">Sign in to track your shows and movies.</p>
          </div>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          <LogIn size={16} />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
