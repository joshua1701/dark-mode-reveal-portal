
import { useState, useEffect } from 'react';
import { User } from '@/types/project';
import { supabase, handleSupabaseError, demoUsers } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const useAuthCore = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

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
        setIsOfflineMode(true);
        toast({
          title: 'Offline Mode',
          description: 'Using offline mode due to connection issues.',
        });
      }
    };
    
    checkSession();
  }, []);

  // Offline login function
  const offlineLogin = (email: string, password: string): User | null => {
    // Find user in demo users
    const demoUser = demoUsers.find(
      u => u.email === email && u.password === password
    );
    
    if (demoUser) {
      // Create user object
      const newUser: User = {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        role: demoUser.role,
        createdAt: demoUser.createdAt,
      };
      
      return newUser;
    }
    
    return null;
  };

  // Login method to authenticate user
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Log login attempt
      console.log(`Attempting login for email: ${email}`);
      
      // Try Supabase first if not already in offline mode
      if (!isOfflineMode) {
        try {
          // Attempt login with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) {
            console.error('Login error:', error);
            const shouldUseOffline = handleSupabaseError(error);
            
            if (shouldUseOffline) {
              setIsOfflineMode(true);
              // Continue to offline login
            } else {
              setIsLoading(false);
              return false;
            }
          } else if (data?.user) {
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
        } catch (err) {
          console.error('Supabase connection error:', err);
          setIsOfflineMode(true);
          // Continue to offline login
          toast({
            title: 'Connection Error',
            description: 'Switched to offline mode',
          });
        }
      }
      
      // Offline login fallback
      if (isOfflineMode) {
        const offlineUser = offlineLogin(email, password);
        
        if (offlineUser) {
          setUser(offlineUser);
          localStorage.setItem('designer_portal_user', JSON.stringify(offlineUser));
          
          toast({
            title: 'Offline Login Successful',
            description: `Welcome back, ${offlineUser.username}! (Offline Mode)`,
          });
          
          setIsLoading(false);
          return true;
        } else {
          toast({
            title: 'Login Failed',
            description: 'Invalid email or password.',
            variant: 'destructive'
          });
          
          setIsLoading(false);
          return false;
        }
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
      // Sign out from Supabase if not in offline mode
      if (!isOfflineMode) {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Supabase logout error:', error);
          // Continue with local logout
        }
      }
      
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
    isOfflineMode,
    login,
    logout
  };
};
