
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change event:', event);
        setSession(session);
        
        if (session?.user) {
          // Don't call Supabase directly in the callback to avoid deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        setSession(data.session);
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user.id);
        } else {
          // Check localStorage for a saved user (fallback for offline mode)
          const savedUser = localStorage.getItem('designer_portal_user');
          
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
              setIsOfflineMode(true);
            } catch (error) {
              console.error('Failed to parse saved user:', error);
              localStorage.removeItem('designer_portal_user');
            }
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsOfflineMode(true);
        
        // Try to use saved user from localStorage
        const savedUser = localStorage.getItem('designer_portal_user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('Failed to parse saved user:', error);
            localStorage.removeItem('designer_portal_user');
          }
        }
        
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setIsLoading(false);
        return;
      }
      
      const user: User = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        role: profile.role as UserRole,
        profileImage: profile.profile_image,
        createdAt: profile.created_at
      };
      
      setUser(user);
      localStorage.setItem('designer_portal_user', JSON.stringify(user));
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setIsLoading(false);
      
      // Try to use saved user from localStorage as fallback
      const savedUser = localStorage.getItem('designer_portal_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsOfflineMode(true);
        } catch (error) {
          console.error('Failed to parse saved user:', error);
          localStorage.removeItem('designer_portal_user');
        }
      }
    }
  };

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isOfflineMode,
    setIsOfflineMode,
    session
  };
};
