
import React, { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Project, ProjectStatus, AuditLogEvent } from '@/types/project';
import { ProjectContextType } from '@/context/ProjectContextType';
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
  updateBrandName as updateBrandNameUtil,
  deleteProject as deleteProjectUtil
} from '@/utils/project';
import { 
  sendProjectNotification, 
  sendReminderEmail as sendReminderEmailUtil 
} from '@/utils/email/emailService';

export const useProjectProvider = (): ProjectContextType => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
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

  const updateLocalStorage = (updatedProjects: Project[]) => {
    localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
  };

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

  const getProject = (id: string) => {
    return getProjectById(projects, id);
  };

  const getProjectByIdAndKey = (id: string, key: string) => {
    const project = getProjectByIdAndKeyUtil(projects, id, key);
    console.log("Looking up project with ID:", id, "and key:", key);
    console.log("Found project:", project);
    return project;
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

  const updateBrandName = (id: string, brandName: string) => {
    const updatedProjects = updateBrandNameUtil(projects, id, brandName);
    
    setProjects(updatedProjects);
    updateLocalStorage(updatedProjects);
    
    toast({
      title: 'Brand name updated',
      description: `Project brand name set to "${brandName}"`,
    });
  };

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

  return { 
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
    updateBrandName,
    sendReminderEmail,
    deleteProject
  };
};
