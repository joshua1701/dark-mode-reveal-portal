
import { Project, ProjectStatus } from '../types/project';

// Generate a new project ID
export const generateProjectId = (): string => {
  return `proj-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
};

// Generate a magic key for a project
export const generateMagicKey = (): string => {
  return `key-${Math.random().toString(36).substring(2, 12)}`;
};

// Get a project by ID
export const getProjectById = (projects: Project[], id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

// Get a project by ID and key
export const getProjectByIdAndKey = (projects: Project[], id: string, key: string): Project | undefined => {
  return projects.find(project => project.id === id && project.magicKey === key);
};

// Update a project's status and comments
export const updateProjectStatus = (
  projects: Project[], 
  id: string, 
  status: ProjectStatus, 
  comments?: string
): Project[] => {
  return projects.map(project => {
    if (project.id === id) {
      return { 
        ...project, 
        status, 
        comments: comments || project.comments,
        progress: status === 'approved' ? 100 : project.progress
      };
    }
    return project;
  });
};

// Update a project's rating
export const updateProjectRating = (
  projects: Project[], 
  id: string, 
  rating: 1 | 2 | 3 | 4 | 5
): Project[] => {
  return projects.map(project => {
    if (project.id === id) {
      return { ...project, customerRating: rating };
    }
    return project;
  });
};
