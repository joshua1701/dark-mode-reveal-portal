
import { Project, AuditLogEvent } from '@/types/project';

export const useAuditLogOperations = (
  projects: Project[],
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
) => {
  const addAuditLog = async (id: string, event: Omit<AuditLogEvent, 'timestamp'>) => {
    try {
      // Make sure the action is one of the allowed values
      const validAction: AuditLogEvent['action'] = event.action;
      
      // Update local state
      const timestamp = new Date().toISOString();
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          const auditLog = project.auditLog || [];
          const newAuditLogEntry: AuditLogEvent = { 
            ...event, 
            timestamp,
            action: validAction
          };
          
          return {
            ...project,
            auditLog: [...auditLog, newAuditLogEntry],
            lastViewed: event.action === 'viewed' ? timestamp : project.lastViewed
          };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('Error in addAuditLog:', error);
    }
  };

  return { addAuditLog };
};
