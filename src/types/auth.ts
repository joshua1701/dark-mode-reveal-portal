
import { User, UserRole } from '@/types/project';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginWithMagicLink: (email: string) => Promise<boolean>;
  verifyMagicLink: (id: string, key: string) => Promise<boolean>;
  updateProfileImage: (imageUrl: string) => void;
  addUser: (username: string, email: string, role: UserRole) => string;
}
