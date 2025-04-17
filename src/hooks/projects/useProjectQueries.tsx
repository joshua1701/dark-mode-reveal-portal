
import { Project } from '@/types/project';
import { getProjectById, getProjectByIdAndKey as getProjectByIdAndKeyUtil } from '@/utils/project';

export const useProjectQueries = (projects: Project[]) => {
  const getProject = (id: string) => {
    return getProjectById(projects, id);
  };

  const getProjectByIdAndKey = (id: string, key: string) => {
    const project = getProjectByIdAndKeyUtil(projects, id, key);
    console.log("Looking up project with ID:", id, "and key:", key);
    console.log("Found project:", project);
    return project;
  };

  return {
    getProject,
    getProjectByIdAndKey
  };
};
