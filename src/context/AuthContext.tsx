
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/project';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyMagicLink: (id: string, key: string) => Promise<boolean>;
};

const mockUser: User = {
  id: 'admin-1',
  username: 'Admin User',
  email: 'admin@cogswell.de',
  role: 'admin',
  createdAt: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('designer_portal_user');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple mock authentication
      if (email === 'admin@cogswell.de' && password === 'password') {
        setUser(mockUser);
        localStorage.setItem('designer_portal_user', JSON.stringify(mockUser));
        
        toast({
          title: 'Login successful',
          description: 'Welcome back to CogswellShare!',
        });

        return true;
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password',
          variant: 'destructive',
        });

        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: 'Login error',
        description: 'An error occurred during login',
        variant: 'destructive',
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('designer_portal_user');
    
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  const verifyMagicLink = async (id: string, key: string): Promise<boolean> => {
    try {
      // When debugging, log the id and key being checked
      console.log('Verifying magic link:', { id, key });
      
      // Get projects from localStorage to check if the magic link is valid
      const savedProjects = localStorage.getItem('designer_portal_projects');
      if (!savedProjects) {
        console.error('No projects found in localStorage');
        return false;
      }

      const projects = JSON.parse(savedProjects);
      
      // Find the project with the matching id and key
      const project = projects.find(
        (p: any) => p.id === id && p.magicKey === key
      );
      
      // Log whether a project was found
      console.log('Project found:', !!project);
      
      return !!project;
    } catch (error) {
      console.error('Error verifying magic link:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        verifyMagicLink,
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
