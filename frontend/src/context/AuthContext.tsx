import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

export type UserRole = 'teacher' | 'student';

interface AuthState {
  isLoggedIn: boolean;
  role: UserRole | null;
  email: string;
  id: string;
  name: string;
}

interface AuthContextType {
  auth: AuthState;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get initial auth state
const getInitialAuthState = (): AuthState => {
  const savedAuth = localStorage.getItem('auth');

  if (savedAuth) {
    try {
      const parsed = JSON.parse(savedAuth);

      // Validate stored auth state
      if (parsed.isLoggedIn && parsed.id && parsed.role && parsed.email) {
        return parsed as AuthState;
      } else {
        localStorage.removeItem('auth');
      }

    } catch (error) {
      console.error('Failed to parse saved auth state:', error);
      localStorage.removeItem('auth');
    }
  }

  return {
    isLoggedIn: false,
    role: null,
    email: '',
    id: '',
    name: '',
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [auth, setAuth] = useState<AuthState>(getInitialAuthState);

  const login = async (email: string, password: string, role: UserRole) => {

    try {
      // Import backend API dynamically
      const data = await import('@/lib/api').then((mod) =>
        mod.login(email, password)
      );

      console.log('login response data:', data, 'expected role param:', role);

      // if server didn't send a role, fall back to the UI selection (helps debugging)
      let userRole: UserRole | null = (data.role as UserRole) || null;
      if (!userRole) {
        console.warn('login response missing role, defaulting to provided role', role);
        userRole = role;
      }

      const newAuth: AuthState = {
        isLoggedIn: true,
        role: userRole,
        email: data.email,
        id: data.id,
        name: data.name || '',
      };

      setAuth(newAuth);

      localStorage.setItem('auth', JSON.stringify(newAuth));

    } catch (err) {
      console.error('login failed', err);
      throw err;
    }

  };

  const logout = () => {

    const resetAuth: AuthState = {
      isLoggedIn: false,
      role: null,
      email: '',
      id: '',
      name: '',
    };

    setAuth(resetAuth);

    localStorage.removeItem('auth');

  };

  // Memoize context value
  const contextValue = useMemo(() => ({
    auth,
    login,
    logout,
  }), [auth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;

};