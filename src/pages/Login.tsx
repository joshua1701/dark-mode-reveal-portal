
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import LoginLayout from '@/components/auth/LoginLayout';
import LoginForm from '@/components/auth/LoginForm';
import RegistrationForm from '@/components/auth/RegistrationForm';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isRegistration, setIsRegistration] = useState(false);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [invitedUser, setInvitedUser] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is already logged in with Supabase
  useEffect(() => {
    const checkSession = async () => {
      // First set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state change event:', event);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Don't call Supabase directly in the callback to avoid deadlocks
            setTimeout(() => {
              fetchUserProfile(session.user.id);
            }, 0);
          }
        }
      );
      
      // Then check for existing session
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);
      setUser(sessionData.session?.user ?? null);
      
      if (sessionData.session?.user) {
        await fetchUserProfile(sessionData.session.user.id);
      } else {
        setLoading(false);
      }
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkSession();
    
    // Check for invitation parameter
    const urlParams = new URLSearchParams(location.search);
    const invite = urlParams.get('invite');
    
    if (invite) {
      setInviteId(invite);
      setIsRegistration(true);
    }
  }, [location]);
  
  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }
      
      setUserProfile(profile);
      
      // Redirect based on role if not already redirecting
      if (profile && !redirecting) {
        setRedirecting(true);
        
        console.log('User logged in, redirecting to dashboard. User role:', profile.role);
        
        // Add a slight delay to ensure state updates before redirect
        setTimeout(() => {
          // Redirect based on role
          if (profile.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else if (profile.role === 'customer') {
            navigate('/customer/dashboard', { replace: true });
          }
        }, 100);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setLoading(false);
    }
  };
  
  if (loading || (userProfile && redirecting)) {
    return (
      <LoginLayout>
        <div className="flex flex-col items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
          <p>Authenticating...</p>
        </div>
      </LoginLayout>
    );
  }

  return (
    <LoginLayout>
      {isRegistration ? (
        <RegistrationForm 
          invitedUser={invitedUser} 
          inviteId={inviteId} 
          email={email} 
        />
      ) : (
        <LoginForm />
      )}
    </LoginLayout>
  );
};

export default Login;
