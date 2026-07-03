import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Watchlist from './pages/Watchlist';
import Profile from './pages/Profile';
import CommandPalette from './components/CommandPalette';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <div className="min-h-screen">
                <Navbar />
                <main className="max-w-4xl mx-auto px-6 py-12">
                  <Watchlist />
                </main>
                <CommandPalette />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
             <ProtectedRoute>
              <div className="min-h-screen">
                <Navbar />
                <main className="max-w-4xl mx-auto px-6 py-12">
                  <Profile />
                </main>
                <CommandPalette />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
