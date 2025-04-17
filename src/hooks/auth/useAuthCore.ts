
import { useState, useEffect } from 'react';
import { User } from '@/types/project';
import { supabase, getUserRole, SupabaseUser } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

// Map Supabase user to our application User type
export const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
  return {
    id: supabaseUser.id,
    username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || 'User',
    email: supabaseUser.email,
    role: getUserRole(supabaseUser) as any,
    createdAt: new Date().toISOString()
  };
};

export const useAuthCore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status and subscribe to auth changes
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

  return {
    user,
    isLoading,
    setUser,
    login,
    logout
  };
};
