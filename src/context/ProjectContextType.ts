
import { Project, ProjectStatus } from '../types/project';

export type ProjectContextType = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'magicKey'>) => void;
  getProject: (id: string) => Project | undefined;
  getProjectByIdAndKey: (id: string, key: string) => Project | undefined;
  updateProjectStatus: (id: string, status: ProjectStatus, comments?: string) => void;
  updateProjectRating: (id: string, rating: 1 | 2 | 3 | 4 | 5) => void;
};
