
import { useState } from 'react';
import { User, UserRole } from '@/types/project';
import { supabase, handleSupabaseError } from '@/lib/supabase';
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log(`Attempting login for email: ${email}`);
      
      if (!isOfflineMode) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) {
            console.error('Login error:', error);
            const shouldUseOffline = handleSupabaseError(error);
            
            if (shouldUseOffline) {
              setIsOfflineMode(true);
            } else {
              setIsLoading(false);
              return false;
            }
          } else if (data?.user) {
            // Fetch user profile from profiles table
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (profileError) {
              console.error('Error fetching profile:', profileError);
              const userRole: UserRole = email === 'admin@cogswellshare.com' ? 'admin' : 'customer';
              
              // Create a new user profile if it doesn't exist
              const newUser: User = {
                id: data.user.id,
                username: email.split('@')[0],
                email: email,
                role: userRole,
                createdAt: new Date().toISOString(),
              };
              
              setUser(newUser);
              localStorage.setItem('designer_portal_user', JSON.stringify(newUser));
            } else {
              // Use profile data for the user
              const newUser: User = {
                id: profileData.id,
                username: profileData.username,
                email: profileData.email,
                role: profileData.role as UserRole,
                profileImage: profileData.profile_image,
                createdAt: profileData.created_at,
              };
              
              setUser(newUser);
              localStorage.setItem('designer_portal_user', JSON.stringify(newUser));
            }
            
            toast({
              title: 'Login Successful',
              description: `Welcome back, ${profileData?.username || email.split('@')[0]}!`,
            });
            
            setIsLoading(false);
            return true;
          }
        } catch (err) {
          console.error('Supabase connection error:', err);
          setIsOfflineMode(true);
          toast({
            title: 'Connection Error',
            description: 'Switched to offline mode',
          });
        }
      }
      
      if (isOfflineMode) {
        const offlineUser = handleOfflineLogin(email, password);
        
        if (offlineUser) {
          setUser(offlineUser);
          setIsLoading(false);
          return true;
        } else {
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

  const logout = async () => {
    setIsLoading(true);
    
    try {
      if (!isOfflineMode) {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Supabase logout error:', error);
        }
      }
      
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
    login,
    logout
  };
};
