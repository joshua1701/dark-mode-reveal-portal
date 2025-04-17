
import { useState } from 'react';
import { User } from '@/types/project';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export const useUserProfile = (currentUser: User | null) => {
  const updateProfileImage = (imageUrl: string) => {
    if (!currentUser) return null;

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

    toast({
      title: 'Profile updated',
      description: 'Your profile image has been updated successfully',
    });
    
    return updatedUser;
  };

  return {
    updateProfileImage
  };
};
