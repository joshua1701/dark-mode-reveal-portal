
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Key, Eye, EyeOff, WifiOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LoginFormProps = {
  onSwitchToRegistration?: () => void;
};

const LoginForm = ({ onSwitchToRegistration }: LoginFormProps) => {
  const { login, loginWithMagicLink, isLoading, user, isOfflineMode } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [activeTab, setActiveTab] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // If user is already logged in, redirect them
  React.useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'customer') {
        navigate('/customer/dashboard');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Add debugging log to verify what's being sent
    console.log('Attempting login with:', email, password);
    
    try {
      // Trim email and password to prevent whitespace issues
      const trimmedEmail = email.trim();
      const trimmedPassword = password;
      
      // Execute login
      const success = await login(trimmedEmail, trimmedPassword);
      console.log('Login result:', success);
      
      if (success) {
        setLoginSuccess(true);
        // The redirect is now handled by the useEffect hook
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Please check your credentials or try again later.",
        variant: "destructive"
      });
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (isOfflineMode) {
      toast({
        title: "Magic Link Unavailable",
        description: "Magic link login is not available in offline mode. Please use password login.",
        variant: "destructive"
      });
      setActiveTab('password');
      return;
    }

    try {
      const trimmedEmail = magicLinkEmail.trim();
      const success = await loginWithMagicLink(trimmedEmail);
      
      if (success) {
        toast({
          title: "Magic link sent",
          description: "Please check your email for the login link.",
        });
      }
    } catch (error) {
      console.error('Magic link error:', error);
      toast({
        title: "Failed to send magic link",
        description: "Please check your email or try again later.",
        variant: "destructive"
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md bg-black/40 border-white/10">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the portal
        </CardDescription>
        
        {isOfflineMode && (
          <Alert variant="destructive" className="mt-2 bg-yellow-500/20 border-yellow-600/50">
            <WifiOff className="h-4 w-4 mr-2" />
            <AlertDescription className="text-white">
              Running in offline mode. Use demo accounts: admin@cogswellshare.com / DemoAdmin123! or customer@example.com / DemoCustomer123!
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <Tabs defaultValue="password" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-black/20">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="magic-link" disabled={isOfflineMode}>Magic Link</TabsTrigger>
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pl-10 pr-10 bg-white/5 border-white/10"
                  />
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-designer-text-secondary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {loginSuccess && (
                <Alert className="bg-green-500/20 border-green-600/50">
                  <AlertDescription className="text-white">
                    Login successful! Redirecting...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || loginSuccess}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : loginSuccess ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
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
