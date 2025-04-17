
import { useState, useEffect } from 'react';
import { User } from '@/types/project';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const useAuthCore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the auth state from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('designer_portal_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('designer_portal_user');
      }
    }
    
    // Check for existing Supabase session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          // If we have a session but no user in localStorage, create one
          const supabaseUser = data.session.user;
          if (!savedUser) {
            const newUser: User = {
              id: supabaseUser.id,
              username: supabaseUser.email?.split('@')[0] || 'User',
              email: supabaseUser.email || '',
              role: supabaseUser.email === 'admin@cogswellshare.com' ? 'admin' : 'customer',
              createdAt: new Date().toISOString(),
            };
            setUser(newUser);
            localStorage.setItem('designer_portal_user', JSON.stringify(newUser));
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    checkSession();
  }, []);

  // Login method to authenticate user
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Log login attempt
      console.log(`Attempting login for email: ${email}`);
      
      // Attempt login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        handleSupabaseError(error);
        setIsLoading(false);
        return false;
      }
      
      if (data?.user) {
        // Create user object from Supabase user
        const role = email === 'admin@cogswellshare.com' ? 'admin' : 'customer';
        const newUser: User = {
          id: data.user.id,
          username: email.split('@')[0],
          email: email,
          role: role,
          createdAt: new Date().toISOString(),
        };
        
        // Update state and localStorage
        setUser(newUser);
        localStorage.setItem('designer_portal_user', JSON.stringify(newUser));
        
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${newUser.username}!`,
        });
        
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error('Login exception:', error);
      handleSupabaseError(error);
      setIsLoading(false);
      return false;
    }
  };

  // Logout method to sign out user
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear user from state and localStorage
      setUser(null);
      localStorage.removeItem('designer_portal_user');
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Error',
        description: 'There was an error during logout.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    setUser,
    isLoading,
    login,
    logout
  };
};
