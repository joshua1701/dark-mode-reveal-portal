
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { User, UserRole } from '@/types/project';

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  verifyMagicLink: (id: string, key: string) => Promise<boolean>;
  updateProfileImage: (image: string) => void;
  users: User[];
  addUser: (username: string, email: string, role: UserRole) => string;
  getUserByEmail: (email: string) => User | undefined;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin user
const mockAdmin: User = {
  id: '1',
  username: 'Joshua',
  email: 'joshua@example.com',
  role: 'admin',
  profileImage: '',
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([mockAdmin]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('designer_portal_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Load saved users
    const savedUsers = localStorage.getItem('designer_portal_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      localStorage.setItem('designer_portal_users', JSON.stringify([mockAdmin]));
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
      // Check if user exists in our users array
      const foundUser = users.find(u => u.username === username);
      if (foundUser) {
        // In a real app, we'd check password hash, but for demo we'll just login
        setUser(foundUser);
        localStorage.setItem('designer_portal_user', JSON.stringify(foundUser));
        toast({
          title: 'Login successful',
          description: `Welcome back, ${foundUser.username}!`,
          variant: 'default'
        });
        setIsLoading(false);
        return true;
      }
      
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
  
  const updateProfileImage = (image: string) => {
    if (user) {
      const updatedUser = { ...user, profileImage: image };
      setUser(updatedUser);
      localStorage.setItem('designer_portal_user', JSON.stringify(updatedUser));
      
      // Also update in users array
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      setUsers(updatedUsers);
      localStorage.setItem('designer_portal_users', JSON.stringify(updatedUsers));
      
      toast({
        title: 'Profile updated',
        description: 'Your profile image has been updated successfully',
      });
    }
  };
  
  const addUser = (username: string, email: string, role: UserRole): string => {
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      toast({
        title: 'User already exists',
        description: 'A user with this email already exists',
        variant: 'destructive'
      });
      return '';
    }
    
    // Generate a new user
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      username,
      email,
      role,
      profileImage: '',
      createdAt: new Date().toISOString(),
      createdBy: user?.id,
    };
    
    // Add to users array
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('designer_portal_users', JSON.stringify(updatedUsers));
    
    toast({
      title: 'User added',
      description: `${username} has been added as a ${role}`,
    });
    
    // Generate invitation link (in a real app, this would create a special token)
    return `${window.location.origin}/?invite=${newUser.id}`;
  };
  
  const getUserByEmail = (email: string): User | undefined => {
    return users.find(u => u.email === email);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      verifyMagicLink, 
      updateProfileImage,
      users,
      addUser,
      getUserByEmail
    }}>
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
