
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import authService from '../services/authService';
import { Spinner } from '../components/ui/spinner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  devModeAuth: () => void; // New function for dev mode authentication
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  useEffect(() => {
    async function loadUser() {
      if (isAuthenticated) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          setUser(null);
          setIsAuthenticated(false);
          authService.logout();
        }
      }
      setLoading(false);
    }
    
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await authService.login({ email, password });
      const userData = authService.getStoredUser();
      setUser(userData);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any): Promise<void> => {
    setLoading(true);
    try {
      await authService.register(data);
      // After registration, proceed to login
      await authService.login({ email: data.email, password: data.password });
      const userData = authService.getStoredUser();
      setUser(userData);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Development mode authentication function
  const devModeAuth = () => {
    // Create a mock user
    const mockUser: User = {
      userId: 'dev-user-id',
      name: 'Dev User',
      email: 'dev@example.com',
      organisation: 'Development Org',
      employmentPosition: 'Developer'
    };
    
    // Store mock user and token
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'dev-mode-token');
    
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, register, logout, devModeAuth }}
    >
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
