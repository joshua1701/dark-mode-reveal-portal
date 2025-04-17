
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectContextType } from './ProjectContextType';
import { Project } from '@/types/project';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import { useAuditLogOperations } from '@/hooks/useAuditLogOperations';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { useEmailOperations } from '@/hooks/useEmailOperations';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize hooks
  const {
    addProject,
    getProject,
    getProjectByIdAndKey,
    updateProjectStatus,
    updateProjectRating
  } = useProjectOperations(projects);

  const { addAuditLog } = useAuditLogOperations(projects, setProjects);

  const {
    setProjectArchived,
    updateInternalNotes,
    updateProjectVersion,
    updateProjectLanguage,
    updateBrandName,
    deleteProject
  } = useProjectManagement(projects, setProjects);

  const { sendReminderEmail } = useEmailOperations(projects, setProjects, getProject);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Retrieve projects from localStorage
        const savedProjects = localStorage.getItem('designer_portal_projects');
        if (savedProjects) {
          setProjects(JSON.parse(savedProjects));
        } else {
          setProjects([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchProjects:', err);
        setError('Failed to load projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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
