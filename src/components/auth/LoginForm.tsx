
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type LoginFormProps = {
  onSwitchToRegistration?: () => void;
};

const LoginForm = ({ onSwitchToRegistration }: LoginFormProps) => {
  const { login, isLoading, users } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Add debugging log to verify what's being sent
    console.log('Attempting login with:', email, password);
    
    // Trim email and password to prevent whitespace issues
    const trimmedEmail = email.trim();
    const trimmedPassword = password;
    
    // Execute login
    const success = await login(trimmedEmail, trimmedPassword);
    console.log('Login result:', success);
    
    if (success) {
      // Redirect based on user role
      const currentUser = users.find(u => u.email === trimmedEmail);
      if (currentUser && currentUser.role === 'customer') {
        navigate('/customer/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }
  };

  return (
    <Card className="w-full max-w-md bg-black/40 border-white/10">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the portal
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-white/5 border-white/10"
            />
          </div>

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
            ) : 'Login'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
