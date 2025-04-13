
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export type User = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'customer';
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  verifyMagicLink: (id: string, key: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin user
const mockAdmin: User = {
  id: '1',
  username: 'Joshua',
  email: 'joshua@example.com',
  role: 'admin',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('designer_portal_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (username === 'Joshua' && password === 'Cogswell2024!') {
      setUser(mockAdmin);
      localStorage.setItem('designer_portal_user', JSON.stringify(mockAdmin));
      toast({
        title: 'Login successful',
        description: 'Welcome back, Joshua!',
        variant: 'default'
      });
      setIsLoading(false);
      return true;
    } else {
      toast({
        title: 'Login failed',
        description: 'Invalid username or password',
        variant: 'destructive'
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('designer_portal_user');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const verifyMagicLink = async (id: string, key: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, we'll accept any link with both id and key
    if (id && key) {
      setIsLoading(false);
      return true;
    } else {
      toast({
        title: 'Invalid link',
        description: 'The link you followed appears to be invalid or expired',
        variant: 'destructive'
      });
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, verifyMagicLink }}>
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
