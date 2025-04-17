
import { useState } from 'react';
import { User, UserRole } from '@/types/project';
import { toast } from '@/components/ui/use-toast';
import { defaultUsers } from '@/data/mockUsers';

export const useUserManagement = (currentUser: User | null) => {
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('designer_portal_users');
    return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
  });

  const updateProfileImage = (imageUrl: string) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, profileImage: imageUrl };
    
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

  const addUser = (username: string, email: string, role: UserRole): string => {
    const newId = `user-${Math.random().toString(36).substring(2, 9)}`;
    
    const inviteKey = Math.random().toString(36).substring(2, 15);
    const inviteLink = `${window.location.origin}/invite?id=${newId}&key=${inviteKey}`;
    
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
    
    return inviteLink;
  };

  return {
    users,
    updateProfileImage,
    addUser
  };
};
