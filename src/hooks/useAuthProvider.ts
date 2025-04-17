
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/project';
import { defaultUsers } from '@/data/mockUsers';
import { toast } from '@/components/ui/use-toast';

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('designer_portal_user');
        const savedUsers = localStorage.getItem('designer_portal_users');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers));
        } else {
          // Initialize users in localStorage if not present
          localStorage.setItem('designer_portal_users', JSON.stringify(defaultUsers));
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
      
      // Mock authentication for both admin users
      if ((email === 'admin@cogswell.de' && password === 'password') ||
          (email === 'joshua@cogswell.de' && password === 'Cogswell1234#+')) {
        // Find the correct user to log in
        const userToLogin = users.find(u => u.email === email);
        
        if (userToLogin) {
          setUser(userToLogin);
          localStorage.setItem('designer_portal_user', JSON.stringify(userToLogin));
          
          toast({
            title: 'Login successful',
            description: 'Welcome back to CogswellShare!',
          });

          return true;
        }
      }
      
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
        variant: 'destructive',
      });

      return false;
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

  const updateProfileImage = (imageUrl: string) => {
    if (!user) return;

    const updatedUser = { ...user, profileImage: imageUrl };
    setUser(updatedUser);
    localStorage.setItem('designer_portal_user', JSON.stringify(updatedUser));

    // Also update in users array
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, profileImage: imageUrl } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('designer_portal_users', JSON.stringify(updatedUsers));

    toast({
      title: 'Profile updated',
      description: 'Your profile image has been updated successfully',
    });
  };

  const addUser = (username: string, email: string, role: UserRole): string => {
    // Generate a random ID
    const newId = `user-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create invitation link (just for demo purposes)
    const inviteKey = Math.random().toString(36).substring(2, 15);
    const inviteLink = `${window.location.origin}/invite?id=${newId}&key=${inviteKey}`;
    
    // Create new user
    const newUser: User = {
      id: newId,
      username,
      email,
      role,
      createdAt: new Date().toISOString(),
      createdBy: user?.id
    };
    
    // Add to users array
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('designer_portal_users', JSON.stringify(updatedUsers));
    
    toast({
      title: 'User added',
      description: `${username} has been added successfully`,
    });
    
    return inviteLink;
  };

  return {
    user,
    users,
    isLoading,
    login,
    logout,
    verifyMagicLink,
    updateProfileImage,
    addUser
  };
};
