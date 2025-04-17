
import { Project, ProjectStatus, AuditLogEvent } from '@/types/project';

// Helper function to generate a random token
export const generateToken = (): string => {
  return `key-${Math.random().toString(36).substring(2, 12)}`;
};

// Calculate progress based on status
export const calculateProgressByStatus = (status: ProjectStatus, currentProgress?: number): number => {
  switch (status) {
    case 'pending':
      return 20;
    case 'in-review':
      return 40;
    case 'final':
      return 80;
    case 'approved':
      return 100;
    case 'rejected':
      return currentProgress || 50;
    default:
      return currentProgress || 20;
  }
};
