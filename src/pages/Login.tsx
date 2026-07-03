import { LogIn, Tv, User, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const { user, loginWithGoogle, loginAsGuest } = useAuth();
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGuestLogin = async () => {
    try {
      setError(null);
      await loginAsGuest();
    } catch (e: any) {
      if (e?.code === 'auth/admin-restricted-operation') {
         setError("Anonymous authentication is not enabled. Please enable it in the Firebase Console (Authentication > Sign-in method).");
      } else {
         setError(e.message || "Failed to sign in as guest");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
    } catch (e: any) {
      setError(e.message || "Failed to sign in with Google");
    }
  };

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

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium"
          >
            <LogIn size={16} />
            Continue with Google
          </button>
          
          <button
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 border border-zinc-200 px-4 py-2 rounded-md hover:bg-zinc-50 transition-colors text-sm font-medium"
          >
            <User size={16} />
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
