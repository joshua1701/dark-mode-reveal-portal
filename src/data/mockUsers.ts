
import { User } from '@/types/project';

// Define the admin users
export const mockUser: User = {
  id: 'admin-1',
  username: 'Admin User',
  email: 'admin@cogswell.de',
  role: 'admin',
  createdAt: new Date().toISOString()
};

export const joshuaUser: User = {
  id: 'admin-2',
  username: 'Joshua',
  email: 'joshua@cogswell.de',
  role: 'admin',
  createdAt: new Date().toISOString()
};

// New admin user with credits
export const creditsAdmin: User = {
  id: 'admin-3',
  username: 'Credits Admin',
  email: 'credits@cogswell.de',
  role: 'admin',
  createdAt: new Date().toISOString()
};

// Default users array
export const defaultUsers: User[] = [
  mockUser,
  joshuaUser,
  creditsAdmin,
  {
    id: 'customer-1',
    username: 'Customer User',
    email: 'customer@example.com',
    role: 'customer',
    createdAt: new Date().toISOString()
  }
];
