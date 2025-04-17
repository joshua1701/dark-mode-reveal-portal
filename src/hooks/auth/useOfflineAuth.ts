
import { User, UserRole } from '@/types/project';
import { demoUsers } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export const useOfflineAuth = () => {
  const offlineLogin = (email: string, password: string): User | null => {
    const demoUser = demoUsers.find(
      u => u.email === email && u.password === password
    );
    
    if (demoUser) {
      const newUser: User = {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        role: demoUser.role as UserRole,
        createdAt: demoUser.createdAt,
      };
      
      return newUser;
    }
    
    return null;
  };

  const handleOfflineLogin = (email: string, password: string): User | null => {
    const offlineUser = offlineLogin(email, password);
    
    if (offlineUser) {
      localStorage.setItem('designer_portal_user', JSON.stringify(offlineUser));
      
      toast({
        title: 'Offline Login Successful',
        description: `Welcome back, ${offlineUser.username}! (Offline Mode)`,
      });
      
      return offlineUser;
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password.',
        variant: 'destructive'
      });
      
      return null;
    }
  };

  return {
    offlineLogin,
    handleOfflineLogin
  };
};
