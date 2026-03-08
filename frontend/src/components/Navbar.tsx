import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { Logo } from './Logo';

const Navbar = () => {
  const { auth, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-foreground font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <Logo size={24} className="text-primary" />
            AssessMate AI
          </button>

          <div className="flex items-center gap-3">
            {auth.isLoggedIn ? (
              <>
                <span className="text-sm font-medium text-foreground">
                  {auth.name || auth.email}
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-accent text-accent-foreground capitalize">
                  {auth.role}
                </span>
                <button
                  onClick={() => {
                    const dashPath =
                      auth.role === 'teacher'
                        ? '/teacher-dashboard'
                        : '/student-dashboard';
                    navigate(dashPath);
                  }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Login / Register
              </button>
            )}
          </div>
        </div>
      </nav>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default Navbar;
