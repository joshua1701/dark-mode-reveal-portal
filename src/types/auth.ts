
import { User } from './project';

export interface AuthContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  isOfflineMode: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<boolean>;
  verifyMagicLink: (id: string, key: string) => Promise<boolean>;
  updateProfileImage: (imageUrl: string) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
}
