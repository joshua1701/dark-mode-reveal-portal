
import { Project, ProjectStatus, AuditLogEvent } from '../types/project';

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
        progress: calculateProgressByStatus(status, project.progress)
      };
    }
    return project;
  });
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

// Add audit log entry
export const addAuditLogEntry = (
  projects: Project[],
  id: string,
  event: Omit<AuditLogEvent, 'timestamp'>
): Project[] => {
  return projects.map(project => {
    if (project.id === id) {
      const timestamp = new Date().toISOString();
      const auditLog = project.auditLog || [];
      
      return {
        ...project,
        auditLog: [...auditLog, { ...event, timestamp }],
        lastViewed: event.action === 'viewed' ? timestamp : project.lastViewed
      };
    }
    return project;
  });
};

// Set project archived status
export const setProjectArchived = (
  projects: Project[],
  id: string,
  archived: boolean
): Project[] => {
  return projects.map(project => {
    if (project.id === id) {
      return { ...project, archived };
    }
    return project;
  });
};

// Update internal notes
export const updateInternalNotes = (
  projects: Project[],
  id: string,
  notes: string
): Project[] => {
  return projects.map(project => {
    if (project.id === id) {
      return { ...project, internalNotes: notes };
    }
    return project;
  });
};

// Update project version
export const updateProjectVersion = (
  projects: Project[],
  id: string,
  version: number
): Project[] => {
  return projects.map(project => {
    if (project.id === id) {
      return { ...project, version };
    }
    return project;
  });
};

// Update project language
export const updateProjectLanguage = (
  projects: Project[],
  id: string,
  language: 'en' | 'de'
): Project[] => {
  return projects.map(project => {
    if (project.id === id) {
      return { ...project, language };
    }
    return project;
  });
};

// Update brand name
export const updateBrandName = (
  projects: Project[],
  id: string,
  brandName: string
): Project[] => {
  return projects.map(project => {
    if (project.id === id) {
      return { ...project, brandName };
    }
    return project;
  });
};

// Delete a project
export const deleteProject = (
  projects: Project[],
  id: string
): Project[] => {
  return projects.filter(project => project.id !== id);
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
  status: ProjectStatus | 'all'
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
