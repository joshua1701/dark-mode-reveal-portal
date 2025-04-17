
import { Project } from '../../types/project';

// Get a project by ID
export const getProjectById = (projects: Project[], id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

// Get a project by ID and key
export const getProjectByIdAndKey = (projects: Project[], id: string, key: string): Project | undefined => {
  return projects.find(project => project.id === id && project.magicKey === key);
};

// Get projects for a specific customer
export const getProjectsForCustomer = (
  projects: Project[],
  customerEmail: string
): Project[] => {
  return projects.filter(project => 
    project.customerEmail === customerEmail && !project.archived
  );
};

// Filter projects by status
export const filterProjectsByStatus = (
  projects: Project[],
  status: Project['status'] | 'all'
): Project[] => {
  if (status === 'all') return projects;
  return projects.filter(project => project.status === status);
};

// Search projects by name or brand
export const searchProjects = (
  projects: Project[],
  searchTerm: string
): Project[] => {
  const term = searchTerm.toLowerCase();
  return projects.filter(project => 
    project.name.toLowerCase().includes(term) || 
    (project.brandName && project.brandName.toLowerCase().includes(term))
  );
};
