
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

type RegistrationFormProps = {
  invitedUser: any;
  inviteId: string | null;
  email: string;
};

const RegistrationForm = ({ invitedUser, inviteId, email }: RegistrationFormProps) => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

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
    const success = await login(email, newPassword);
    if (success) {
      // Redirect based on role
      if (invitedUser && invitedUser.role === 'customer') {
        navigate('/customer/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }
  };

  return (
    <Card className="w-full max-w-md bg-black/40 border-white/10">
      <CardHeader>
        <CardTitle>Complete Registration</CardTitle>
        <CardDescription>
          Set your password to complete your account setup
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleRegistration}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-white/5 border-white/10"
            />
          </div>

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
            ) : 'Complete Registration'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegistrationForm;
