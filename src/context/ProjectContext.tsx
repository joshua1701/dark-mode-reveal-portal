
import React, { createContext, useContext } from 'react';
import { useProjectProvider } from '@/hooks/useProjectProvider';
import { ProjectContextType } from './ProjectContextType';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const projectContextValue = useProjectProvider();
  
  return (
    <ProjectContext.Provider value={projectContextValue}>
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
