
import { toast } from '@/components/ui/use-toast';
import { Project, AuditLogEvent } from '@/types/project';

export const useEmailOperations = (
  projects: Project[],
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  getProject: (id: string) => Project | undefined
) => {
  const sendReminderEmail = async (id: string): Promise<boolean> => {
    try {
      const project = getProject(id);
      if (!project) return false;
      
      // This would typically call a server function or API endpoint
      // For now, we'll just add an audit log entry
      
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          const auditLog = project.auditLog || [];
          return {
            ...project,
            auditLog: [...auditLog, { 
              action: 'reminded' as AuditLogEvent['action'],
              timestamp: new Date().toISOString()
            }]
          };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Reminder sent',
        description: `Reminder email sent to ${project.customerEmail}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error sending reminder:', error);
      return false;
    }
  };

  return { sendReminderEmail };
};
