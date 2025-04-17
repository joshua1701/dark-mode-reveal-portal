
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/project';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    // First check localStorage for a saved user
    const savedUser = localStorage.getItem('designer_portal_user');
    let parsedUser: User | null = null;
    
    if (savedUser) {
      try {
        parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('designer_portal_user');
      }
    }
    
    // Then try to check online session with Supabase
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setIsOfflineMode(true);
          
          // Only show offline mode toast if we don't already have a user from localStorage
          if (!parsedUser) {
            toast({
              title: 'Offline Mode',
              description: 'Using offline mode due to connectivity issues',
            });
          }
        } else if (data?.session?.user) {
          const supabaseUser = data.session.user;
          
          // Only fetch profile if we don't already have a user from localStorage
          if (!parsedUser) {
            try {
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
            } catch (err) {
              console.error('Error in profile fetch:', err);
              setIsOfflineMode(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsOfflineMode(true);
        
        // Only show offline mode toast if we don't already have a user from localStorage
        if (!parsedUser) {
          toast({
            title: 'Offline Mode',
            description: 'Using offline mode due to connectivity issues',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Always check the online session to confirm connectivity status
    // even if we have a saved user
    checkSession();
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
