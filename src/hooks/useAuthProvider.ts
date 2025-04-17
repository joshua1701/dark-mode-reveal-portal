import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/project';
import { defaultUsers } from '@/data/mockUsers';
import { toast } from '@/components/ui/use-toast';
import { supabase, getUserRole, SupabaseUser } from '@/lib/supabase';

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [isLoading, setIsLoading] = useState(true);

  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email,
      role: getUserRole(supabaseUser) as UserRole,
      createdAt: new Date().toISOString()
    };
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const mappedUser = mapSupabaseUser(session.user as SupabaseUser);
          setUser(mappedUser);
          console.log('User authenticated:', mappedUser);
        } else {
          console.log('No active session');
          setUser(null);
        }
        
        const savedUsers = localStorage.getItem('designer_portal_users');
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers));
        } else {
          localStorage.setItem('designer_portal_users', JSON.stringify(defaultUsers));
        }
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (session?.user) {
              const mappedUser = mapSupabaseUser(session.user as SupabaseUser);
              setUser(mappedUser);
            } else {
              setUser(null);
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Login attempt with email:', email);
      
      if (email === 'admin@cogswellshare.com' && password === 'DemoAdmin123!') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Supabase login error:', error);
          
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Demo mode',
              description: 'In a real app, please create this user in Supabase first',
            });
            const mockUser: User = {
              id: 'admin-demo-id',
              username: 'Admin',
              email: 'admin@cogswellshare.com',
              role: 'admin',
              createdAt: new Date().toISOString()
            };
            setUser(mockUser);
            return true;
          }
          
          toast({
            title: 'Login failed',
            description: error.message,
            variant: 'destructive',
          });
          return false;
        }
        
        if (data.user) {
          const mappedUser = mapSupabaseUser(data.user as SupabaseUser);
          setUser(mappedUser);
          
          toast({
            title: 'Login successful',
            description: 'Welcome to CogswellShare!',
          });
          return true;
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Login error:', error);
          
          toast({
            title: 'Login failed',
            description: error.message,
            variant: 'destructive',
          });
          return false;
        }
        
        if (data.user) {
          const mappedUser = mapSupabaseUser(data.user as SupabaseUser);
          setUser(mappedUser);
          
          toast({
            title: 'Login successful',
            description: 'Welcome to CogswellShare!',
          });
          return true;
        }
      }
      
      if ((email === 'admin@cogswell.de' && password === 'password') ||
          (email === 'joshua@cogswell.de' && password === 'Cogswell1234#+') ||
          (email === 'credits@cogswell.de' && password === 'password') ||
          (email === 'customer@example.com' && password === 'password')) {
            
        const userToLogin = users.find(u => u.email === email);
        
        if (userToLogin) {
          console.log('User found, logging in:', userToLogin.username);
          setUser(userToLogin);
          
          toast({
            title: 'Login successful',
            description: 'Welcome to CogswellShare!',
          });
          return true;
        }
      }
      
      console.log('Login failed for email:', email);
      
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout error',
        description: 'An error occurred during logout',
        variant: 'destructive',
      });
    }
  };

  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login?redirect=admin/dashboard`,
        },
      });
      
      if (error) {
        console.error('Magic link error:', error);
        toast({
          title: 'Magic link failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Magic link sent',
        description: 'Please check your email for the login link',
      });
      return true;
    } catch (error) {
      console.error('Magic link error:', error);
      toast({
        title: 'Magic link error',
        description: 'An error occurred sending the magic link',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMagicLink = async (id: string, key: string): Promise<boolean> => {
    try {
      console.log('Verifying magic link:', { id, key });
      
      const savedProjects = localStorage.getItem('designer_portal_projects');
      if (!savedProjects) {
        console.error('No projects found in localStorage');
        return false;
      }

      const projects = JSON.parse(savedProjects);
      
      const project = projects.find(
        (p: any) => p.id === id && p.magicKey === key
      );
      
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
    const newId = `user-${Math.random().toString(36).substring(2, 9)}`;
    
    const inviteKey = Math.random().toString(36).substring(2, 15);
    const inviteLink = `${window.location.origin}/invite?id=${newId}&key=${inviteKey}`;
    
    const newUser: User = {
      id: newId,
      username,
      email,
      role,
      createdAt: new Date().toISOString(),
      createdBy: user?.id
    };
    
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
    loginWithMagicLink,
    verifyMagicLink,
    updateProfileImage,
    addUser
  };
};
