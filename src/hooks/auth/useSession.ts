
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/project';
import { supabase } from '@/lib/supabase';

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    // First check localStorage for a saved user
    const savedUser = localStorage.getItem('designer_portal_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('designer_portal_user');
      }
    }
    
    // Then try to check online session with Supabase
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data?.session?.user) {
          const supabaseUser = data.session.user;
          
          // Only update if we don't already have a user from localStorage
          if (!savedUser) {
            // Fetch profile from Supabase
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', supabaseUser.id)
              .single();
            
            if (profileError) {
              console.error('Error fetching profile:', profileError);
              // fallback to creating a basic user object
              const newUser: User = {
                id: supabaseUser.id,
                username: supabaseUser.email?.split('@')[0] || 'User',
                email: supabaseUser.email || '',
                role: supabaseUser.email === 'admin@cogswellshare.com' ? 'admin' : 'customer',
                createdAt: new Date().toISOString(),
              };
              setUser(newUser);
              localStorage.setItem('designer_portal_user', JSON.stringify(newUser));
            } else if (profileData) {
              // Map profile data to User type
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
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsOfflineMode(true);
        setIsLoading(false);
      }
    };
    
    // Only check the online session if we don't have a saved user
    if (!savedUser) {
      checkSession();
    }
  }, []);

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isOfflineMode,
    setIsOfflineMode
  };
};
