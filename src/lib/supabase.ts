
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add error handling for Supabase requests
export const handleSupabaseError = (error: any) => {
  console.error('Supabase Error:', error);
  
  // Check for network errors
  if (error.message === 'Failed to fetch') {
    toast({
      title: 'Connection Error',
      description: 'Could not connect to authentication service. Using offline mode.',
      variant: 'destructive'
    });
    return true; // Return true to indicate offline fallback should be used
  }
  
  // Handle specific error codes
  switch (error?.code) {
    case 'auth/invalid-email':
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      break;
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      toast({
        title: 'Authentication Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive'
      });
      break;
    default:
      toast({
        title: 'Authentication Error',
        description: error.message || 'An error occurred during authentication.',
        variant: 'destructive'
      });
  }
  
  return false; // No offline fallback needed
};

// User types from Supabase
export type SupabaseUser = {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
    role?: string;
  };
};

// Helper function to get user role
export const getUserRole = (user: SupabaseUser | null): string => {
  if (!user) return 'guest';
  
  // First try to get role from user metadata
  const metadataRole = user.user_metadata?.role;
  if (metadataRole) return metadataRole;
  
  // For demo purposes, hardcode admin email
  if (user.email === 'admin@cogswellshare.com') return 'admin';
  
  // Default role
  return 'customer';
};

// Set up demo user in dev environment
export const setupDemoUser = async () => {
  if (import.meta.env.DEV) {
    try {
      // Check if admin user exists
      const { data } = await supabase.auth.admin.listUsers();
      const adminExists = data?.users?.some(u => u.email === 'admin@cogswellshare.com');
      
      if (!adminExists) {
        console.log('Setting up demo admin user...');
        // This would typically be done in Supabase dashboard or backend
        // For demo purposes, you'd manually create this user in Supabase
      }
    } catch (error) {
      console.error('Failed to check/setup demo user:', error);
    }
  }
};

// Demo users for offline mode
export const demoUsers = [
  {
    id: 'admin-id-123',
    email: 'admin@cogswellshare.com',
    username: 'admin',
    password: 'DemoAdmin123!',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-id-joshua',
    email: 'joshua@cogswell.de',
    username: 'Joshua',
    password: 'Cogswell#+',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'customer-id-456',
    email: 'customer@example.com',
    username: 'customer',
    password: 'DemoCustomer123!',
    role: 'customer',
    createdAt: new Date().toISOString()
  }
];
