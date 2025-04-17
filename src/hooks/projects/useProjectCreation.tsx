
import { toast } from '@/components/ui/use-toast';
import { Project } from '@/types/project';
import { generateProjectId, generateMagicKey } from '@/utils/project';
import { sendProjectNotification } from '@/utils/email/emailService';

export const useProjectCreation = (
  projects: Project[],
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  updateLocalStorage: (projects: Project[]) => void
) => {
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'status' | 'magicKey' | 'auditLog'>): Project => {
    const newId = generateProjectId();
    const magicKey = generateMagicKey();
    
    const newProject: Project = {
      ...projectData,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      magicKey,
      progress: projectData.progress || 20,
      auditLog: [{
        timestamp: new Date().toISOString(),
        action: 'created'
      }],
      version: 1
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Project created',
      description: `${newProject.name} has been created successfully`,
    });
    
    try {
      const language = newProject.language || 'en';
      sendProjectNotification(newProject, language)
        .then(success => {
          if (success) {
            console.log(`Email sent successfully to ${newProject.customerEmail}`);
          } else {
            console.error("Email sending failed silently");
            toast({
              title: 'Email Not Sent',
              description: 'Project created, but notification email delivery failed.',
              variant: 'destructive',
            });
          }
        })
        .catch(err => {
          console.error("Failed to send project notification email:", err);
          toast({
            title: 'Email Not Sent',
            description: 'Project created successfully, but the notification email could not be sent.',
            variant: 'destructive',
          });
        });
    } catch (error) {
      console.error("Error in email service:", error);
    }
    
    console.log(`Project created: ${newProject.name}`);
    console.log(`Magic link for project: ${window.location.origin}/portal?id=${newId}&key=${magicKey}`);
    
    return newProject;
  };

  return { addProject };
};
