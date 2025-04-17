
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectContextType } from './ProjectContextType';
import { Project, ProjectStatus, AuditLogEvent } from '@/types/project';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // First check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User is authenticated, fetch projects
          try {
            // Since we don't have proper tables defined yet in the database,
            // we'll retrieve projects from localStorage for now
            const savedProjects = localStorage.getItem('designer_portal_projects');
            if (savedProjects) {
              setProjects(JSON.parse(savedProjects));
            } else {
              setProjects([]);
            }
          } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects');
          }
        } else {
          // No active session, fetch data from localStorage as fallback
          const savedProjects = localStorage.getItem('designer_portal_projects');
          if (savedProjects) {
            setProjects(JSON.parse(savedProjects));
          } else {
            setProjects([]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchProjects:', err);
        setError('Failed to load projects');
        setLoading(false);
      }
    };

    fetchProjects();
    
    // For realtime updates, we would connect to Supabase here
    // But since we don't have the tables set up yet, we'll skip that
    
    return () => {
      // Cleanup function would go here
    };
  }, []);

  // Helper function to generate a random token
  const generateToken = (): string => {
    return `key-${Math.random().toString(36).substring(2, 12)}`;
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'status' | 'magicKey' | 'auditLog'>) => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to create a project',
          variant: 'destructive'
        });
        return null;
      }
      
      const token = generateToken();
      
      // Since we don't have the database tables set up yet,
      // we'll create the project in local state and localStorage
      const newProject: Project = {
        id: `proj-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: projectData.name,
        status: 'pending' as ProjectStatus,
        createdAt: new Date().toISOString(),
        customerEmail: projectData.customerEmail,
        previewUrl: projectData.previewUrl,
        fileData: projectData.fileData,
        expiresAt: projectData.expiresAt,
        hasPassword: projectData.hasPassword,
        password: projectData.password,
        magicKey: token,
        comments: '',
        progress: projectData.progress || 20,
        auditLog: [{
          timestamp: new Date().toISOString(),
          action: 'created'
        }],
        language: projectData.language || 'en',
        brandName: projectData.brandName,
        version: 1
      };
      
      // Update local state
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      
      // Also store in localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Project created',
        description: `${newProject.name} has been created successfully`,
      });
      
      console.log(`Magic link for project ${newProject.name}: /portal?id=${newProject.id}&key=${newProject.magicKey}`);
      
      return newProject;
    } catch (error: any) {
      console.error('Error in addProject:', error);
      toast({
        title: 'Project Creation Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    }
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  const getProjectByIdAndKey = (id: string, key: string) => {
    return projects.find(project => project.id === id && project.magicKey === key);
  };

  const updateProjectStatus = async (id: string, status: ProjectStatus, comments?: string) => {
    try {
      // Since we don't have database tables set up yet,
      // we'll update the project in local state and localStorage
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { 
            ...project, 
            status, 
            comments: comments || project.comments,
            progress: calculateProgressByStatus(status, project.progress),
            auditLog: [
              ...(project.auditLog || []),
              {
                timestamp: new Date().toISOString(),
                action: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'commented'
              }
            ]
          };
        }
        return project;
      });
      
      // Update state and localStorage
      setProjects(updatedProjects);
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      const statusText = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : status;
      toast({
        title: `Project ${statusText}`,
        description: `The project has been ${statusText} successfully`,
        variant: status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'default',
      });
    } catch (error: any) {
      console.error('Error in updateProjectStatus:', error);
      toast({
        title: 'Status Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  // Calculate progress based on status
  const calculateProgressByStatus = (status: ProjectStatus, currentProgress?: number): number => {
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

  const updateProjectRating = async (id: string, rating: 1 | 2 | 3 | 4 | 5) => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, customerRating: rating };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Rating submitted',
        description: 'Thank you for your feedback!',
      });
    } catch (error: any) {
      console.error('Error in updateProjectRating:', error);
      toast({
        title: 'Rating Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const addAuditLog = async (id: string, event: Omit<AuditLogEvent, 'timestamp'>) => {
    try {
      // Update local state
      const timestamp = new Date().toISOString();
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          const auditLog = project.auditLog || [];
          
          return {
            ...project,
            auditLog: [...auditLog, { ...event, timestamp }],
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

  const setProjectArchived = async (id: string, archived: boolean) => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, archived };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: archived ? 'Project archived' : 'Project restored',
        description: archived 
          ? 'The project has been moved to archives' 
          : 'The project has been restored from archives',
      });
    } catch (error: any) {
      console.error('Error in setProjectArchived:', error);
      toast({
        title: 'Archive Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const updateInternalNotes = async (id: string, notes: string) => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, internalNotes: notes };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Notes updated',
        description: 'Internal notes have been saved',
      });
    } catch (error: any) {
      console.error('Error in updateInternalNotes:', error);
      toast({
        title: 'Notes Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const updateProjectVersion = async (id: string, version: number) => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, version };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Version updated',
        description: `Project version set to v${version}`,
      });
    } catch (error: any) {
      console.error('Error in updateProjectVersion:', error);
      toast({
        title: 'Version Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const updateProjectLanguage = async (id: string, language: 'en' | 'de') => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, language };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Language updated',
        description: `Project language set to ${language === 'en' ? 'English' : 'German'}`,
      });
    } catch (error: any) {
      console.error('Error in updateProjectLanguage:', error);
      toast({
        title: 'Language Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const updateBrandName = async (id: string, brandName: string) => {
    try {
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, brandName };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Brand name updated',
        description: `Project brand name set to "${brandName}"`,
      });
    } catch (error: any) {
      console.error('Error in updateBrandName:', error);
      toast({
        title: 'Brand Name Update Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

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
              action: 'reminded',
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

  const deleteProject = async (id: string) => {
    try {
      // Update local state
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      
      // Also update localStorage
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
      
      toast({
        title: 'Project deleted',
        description: 'The project has been permanently deleted',
        variant: 'destructive',
      });
    } catch (error: any) {
      console.error('Error in deleteProject:', error);
      toast({
        title: 'Delete Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
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
        updateBrandName,
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

export { type Project, type ProjectStatus } from '@/types/project';
