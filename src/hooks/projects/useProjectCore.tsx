
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Project } from '@/types/project';
import { mockProjects } from '@/data/mockProjects';

export const useProjectCore = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
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

  const updateLocalStorage = (updatedProjects: Project[]) => {
    localStorage.setItem('designer_portal_projects', JSON.stringify(updatedProjects));
  };

  return {
    projects,
    setProjects,
    loading,
    error,
    updateLocalStorage
  };
};
