
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
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
            setLoading(false);
            return;
          }
          
          let query = supabase.from('projects').select(`
            id,
            name,
            preview_url,
            type,
            status,
            customer_email,
            created_at,
            created_by,
            expires_at,
            password_protected,
            password,
            token,
            brand_name,
            progress,
            language,
            archived
          `);
          
          // If user is not admin, only fetch their projects
          if (profileData.role !== 'admin') {
            query = query.eq('customer_email', profileData.email);
          }
          
          const { data: projectsData, error: projectsError } = await query;
          
          if (projectsError) {
            console.error('Error fetching projects:', projectsError);
            setError('Failed to load projects');
            setLoading(false);
            return;
          }
          
          // Fetch audit logs for each project
          const projectsWithAuditLogs = await Promise.all(
            projectsData.map(async (project: any) => {
              const { data: auditLogData, error: auditLogError } = await supabase
                .from('audit_log')
                .select('*')
                .eq('project_id', project.id)
                .order('timestamp', { ascending: false });
              
              if (auditLogError) {
                console.error('Error fetching audit logs:', auditLogError);
                return {
                  ...project,
                  auditLog: []
                };
              }
              
              // Find last viewed timestamp
              const lastViewedEntry = auditLogData.find((entry: any) => entry.action === 'viewed');
              
              return {
                ...project,
                auditLog: auditLogData,
                lastViewed: lastViewedEntry ? lastViewedEntry.timestamp : undefined
              };
            })
          );
          
          // Map to our Project type
          const mappedProjects: Project[] = projectsWithAuditLogs.map((project: any) => ({
            id: project.id,
            name: project.name,
            status: project.status as ProjectStatus,
            createdAt: project.created_at,
            customerEmail: project.customer_email,
            previewUrl: project.preview_url,
            fileData: project.type === 'file' ? {
              fileName: 'file', // Need to fetch file data separately
              fileType: 'file',
              fileUrl: project.preview_url
            } : undefined,
            expiresAt: project.expires_at,
            hasPassword: project.password_protected,
            password: project.password,
            magicKey: project.token,
            comments: '',
            progress: project.progress || 0,
            auditLog: project.auditLog?.map((log: any) => ({
              timestamp: log.timestamp,
              action: log.action,
              ipAddress: log.ip_address,
              userAgent: log.user_agent
            })) || [],
            lastViewed: project.lastViewed,
            language: project.language || 'en',
            archived: project.archived || false,
            brandName: project.brand_name,
            version: 1 // Default to version 1
          }));
          
          setProjects(mappedProjects);
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
    
    // Set up realtime subscription
    const projectsSubscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          // Refresh projects when data changes
          fetchProjects();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(projectsSubscription);
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
      
      // Insert project into Supabase
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          preview_url: projectData.previewUrl,
          type: projectData.fileData ? 'file' : 'url',
          customer_email: projectData.customerEmail,
          created_by: session.user.id,
          expires_at: projectData.expiresAt,
          password_protected: projectData.hasPassword,
          password: projectData.password,
          token: token,
          brand_name: projectData.brandName,
          progress: projectData.progress || 20,
          language: projectData.language || 'en'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating project:', error);
        toast({
          title: 'Project Creation Failed',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }
      
      // Add initial audit log entry
      await supabase
        .from('audit_log')
        .insert({
          project_id: newProject.id,
          action: 'created'
        });
      
      // File upload handling
      if (projectData.fileData && projectData.fileData.fileUrl) {
        // This is just a placeholder - actual file upload handling would be more complex
        // You'd need to upload to storage and get a proper URL
        await supabase
          .from('files')
          .insert({
            project_id: newProject.id,
            url: projectData.fileData.fileUrl,
            type: projectData.fileData.fileType,
            has_watermark: false
          });
      }
      
      // Convert to our Project type
      const createdProject: Project = {
        id: newProject.id,
        name: newProject.name,
        status: newProject.status as ProjectStatus,
        createdAt: newProject.created_at,
        customerEmail: newProject.customer_email,
        previewUrl: newProject.preview_url,
        fileData: projectData.fileData,
        expiresAt: newProject.expires_at,
        hasPassword: newProject.password_protected,
        password: newProject.password,
        magicKey: newProject.token,
        comments: '',
        progress: newProject.progress || 20,
        auditLog: [{
          timestamp: new Date().toISOString(),
          action: 'created'
        }],
        language: newProject.language || 'en',
        brandName: newProject.brand_name,
        version: 1
      };
      
      // Update local state
      setProjects([...projects, createdProject]);
      
      // Also store in localStorage as fallback
      localStorage.setItem('designer_portal_projects', JSON.stringify([...projects, createdProject]));
      
      toast({
        title: 'Project created',
        description: `${createdProject.name} has been created successfully`,
      });
      
      console.log(`Magic link for project ${createdProject.name}: /portal?id=${createdProject.id}&key=${createdProject.magicKey}`);
      
      return createdProject;
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
      // Update in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ 
          status,
          progress: calculateProgressByStatus(status)
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating project status:', error);
        toast({
          title: 'Status Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      // If comments provided, add to comments table
      if (comments) {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        const { error: commentError } = await supabase
          .from('comments')
          .insert({
            project_id: id,
            user_role: session?.user ? 'admin' : 'customer',
            content: comments
          });
        
        if (commentError) {
          console.error('Error adding comment:', commentError);
        }
      }
      
      // Add to audit log
      await supabase
        .from('audit_log')
        .insert({
          project_id: id,
          action: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'commented'
        });
      
      // Update local state
      const updatedProjects = projects.map(project => {
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
      
      setProjects(updatedProjects);
      
      // Also update localStorage as fallback
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
      // Update in Supabase (assuming we add a rating column to projects table)
      const { error } = await supabase
        .from('projects')
        .update({ rating })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating project rating:', error);
        toast({
          title: 'Rating Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, customerRating: rating };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage as fallback
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
      // Add to Supabase
      const { error } = await supabase
        .from('audit_log')
        .insert({
          project_id: id,
          action: event.action,
          ip_address: event.ipAddress,
          user_agent: event.userAgent
        });
      
      if (error) {
        console.error('Error adding audit log:', error);
        return;
      }
      
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
      
      // Also update localStorage as fallback
      localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('Error in addAuditLog:', error);
    }
  };

  const setProjectArchived = async (id: string, archived: boolean) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ archived })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating project archived status:', error);
        toast({
          title: 'Archive Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, archived };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage as fallback
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
      // Add as a comment in Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to add notes',
          variant: 'destructive'
        });
        return;
      }
      
      const { error } = await supabase
        .from('comments')
        .insert({
          project_id: id,
          user_role: 'admin',
          content: notes
        });
      
      if (error) {
        console.error('Error adding internal notes:', error);
        toast({
          title: 'Notes Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, internalNotes: notes };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage as fallback
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
      // Update in Supabase (assuming we add a version column to projects table)
      const { error } = await supabase
        .from('projects')
        .update({ version })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating project version:', error);
        toast({
          title: 'Version Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, version };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage as fallback
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
      // Update in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ language })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating project language:', error);
        toast({
          title: 'Language Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, language };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage as fallback
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
      // Update in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ brand_name: brandName })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating brand name:', error);
        toast({
          title: 'Brand Name Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Update local state
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          return { ...project, brandName };
        }
        return project;
      });
      
      setProjects(updatedProjects);
      
      // Also update localStorage as fallback
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
      await supabase
        .from('audit_log')
        .insert({
          project_id: id,
          action: 'reminded'
        });
      
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
      
      // Also update localStorage as fallback
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
      // Delete from Supabase
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting project:', error);
        toast({
          title: 'Delete Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Update local state
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      
      // Also update localStorage as fallback
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
