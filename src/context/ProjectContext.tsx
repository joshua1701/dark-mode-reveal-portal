
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Project, ProjectStatus } from '@/types/project';
import { ProjectContextType } from './ProjectContextType';
import { mockProjects } from '@/data/mockProjects';
import { 
  generateProjectId, 
  generateMagicKey, 
  getProjectById, 
  getProjectByIdAndKey as getProjectByIdAndKeyUtil,
  updateProjectStatus as updateProjectStatusUtil,
  updateProjectRating as updateProjectRatingUtil
} from '@/utils/projectUtils';

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

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'status' | 'magicKey'>) => {
    // Generate a random ID and magicKey
    const newId = generateProjectId();
    const magicKey = generateMagicKey();
    
    const newProject: Project = {
      ...projectData,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      magicKey,
      progress: projectData.progress || 70 // Default to 70% if not provided
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
    
    toast({
      title: 'Project created',
      description: `${newProject.name} has been created successfully`,
    });
    
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
    localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
    
    const statusText = status === 'approved' ? 'approved' : 'rejected';
    toast({
      title: `Project ${statusText}`,
      description: `The project has been ${statusText} successfully`,
      variant: status === 'approved' ? 'default' : 'destructive',
    });
  };

  const updateProjectRating = (id: string, rating: 1 | 2 | 3 | 4 | 5) => {
    const updatedProjects = updateProjectRatingUtil(projects, id, rating);
    
    setProjects(updatedProjects);
    localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
    
    toast({
      title: 'Rating submitted',
      description: 'Thank you for your feedback!',
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
        updateProjectRating
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
