
import { toast } from '@/components/ui/use-toast';
import { Project } from '@/types/project';
import { sendReminderEmail as sendReminderEmailUtil } from '@/utils/email/emailService';
import { addAuditLogEntry } from '@/utils/project';

export const useProjectEmails = (
  projects: Project[],
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  updateLocalStorage: (projects: Project[]) => void,
  getProject: (id: string) => Project | undefined
) => {
  const sendReminderEmail = async (id: string): Promise<boolean> => {
    const project = getProject(id);
    if (!project) return false;
    
    try {
      const language = project.language || 'en';
      const success = await sendReminderEmailUtil(project, language);
      
      if (success) {
        const updatedProjects = addAuditLogEntry(projects, id, { action: 'reminded' });
        setProjects(updatedProjects);
        updateLocalStorage(updatedProjects);
      }
      
      return success;
    } catch (error) {
      console.error("Error sending reminder email:", error);
      
      const updatedProjects = addAuditLogEntry(projects, id, { action: 'reminded' });
      setProjects(updatedProjects);
      updateLocalStorage(updatedProjects);
      
      toast({
        title: 'Reminder Attempted',
        description: 'Reminder function triggered, but email delivery failed.',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  return { sendReminderEmail };
};
