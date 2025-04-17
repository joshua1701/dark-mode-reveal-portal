
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import LoginLayout from '@/components/auth/LoginLayout';
import LoginForm from '@/components/auth/LoginForm';
import RegistrationForm from '@/components/auth/RegistrationForm';

const Login = () => {
  const { users, user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [isRegistration, setIsRegistration] = useState(false);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [invitedUser, setInvitedUser] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    if (user && !isLoading && !redirecting) {
      setRedirecting(true);
      
      console.log('User logged in, redirecting to dashboard. User role:', user.role);
      
      // Add a slight delay to ensure state updates before redirect
      setTimeout(() => {
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (user.role === 'customer') {
          navigate('/customer/dashboard', { replace: true });
        }
      }, 100);
    }
    
    // Check for invitation parameter
    const urlParams = new URLSearchParams(location.search);
    const invite = urlParams.get('invite');
    
    if (invite) {
      setInviteId(invite);
      setIsRegistration(true);
      
      // Find invited user
      const foundUser = users.find(u => u.id === invite);
      if (foundUser) {
        setInvitedUser(foundUser);
        setEmail(foundUser.email);
      } else {
        toast({
          title: 'Invalid invitation',
          description: 'The invitation link is invalid or expired',
          variant: 'destructive'
        });
      }
    }
  }, [location, user, users, navigate, isLoading]);

  if (isLoading || (user && redirecting)) {
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
