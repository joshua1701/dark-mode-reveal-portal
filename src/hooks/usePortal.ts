import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProjects, Project, ProjectStatus } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

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

export const usePortal = () => {
  const { projects, getProjectByIdAndKey, updateProjectStatus, updateProjectRating, addAuditLog } = useProjects();
  const { verifyMagicLink, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [project, setProject] = useState<Project | null>(null);
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [zoom, setZoom] = useState(1);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [isExpired, setIsExpired] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkErrorDetails, setLinkErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const key = params.get('key');
    
    const loadProject = async () => {
      console.log("URL parameters:", { id, key });
      console.log("Projects context loaded:", projects.length > 0 ? "Yes" : "No");
      
      if (!id || !key) {
        setIsVerifying(false);
        setIsTokenModalOpen(true);
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
        setLanguage(foundProject.language || 'en');
        
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
          setIsPasswordModalOpen(true);
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
  }, [location.search, getProjectByIdAndKey, verifyMagicLink, navigate, addAuditLog, projects]);
  
  const handlePasswordSubmit = () => {
    if (!project) return;
    
    if (password === project.password) {
      setIsPasswordModalOpen(false);
      setIsVerified(true);
      setPasswordError('');
    } else {
      setPasswordError(language === 'en' ? 
        'Incorrect password. Please try again.' : 
        'Falsches Passwort. Bitte versuchen Sie es erneut.');
    }
  };

  const handleTokenSubmit = async () => {
    const parts = token.trim().split(':');
    if (parts.length !== 2) {
      setTokenError(language === 'en' ? 
        'Invalid token format. Please try again.' : 
        'Ungültiges Token-Format. Bitte versuchen Sie es erneut.');
      return;
    }

    const [id, key] = parts;
    const isValid = await verifyMagicLink(id, key);

    if (isValid) {
      navigate(`/portal?id=${id}&key=${key}`);
    } else {
      setTokenError(language === 'en' ? 
        'Invalid token. Please try again.' : 
        'Ungültiger Token. Bitte versuchen Sie es erneut.');
    }
  };
  
  const handleCopyLink = () => {
    if (!project) return;
    
    navigator.clipboard.writeText(project.previewUrl);
    toast({
      title: language === 'en' ? 'Link copied' : 'Link kopiert',
      description: language === 'en' ? 
        'Preview URL has been copied to clipboard' : 
        'Vorschau-URL wurde in die Zwischenablage kopiert',
    });
  };
  
  const handleStatusChange = (status: ProjectStatus) => {
    if (!project) return;
    
    if (status === 'rejected') {
      setIsRejectModalOpen(true);
    } else {
      setShowRatingModal(true);
    }
  };
  
  const handleReject = () => {
    if (!project || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      updateProjectStatus(project.id, 'rejected', rejectionReason);
      
      toast({
        title: language === 'en' ? 'Project Rejected' : 'Projekt abgelehnt',
        description: language === 'en' ? 
          'Feedback has been submitted' : 
          'Feedback wurde übermittelt',
        variant: 'destructive',
      });
      
      setProject({
        ...project,
        status: 'rejected',
        comments: rejectionReason
      });
    } catch (error) {
      console.error('Error rejecting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsRejectModalOpen(false);
    }
  };
  
  const handleRatingSubmit = () => {
    if (!project || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      updateProjectRating(project.id, rating);
      updateProjectStatus(project.id, 'approved');
      
      toast({
        title: language === 'en' ? 'Project Approved' : 'Projekt genehmigt',
        description: language === 'en' ? 
          'Thank you for your approval!' : 
          'Vielen Dank für Ihre Genehmigung!',
      });
      
      setProject({
        ...project,
        status: 'approved',
        customerRating: rating
      });
    } catch (error) {
      console.error('Error approving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowRatingModal(false);
    }
  };
  
  const handleDownload = () => {
    if (!project?.fileData) return;
    
    const link = document.createElement('a');
    link.href = project.fileData.watermarkedUrl || project.fileData.fileUrl;
    link.download = `CogswellShare_${project.fileData.fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: language === 'en' ? 'Download started' : 'Download gestartet',
      description: language === 'en' ? 
        'Your file is being downloaded' : 
        'Ihre Datei wird heruntergeladen',
    });

    addAuditLog(project.id, { action: 'viewed' });
  };
  
  const handleLanguageChange = (newLanguage: 'en' | 'de') => {
    setLanguage(newLanguage);
  };
  
  const handleNavigateHome = () => {
    navigate('/');
  };

  return {
    project,
    viewport,
    setViewport,
    zoom,
    setZoom,
    language,
    handleLanguageChange,
    isVerifying,
    isVerified,
    authLoading,
    linkError,
    linkErrorDetails,
    isExpired,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    password,
    setPassword,
    passwordError,
    handlePasswordSubmit,
    isRejectModalOpen,
    setIsRejectModalOpen,
    rejectionReason,
    setRejectionReason,
    handleReject,
    isSubmitting,
    showRatingModal,
    setShowRatingModal,
    rating,
    setRating,
    handleRatingSubmit,
    isTokenModalOpen,
    setIsTokenModalOpen,
    token,
    setToken,
    tokenError,
    handleTokenSubmit,
    handleStatusChange,
    handleCopyLink,
    handleDownload,
    handleNavigateHome
  };
};
