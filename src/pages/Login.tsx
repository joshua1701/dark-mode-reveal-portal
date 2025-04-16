
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Login = () => {
  const { login, isLoading, users, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isRegistration, setIsRegistration] = useState(false);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [invitedUser, setInvitedUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      navigate('/admin/dashboard');
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
        setUsername(foundUser.username);
      } else {
        toast({
          title: 'Invalid invitation',
          description: 'The invitation link is invalid or expired',
          variant: 'destructive'
        });
      }
    }
  }, [location, navigate, user, users]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (isRegistration) {
      if (newPassword !== confirmPassword) {
        toast({
          title: 'Passwords do not match',
          description: 'Please make sure your passwords match',
          variant: 'destructive'
        });
        return;
      }
      
      if (newPassword.length < 8) {
        toast({
          title: 'Password too short',
          description: 'Password must be at least 8 characters long',
          variant: 'destructive'
        });
        return;
      }
      
      // In a real app, we would register the user with new password
      // For this demo, we'll just log them in
      const success = await login(username, newPassword);
      if (success) {
        navigate('/admin/dashboard');
      }
    } else {
      const success = await login(username, password);
      if (success) {
        navigate('/admin/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-designer-background text-designer-text-primary">
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
          alt="CogswellShare" 
          className="h-16 mb-4"
        />
        <h1 className="text-3xl font-bold text-white">CogswellShare</h1>
        <p className="text-designer-text-secondary">Design Delivery Portal</p>
      </div>

      <Card className="w-full max-w-md bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle>{isRegistration ? 'Complete Registration' : 'Login'}</CardTitle>
          <CardDescription>
            {isRegistration 
              ? 'Set your password to complete your account setup'
              : 'Enter your credentials to access the portal'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isRegistration}
                className="bg-white/5 border-white/10"
              />
            </div>

            {isRegistration ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                isRegistration ? 'Complete Registration' : 'Login'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
