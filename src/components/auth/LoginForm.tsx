
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive'
        });
        console.error('Login error:', error);
        
        // If admin@cogswellshare.com tries to log in but doesn't exist, suggest creating account
        if (email === 'admin@cogswellshare.com' && error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Demo Account',
            description: 'Would you like to create the demo admin account?',
            action: (
              <Button 
                variant="outline" 
                onClick={() => handleCreateDemoAdmin()}
                className="ml-2"
              >
                Create Demo Account
              </Button>
            )
          });
        }
      } else {
        // Login successful - the redirection is handled in the Login component
        toast({
          title: 'Login Successful',
          description: 'You are now logged in'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Login Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      console.error('Login exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDemoAdmin = async () => {
    setIsLoading(true);
    
    try {
      // Create demo admin user
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@cogswellshare.com',
        password: 'DemoAdmin123!',
        options: {
          data: {
            username: 'Admin',
            role: 'admin'
          }
        }
      });
      
      if (error) {
        toast({
          title: 'Account Creation Failed',
          description: error.message,
          variant: 'destructive'
        });
        console.error('Account creation error:', error);
      } else {
        toast({
          title: 'Demo Account Created',
          description: 'You can now log in with admin@cogswellshare.com and DemoAdmin123!',
        });
        
        // Set form values to demo credentials
        setEmail('admin@cogswellshare.com');
        setPassword('DemoAdmin123!');
      }
    } catch (error: any) {
      toast({
        title: 'Account Creation Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      console.error('Account creation exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        toast({
          title: 'Magic Link Failed',
          description: error.message,
          variant: 'destructive'
        });
        console.error('Magic link error:', error);
      } else {
        toast({
          title: 'Magic Link Sent',
          description: 'Check your email for the login link',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Magic Link Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      console.error('Magic link exception:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-black/40 border-white/10">
      <CardHeader>
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <a onClick={handleSendMagicLink} className="text-xs text-designer-badge hover:underline cursor-pointer">
                Or use magic link
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          
          {/* Demo account hint */}
          <div className="text-center mt-4 text-xs text-designer-text-secondary">
            <p>Demo Account: admin@cogswellshare.com / DemoAdmin123!</p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/10 p-4">
        <p className="text-center text-sm text-designer-text-secondary">
          Don't have an account?{' '}
          <Button 
            variant="link" 
            className="text-designer-badge p-0 h-auto font-normal"
            onClick={() => navigate('/register')}
          >
            Create Account
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
