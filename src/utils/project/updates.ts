
import { Project, ProjectStatus, AuditLogEvent } from '../../types/project';
import { calculateProgressByStatus } from './progress';

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
