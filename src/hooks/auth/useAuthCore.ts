
import { User } from '@/types/project';
import { useSession } from './useSession';
import { useAuthOperations } from './useAuthOperations';
import { toast } from '@/components/ui/use-toast';

export const useAuthCore = () => {
  const {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isOfflineMode,
    setIsOfflineMode
  } = useSession();

  const { login, logout } = useAuthOperations(
    user,
    setUser,
    isOfflineMode,
    setIsOfflineMode,
    setIsLoading
  );

  return {
    user,
    setUser,
    isLoading,
    isOfflineMode,
    login,
    logout
  };
};
