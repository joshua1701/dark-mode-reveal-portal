
import { User, UserRole } from '@/types/project';
import { toast } from '@/components/ui/use-toast';

export const useUserCreation = (currentUser: User | null, users: User[], setUsers: (users: User[]) => void) => {
  const addUser = (username: string, email: string, role: UserRole): User => {
    // This would normally create a user in Supabase Auth
    // For demo purposes, we'll create a new User object with a random ID
    const newId = `user-${Math.random().toString(36).substring(2, 9)}`;
    
    const newUser: User = {
      id: newId,
      username,
      email,
      role,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('designer_portal_users', JSON.stringify(updatedUsers));
    
    toast({
      title: 'User added',
      description: `${username} has been added successfully`,
    });
    
    return newUser;
  };

  return {
    addUser
  };
};
