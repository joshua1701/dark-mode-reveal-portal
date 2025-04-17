
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Project, ProjectStatus, AuditLogEvent } from '@/types/project';
import { generateToken, calculateProgressByStatus } from '@/utils/projectHelpers';

export const useProjectOperations = (initialProjects: Project[] = []) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'status' | 'magicKey' | 'auditLog'>) => {
    try {
      const token = generateToken();
      
      // Create the project in local state and localStorage
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
          action: 'created' as AuditLogEvent['action']
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
      // Update the project in local state and localStorage
      const updatedProjects = projects.map(project => {
        if (project.id === id) {
          const action: AuditLogEvent['action'] = 
            status === 'approved' ? 'approved' : 
            status === 'rejected' ? 'rejected' : 'commented';
            
          const updatedAuditLog = [
            ...(project.auditLog || []),
            {
              timestamp: new Date().toISOString(),
              action
            } as AuditLogEvent
          ];
          
          return { 
            ...project, 
            status, 
            comments: comments || project.comments,
            progress: calculateProgressByStatus(status, project.progress),
            auditLog: updatedAuditLog
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

  return {
    projects,
    setProjects,
    addProject,
    getProject,
    getProjectByIdAndKey,
    updateProjectStatus,
    updateProjectRating
  };
};
