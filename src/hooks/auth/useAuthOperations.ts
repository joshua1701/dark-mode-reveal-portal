
import { useState } from 'react';
import { User } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useOfflineAuth } from './useOfflineAuth';

export const useAuthOperations = (
  user: User | null,
  setUser: (user: User | null) => void,
  isOfflineMode: boolean,
  setIsOfflineMode: (mode: boolean) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const { handleOfflineLogin } = useOfflineAuth();
  const [loginAttempts, setLoginAttempts] = useState(0);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log(`Attempting login for email: ${email}`);
      
      // Try online mode with Supabase
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('Login error:', error);
          setLoginAttempts(prev => prev + 1);
          
          // If it's the demo account that doesn't exist yet, offer to create it
          if (email === 'admin@cogswellshare.com' && error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Demo Account',
              description: 'Would you like to create the demo admin account?',
              action: (
                <button 
                  onClick={() => createDemoAdmin(email, password)}
                  className="ml-2 bg-primary text-white px-3 py-1 rounded"
                >
                  Create Demo Account
                </button>
              )
            });
          } else {
            // Try offline mode as fallback
            const offlineUser = handleOfflineLogin(email, password);
            if (offlineUser) {
              setUser(offlineUser);
              setIsOfflineMode(true);
              setIsLoading(false);
              
              toast({
                title: 'Offline Mode',
                description: 'Logged in using offline mode',
              });
              
              return true;
            } else {
              toast({
                title: 'Login Failed',
                description: error.message,
                variant: 'destructive'
              });
              setIsLoading(false);
              return false;
            }
          }
        } else if (data?.user) {
          // Supabase login successful - the session change will trigger the rest of the auth flow
          console.log('Supabase auth successful');
          
          // Return success - the session listener will handle the rest
          setIsLoading(false);
          return true;
        }
      } catch (err) {
        console.error('Supabase connection error:', err);
        setIsOfflineMode(true);
        
        // Try offline login since online failed
        const offlineUser = handleOfflineLogin(email, password);
        if (offlineUser) {
          setUser(offlineUser);
          setIsLoading(false);
          
          toast({
            title: 'Offline Mode',
            description: 'Logged in using offline mode due to connection issues',
          });
          
          return true;
        }
      }
      
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error('Login exception:', error);
      
      // Try offline login as last resort
      const offlineUser = handleOfflineLogin(email, password);
      if (offlineUser) {
        setUser(offlineUser);
        setIsOfflineMode(true);
        setIsLoading(false);
        
        toast({
          title: 'Offline Mode',
          description: 'Logged in using offline mode due to an error',
        });
        
        return true;
      }
      
      toast({
        title: 'Login Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      
      setIsLoading(false);
      return false;
    }
  };

  const createDemoAdmin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Create the demo admin account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: 'Admin',
            role: 'admin'
          }
        }
      });
      
      if (error) {
        toast({
          title: 'Account Creation Failed',
          description: error.message,
          variant: 'destructive'
        });
        console.error('Account creation error:', error);
        setIsLoading(false);
        return false;
      } else {
        toast({
          title: 'Demo Account Created',
          description: 'You can now log in with admin@cogswellshare.com and DemoAdmin123!',
        });
        
        // Try to log in with the new account
        await login(email, password);
        return true;
      }
    } catch (error: any) {
      console.error('Error creating demo account:', error);
      toast({
        title: 'Account Creation Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null);
      localStorage.removeItem('designer_portal_user');
      
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Attempt to clear local state anyway
      setUser(null);
      localStorage.removeItem('designer_portal_user');
      
      toast({
        title: 'Logout Warning',
        description: 'Logged out locally, but there was a server error.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout
  };
};
