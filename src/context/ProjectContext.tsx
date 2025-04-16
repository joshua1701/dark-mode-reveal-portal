
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Project, ProjectStatus, AuditLogEvent } from '@/types/project';
import { ProjectContextType } from './ProjectContextType';
import { mockProjects } from '@/data/mockProjects';
import { 
  generateProjectId, 
  generateMagicKey, 
  getProjectById, 
  getProjectByIdAndKey as getProjectByIdAndKeyUtil,
  updateProjectStatus as updateProjectStatusUtil,
  updateProjectRating as updateProjectRatingUtil,
  addAuditLogEntry,
  setProjectArchived as setProjectArchivedUtil,
  updateInternalNotes as updateInternalNotesUtil,
  updateProjectVersion as updateProjectVersionUtil,
  updateProjectLanguage as updateProjectLanguageUtil,
  deleteProject as deleteProjectUtil
} from '@/utils/projectUtils';
import { 
  sendProjectNotification, 
  sendReminderEmail as sendReminderEmailUtil 
} from '@/utils/emailService';

// Create the context with undefined as initial value
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch projects
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Load projects from localStorage or use mock data
        const savedProjects = localStorage.getItem('designer_portal_projects');
        if (savedProjects) {
          setProjects(JSON.parse(savedProjects));
        } else {
          setProjects(mockProjects);
          localStorage.setItem('designer_portal_projects', JSON.stringify(mockProjects));
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Helper function to update localStorage
  const updateLocalStorage = (updatedProjects: Project[]) => {
    localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'status' | 'magicKey' | 'auditLog'>) => {
    // Generate a random ID and magicKey
    const newId = generateProjectId();
    const magicKey = generateMagicKey();
    
    const newProject: Project = {
      ...projectData,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      magicKey,
      progress: projectData.progress || 20, // Default to 20% for pending status
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
    
    // Send email notification
    const language = newProject.language || 'en';
    sendProjectNotification(newProject, language);
    
    // In a real app, this would send an email with the magic link
    console.log(`Magic link for project ${newProject.name}: /portal?id=${newId}&key=${magicKey}`);
    
    return newProject;
  };

  const getProject = (id: string) => {
    return getProjectById(projects, id);
  };

  const getProjectByIdAndKey = (id: string, key: string) => {
    return getProjectByIdAndKeyUtil(projects, id, key);
  };

  const updateProjectStatus = (id: string, status: ProjectStatus, comments?: string) => {
    const updatedProjects = updateProjectStatusUtil(projects, id, status, comments);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    const statusText = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : status;
    toast({
      title: `Project ${statusText}`,
      description: `The project has been ${statusText} successfully`,
      variant: status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'default',
    });
  };

  const updateProjectRating = (id: string, rating: 1 | 2 | 3 | 4 | 5) => {
    const updatedProjects = updateProjectRatingUtil(projects, id, rating);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Rating submitted',
      description: 'Thank you for your feedback!',
    });
  };

  const addAuditLog = (id: string, event: Omit<AuditLogEvent, 'timestamp'>) => {
    const updatedProjects = addAuditLogEntry(projects, id, event);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
  };

  const setProjectArchived = (id: string, archived: boolean) => {
    const updatedProjects = setProjectArchivedUtil(projects, id, archived);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: archived ? 'Project archived' : 'Project restored',
      description: archived 
        ? 'The project has been moved to archives' 
        : 'The project has been restored from archives',
    });
  };

  const updateInternalNotes = (id: string, notes: string) => {
    const updatedProjects = updateInternalNotesUtil(projects, id, notes);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Notes updated',
      description: 'Internal notes have been saved',
    });
  };

  const updateProjectVersion = (id: string, version: number) => {
    const updatedProjects = updateProjectVersionUtil(projects, id, version);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Version updated',
      description: `Project version set to v${version}`,
    });
  };

  const updateProjectLanguage = (id: string, language: 'en' | 'de') => {
    const updatedProjects = updateProjectLanguageUtil(projects, id, language);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Language updated',
      description: `Project language set to ${language === 'en' ? 'English' : 'German'}`,
    });
  };

  const sendReminderEmail = async (id: string): Promise<boolean> => {
    const project = getProject(id);
    if (!project) return false;
    
    const language = project.language || 'en';
    const success = await sendReminderEmailUtil(project, language);
    
    if (success) {
      // Add audit log entry for the reminder
      const updatedProjects = addAuditLogEntry(projects, id, { action: 'reminded' });
      setProjects(updatedProjects);
      updateLocalStorage(updatedProjects);
    }
    
    return success;
  };

  const deleteProject = (id: string) => {
    const updatedProjects = deleteProjectUtil(projects, id);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Project deleted',
      description: 'The project has been permanently deleted',
      variant: 'destructive',
    });
  };

  return (
    <ProjectContext.Provider 
      value={{ 
        projects, 
        loading, 
        error, 
        addProject, 
        getProject, 
        getProjectByIdAndKey,
        updateProjectStatus,
        updateProjectRating,
        addAuditLog,
        setProjectArchived,
        updateInternalNotes,
        updateProjectVersion,
        updateProjectLanguage,
        sendReminderEmail,
        deleteProject
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

// Re-export types for convenience
export { type Project, type ProjectStatus } from '@/types/project';
