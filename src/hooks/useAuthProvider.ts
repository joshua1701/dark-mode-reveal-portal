
import { User } from '@/types/project';
import { useAuthCore } from './auth/useAuthCore';
import { useMagicLink } from './auth/useMagicLink';
import { useUserManagement } from './auth/useUserManagement';

export const useAuthProvider = () => {
  // Use the core authentication hook
  const { 
    user, 
    isLoading: authLoading, 
    isOfflineMode,
    setUser,
    login, 
    logout 
  } = useAuthCore();
  
  // Use the magic link authentication hook
  const { 
    isLoading: magicLinkLoading,
    loginWithMagicLink, 
    verifyMagicLink 
  } = useMagicLink();
  
  // Use the user management hook
  const { 
    users, 
    updateProfileImage: updateUserProfileImage,
    addUser 
  } = useUserManagement(user);

  // Combine the loading states
  const isLoading = authLoading || magicLinkLoading;

  // Wrap the updateProfileImage method to update the current user
  const updateProfileImage = (imageUrl: string) => {
    if (!user) return;
    
    const updatedUser = updateUserProfileImage(imageUrl);
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('designer_portal_user', JSON.stringify(updatedUser));
    }
  };

  // Combine all the hooks into a unified API
  return {
    user,
    users,
    isLoading,
    isOfflineMode,
    login,
    logout,
    loginWithMagicLink,
    verifyMagicLink,
    updateProfileImage,
    addUser
  };
};
