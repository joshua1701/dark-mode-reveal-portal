
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export type ProjectStatus = 'pending' | 'approved' | 'rejected';

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  customerEmail: string;
  previewUrl: string;
  expiresAt: string | null;
  hasPassword: boolean;
  password?: string;
  magicKey: string;
  comments?: string;
};

type ProjectContextType = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'magicKey'>) => void;
  getProject: (id: string) => Project | undefined;
  getProjectByIdAndKey: (id: string, key: string) => Project | undefined;
  updateProjectStatus: (id: string, status: ProjectStatus, comments?: string) => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Mock projects
const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Acme Corporation Website',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    customerEmail: 'contact@acme.com',
    previewUrl: 'https://example.com/acme-preview',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    hasPassword: false,
    magicKey: 'secret-key-001'
  },
  {
    id: 'proj-002',
    name: 'Global Tech Redesign',
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    customerEmail: 'manager@globaltech.com',
    previewUrl: 'https://example.com/globaltech-preview',
    expiresAt: null,
    hasPassword: true,
    password: '1234',
    magicKey: 'secret-key-002',
    comments: 'Looks great! Approved for launch.'
  },
  {
    id: 'proj-003',
    name: 'Sunshine Bakery E-commerce',
    status: 'rejected',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    customerEmail: 'owner@sunshinebakery.com',
    previewUrl: 'https://example.com/sunshine-preview',
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    hasPassword: false,
    magicKey: 'secret-key-003',
    comments: 'We need to revise the color scheme. Too bright for our brand.'
  }
];

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
    const newId = `proj-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const magicKey = `key-${Math.random().toString(36).substring(2, 12)}`;
    
    const newProject: Project = {
      ...projectData,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      magicKey
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
    return projects.find(project => project.id === id);
  };

  const getProjectByIdAndKey = (id: string, key: string) => {
    return projects.find(project => project.id === id && project.magicKey === key);
  };

  const updateProjectStatus = (id: string, status: ProjectStatus, comments?: string) => {
    const updatedProjects = projects.map(project => {
      if (project.id === id) {
        return { ...project, status, comments: comments || project.comments };
      }
      return project;
    });
    
    setProjects(updatedProjects);
    localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
    
    const statusText = status === 'approved' ? 'approved' : 'rejected';
    toast({
      title: `Project ${statusText}`,
      description: `The project has been ${statusText} successfully`,
      variant: status === 'approved' ? 'default' : 'destructive',
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
        updateProjectStatus 
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
