
import { User, UserRole } from '@/types/project';
import { useUserList } from './useUserList';
import { useUserProfile } from './useUserProfile';
import { useUserCreation } from './useUserCreation';

export const useUserManagement = (currentUser: User | null) => {
  const { users, setUsers } = useUserList(currentUser);
  const { updateProfileImage } = useUserProfile(currentUser);
  const { addUser } = useUserCreation(currentUser, users, setUsers);

  return {
    users,
    updateProfileImage,
    addUser
  };
};
