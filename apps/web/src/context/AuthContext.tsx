import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

export type UserRole = 'superadmin' | 'companyadmin' | 'employee';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          const fetchedUser = response.data.data.user;
          if (!fetchedUser.role) fetchedUser.role = 'companyadmin'; // Fallback
          setUser(fetchedUser);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData: AuthUser) => {
    if (!userData.role) userData.role = 'companyadmin';
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {!isLoading ? children : (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
