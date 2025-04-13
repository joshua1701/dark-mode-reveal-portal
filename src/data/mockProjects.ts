
import { Project } from '../types/project';

// Mock projects
export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Acme Corporation Website',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    customerEmail: 'contact@acme.com',
    previewUrl: 'https://example.com/acme-preview',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    hasPassword: false,
    magicKey: 'secret-key-001',
    progress: 70
  },
  {
    id: 'proj-002',
    name: 'Global Tech Redesign',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    customerEmail: 'manager@globaltech.com',
    previewUrl: 'https://example.com/globaltech-preview',
    expiresAt: null,
    hasPassword: true,
    password: '1234',
    magicKey: 'secret-key-002',
    comments: 'Looks great! Approved for launch.',
    customerRating: 5,
    progress: 100
  },
  {
    id: 'proj-003',
    name: 'Sunshine Bakery E-commerce',
    status: 'rejected',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    customerEmail: 'owner@sunshinebakery.com',
    previewUrl: 'https://example.com/sunshine-preview',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    hasPassword: false,
    magicKey: 'secret-key-003',
    comments: 'We need to revise the color scheme. Too bright for our brand.',
    customerRating: 2,
    progress: 60
  },
  {
    id: 'proj-004',
    name: 'Cogswell Logo Design',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    customerEmail: 'marketing@cogswell.com',
    previewUrl: '',
    fileData: {
      fileName: 'cogswell-logo.png',
      fileType: 'image/png',
      fileUrl: '/lovable-uploads/c396cd61-c7de-47be-b58c-edff18e58dbf.png',
      watermarkedUrl: '/lovable-uploads/c396cd61-c7de-47be-b58c-edff18e58dbf.png'
    },
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    hasPassword: true,
    password: '5678',
    magicKey: 'secret-key-004',
    progress: 85
  }
];
