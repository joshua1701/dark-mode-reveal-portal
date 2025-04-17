
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import LoginLayout from '@/components/auth/LoginLayout';
import LoginForm from '@/components/auth/LoginForm';
import RegistrationForm from '@/components/auth/RegistrationForm';

const Login = () => {
  const { users, user } = useAuth();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [isRegistration, setIsRegistration] = useState(false);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [invitedUser, setInvitedUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      // Redirect based on role - this will now be handled in each form component
      // to avoid duplicating this logic
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
  }, [location, user, users]);

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
