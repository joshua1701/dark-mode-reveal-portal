import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const useMagicLink = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithMagicLink = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login?redirect=admin/dashboard`,
        },
      });
      
      if (error) {
        console.error('Magic link error:', error);
        toast({
          title: 'Magic link failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Magic link sent',
        description: 'Please check your email for the login link',
      });
      return true;
    } catch (error) {
      console.error('Magic link error:', error);
      toast({
        title: 'Magic link error',
        description: 'An error occurred sending the magic link',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Keep the two-parameter signature for verifyMagicLink
  const verifyMagicLink = async (id: string, key: string): Promise<boolean> => {
    try {
      console.log('Verifying magic link:', { id, key });
      
      const savedProjects = localStorage.getItem('designer_portal_projects');
      if (!savedProjects) {
        console.error('No projects found in localStorage');
        return false;
      }

      const projects = JSON.parse(savedProjects);
      
      const project = projects.find(
        (p: any) => p.id === id && p.magicKey === key
      );
      
      console.log('Project found:', !!project);
      
      return !!project;
    } catch (error) {
      console.error('Error verifying magic link:', error);
      return false;
    }
  };

  return {
    isLoading,
    loginWithMagicLink,
    verifyMagicLink
  };
};
