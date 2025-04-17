
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/project';
import { defaultUsers } from '@/data/mockUsers';
import { supabase } from '@/lib/supabase';

export const useUserList = (currentUser: User | null) => {
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

  return { users, setUsers };
};
