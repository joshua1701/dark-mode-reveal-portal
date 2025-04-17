
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/project';
import { toast } from '@/components/ui/use-toast';
import { defaultUsers } from '@/data/mockUsers';
import { supabase } from '@/lib/supabase';

export const useUserManagement = (currentUser: User | null) => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('designer_portal_users');
    return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
  });

  useEffect(() => {
    // Fetch users from Supabase profiles table
    const fetchUsers = async () => {
      if (!currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          console.error('Error fetching profiles:', error);
          return;
        }
        
        if (data) {
          // Map profile data to User type
          const supabaseUsers: User[] = data.map(profile => ({
            id: profile.id,
            username: profile.username,
            email: profile.email,
            role: profile.role as UserRole,
            profileImage: profile.profile_image,
            createdAt: profile.created_at,
          }));
          
          setUsers(supabaseUsers);
          localStorage.setItem('designer_portal_users', JSON.stringify(supabaseUsers));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, [currentUser]);

  const updateProfileImage = (imageUrl: string) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, profileImage: imageUrl };
    
    // Update profile in Supabase
    const updateProfile = async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ profile_image: imageUrl })
          .eq('id', currentUser.id);
        
        if (error) {
          console.error('Error updating profile:', error);
          toast({
            title: 'Update failed',
            description: 'Failed to update profile image. Please try again.',
            variant: 'destructive'
          });
          return null;
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    };
    
    updateProfile();
    
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? { ...u, profileImage: imageUrl } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('designer_portal_users', JSON.stringify(updatedUsers));

    toast({
      title: 'Profile updated',
      description: 'Your profile image has been updated successfully',
    });
    
    return updatedUser;
  };

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
    users,
    updateProfileImage,
    addUser
  };
};
