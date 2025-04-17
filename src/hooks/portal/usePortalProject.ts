
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

// Helper function to get user IP
const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'unknown';
  }
};

export const usePortalProject = (portalCore: ReturnType<typeof import('./usePortalCore').usePortalCore>) => {
  const { 
    setProject, 
    setIsVerifying, 
    setIsVerified, 
    setIsExpired, 
    setLinkError, 
    setLinkErrorDetails, 
    setIsSubmitting,
    language 
  } = portalCore;
  
  const { projects, getProjectByIdAndKey, updateProjectStatus, updateProjectRating, addAuditLog } = useProjects();
  const { verifyMagicLink, isLoading: authLoading } = useAuth();
  const location = useLocation();

  // Load project on initial render
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const key = params.get('key');
    
    const loadProject = async () => {
      console.log("URL parameters:", { id, key });
      console.log("Projects context loaded:", projects.length > 0 ? "Yes" : "No");
      
      if (!id || !key) {
        setIsVerifying(false);
        return;
      }
      
      try {
        const isValid = await verifyMagicLink(id, key);
        console.log("Magic link verification result:", isValid);
        
        if (!isValid) {
          setIsVerifying(false);
          setLinkError("Invalid or expired link");
          setLinkErrorDetails(`ID: ${id}, Key prefix: ${key.substring(0, 3)}...`);
          toast({
            title: 'Invalid Link',
            description: 'This project link is invalid or expired',
            variant: 'destructive',
          });
          return;
        }
        
        console.log("Projects in context:", projects.length);
        
        const foundProject = getProjectByIdAndKey(id, key);
        
        console.log("Looking for project with id:", id);
        console.log("Looking for project with key:", key);
        console.log("Found project:", foundProject ? "Yes" : "No");
        
        if (!foundProject) {
          setIsVerifying(false);
          setLinkError("Project not found");
          setLinkErrorDetails(
            `Project not found in database.\nProjects available: ${projects.length}\nID: ${id}\nKey prefix: ${key.substring(0, 3)}...`
          );
          toast({
            title: 'Project Not Found',
            description: 'The requested project could not be found. Please check your link.',
            variant: 'destructive',
          });
          return;
        }
        
        if (foundProject.expiresAt) {
          const expiryDate = new Date(foundProject.expiresAt);
          if (expiryDate < new Date()) {
            setIsExpired(true);
          }
        }
        
        setProject(foundProject);
        
        try {
          const ipAddress = await getUserIP();
          const userAgent = navigator.userAgent;
          
          addAuditLog(foundProject.id, {
            action: 'viewed',
            ipAddress,
            userAgent
          });
        } catch (error) {
          console.error('Failed to log view:', error);
        }
        
        if (foundProject.hasPassword) {
          // Let the password modal handle this
        } else {
          setIsVerified(true);
        }
        
        setIsVerifying(false);
      } catch (error) {
        console.error('Error loading project:', error);
        setLinkError("Error loading project");
        setLinkErrorDetails(error instanceof Error ? error.message : String(error));
        setIsVerifying(false);
      }
    };
    
    loadProject();
  }, [location.search, getProjectByIdAndKey, verifyMagicLink, projects, 
      addAuditLog, setIsVerifying, setLinkError, setLinkErrorDetails, 
      setProject, setIsExpired, setIsVerified]);

  const handleCopyLink = () => {
    if (!portalCore.project) return;
    
    navigator.clipboard.writeText(portalCore.project.previewUrl);
    toast({
      title: language === 'en' ? 'Link copied' : 'Link kopiert',
      description: language === 'en' ? 
        'Preview URL has been copied to clipboard' : 
        'Vorschau-URL wurde in die Zwischenablage kopiert',
    });
  };

  const handleDownload = () => {
    if (!portalCore.project?.fileData) return;
    
    const link = document.createElement('a');
    link.href = portalCore.project.fileData.watermarkedUrl || portalCore.project.fileData.fileUrl;
    link.download = `CogswellShare_${portalCore.project.fileData.fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: language === 'en' ? 'Download started' : 'Download gestartet',
      description: language === 'en' ? 
        'Your file is being downloaded' : 
        'Ihre Datei wird heruntergeladen',
    });

    if (portalCore.project) {
      addAuditLog(portalCore.project.id, { action: 'viewed' });
    }
  };

  return {
    authLoading,
    handleCopyLink,
    handleDownload,
  };
};
