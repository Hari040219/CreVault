import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, mockUsers } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const apiBase = 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userWithToken: User = {
          id: data.user.id,
          username: data.user.name,
          email: data.user.email,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          role: 'user',
          createdAt: new Date().toISOString().split('T')[0],
          subscribers: 0,
          token: data.token, // Store the JWT token
        };
        setUser(userWithToken);
        localStorage.setItem('streamtube_user', JSON.stringify(userWithToken));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const apiBase = 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: username, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userWithToken: User = {
          id: data.user.id,
          username: data.user.name,
          email: data.user.email,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          role: 'user',
          createdAt: new Date().toISOString().split('T')[0],
          subscribers: 0,
          token: data.token, // Store the JWT token
        };
        setUser(userWithToken);
        localStorage.setItem('streamtube_user', JSON.stringify(userWithToken));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('streamtube_user');
  }, []);

  // Check for stored user on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('streamtube_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('streamtube_user');
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
