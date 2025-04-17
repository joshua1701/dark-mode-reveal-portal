
import { Project } from '@/types/project';
import { getProjectById, getProjectByIdAndKey as getProjectByIdAndKeyUtil } from '@/utils/project';

export const useProjectQueries = (projects: Project[]) => {
  const getProject = (id: string) => {
    console.log("Looking up project with ID:", id);
    console.log("Available projects:", projects.length);
    
    // Case-insensitive matching for more reliable lookup
    const project = projects.find(p => p.id.toLowerCase() === id.toLowerCase()) || 
                    getProjectById(projects, id);
    
    console.log("Found project:", project ? "Yes" : "No");
    
    if (!project && projects.length > 0) {
      // Log some project IDs for debugging
      console.log("Sample of available project IDs:", 
        projects.slice(0, 3).map(p => p.id)
      );
    }
    
    return project;
  };

  const getProjectByIdAndKey = (id: string, key: string) => {
    console.log("Looking up project with ID:", id, "and key:", key);
    console.log("Available projects:", projects.length);
    
    // Add more robust error handling and logging
    if (!id || !key) {
      console.error("Missing required parameters for project lookup:", { id, key });
      return undefined;
    }
    
    // Make project lookup case-insensitive for better reliability
    const project = projects.find(
      p => p.id.toLowerCase() === id.toLowerCase() && 
           p.magicKey.toLowerCase() === key.toLowerCase()
    );
    
    console.log("Found project:", project ? "Yes" : "No");
    if (!project) {
      // Log project keys for debugging
      console.log("All project IDs:", projects.map(p => p.id));
    }
    
    return project;
  };

  return {
    getProject,
    getProjectByIdAndKey
  };
};
