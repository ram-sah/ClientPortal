import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../lib/api';
import type { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!token,
    retry: false
  });

  const setToken = (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setTokenState(newToken);
    // Update API request headers
    updateAuthHeaders(newToken);
  };

  const login = async (email: string, password: string) => {
    const { user, token: newToken } = await authApi.login({ email, password });
    setToken(newToken);
    await refetch();
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setTokenState(null);
    updateAuthHeaders(null);
    // Optionally call logout API
    authApi.logout().catch(() => {
      // Ignore errors on logout
    });
  };

  // Update API headers when token changes
  useEffect(() => {
    updateAuthHeaders(token);
  }, [token]);

  const value: AuthContextType = {
    user: user || null,
    token,
    isLoading,
    login,
    logout,
    setToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to update API request headers
function updateAuthHeaders(token: string | null) {
  // This is a simple way to update headers globally
  // In a more complex app, you might want to use an axios instance or similar
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const headers = new Headers(init?.headers);
    
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return originalFetch(input, {
      ...init,
      headers
    });
  };
}
