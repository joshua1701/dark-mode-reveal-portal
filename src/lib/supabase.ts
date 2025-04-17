
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
