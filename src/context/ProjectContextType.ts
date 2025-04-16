
import { Project, ProjectStatus, AuditLogEvent } from '../types/project';

export type ProjectContextType = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'magicKey' | 'auditLog'>) => void;
  getProject: (id: string) => Project | undefined;
  getProjectByIdAndKey: (id: string, key: string) => Project | undefined;
  updateProjectStatus: (id: string, status: ProjectStatus, comments?: string) => void;
  updateProjectRating: (id: string, rating: 1 | 2 | 3 | 4 | 5) => void;
  addAuditLog: (id: string, event: Omit<AuditLogEvent, 'timestamp'>) => void;
  setProjectArchived: (id: string, archived: boolean) => void;
  updateInternalNotes: (id: string, notes: string) => void;
  updateProjectVersion: (id: string, version: number) => void;
  updateProjectLanguage: (id: string, language: 'en' | 'de') => void;
  sendReminderEmail: (id: string) => Promise<boolean>;
  deleteProject: (id: string) => void;
};
