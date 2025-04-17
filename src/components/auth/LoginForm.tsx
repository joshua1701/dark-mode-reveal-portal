
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Key } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type LoginFormProps = {
  onSwitchToRegistration?: () => void;
};

const LoginForm = ({ onSwitchToRegistration }: LoginFormProps) => {
  const { login, loginWithMagicLink, isLoading, users } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [activeTab, setActiveTab] = useState('password');

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

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedEmail = magicLinkEmail.trim();
    await loginWithMagicLink(trimmedEmail);
  };

  return (
    <Card className="w-full max-w-md bg-black/40 border-white/10">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the portal
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="password" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-black/20">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
        </TabsList>
        
        <TabsContent value="password">
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-designer-text-secondary" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-designer-text-secondary" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
              </div>
              
              <div className="text-xs text-designer-text-secondary">
                <p>Demo credentials:</p>
                <p>Email: admin@cogswellshare.com</p>
                <p>Password: DemoAdmin123!</p>
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
        </TabsContent>
        
        <TabsContent value="magic-link">
          <form onSubmit={handleMagicLinkLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magic-link-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-designer-text-secondary" />
                  <Input
                    id="magic-link-email"
                    type="email"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
              </div>
              
              <p className="text-xs text-designer-text-secondary">
                We'll send a magic link to your email that will log you in instantly.
              </p>
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
                    Sending link
                  </>
                ) : 'Send Magic Link'}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default LoginForm;
