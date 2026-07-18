import { useState, useEffect } from 'react';
import { User } from '@/types/project';

// Login has been removed - auto-authenticate as admin
const AUTO_USER: User = {
  id: 'admin-auto',
  username: 'Admin',
  email: 'admin@cogswell.de',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

export const useSession = () => {
  const [user, setUser] = useState<User | null>(AUTO_USER);
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(true);

  useEffect(() => {
    localStorage.setItem('designer_portal_user', JSON.stringify(AUTO_USER));
  }, []);

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    isOfflineMode,
    setIsOfflineMode,
  };
};
