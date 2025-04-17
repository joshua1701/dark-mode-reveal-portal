
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProjects, Project, ProjectStatus } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Newly created components
import PortalViewport from '@/components/portal/PortalViewport';
import FilePreview from '@/components/portal/FilePreview';
import ProjectSidebar from '@/components/portal/ProjectSidebar';
import ViewportToolbar from '@/components/portal/ViewportToolbar';
import PasswordModal from '@/components/portal/PasswordModal';
import RejectionModal from '@/components/portal/RejectionModal';
import RatingModal from '@/components/portal/RatingModal';
import LanguageSwitcher from '@/components/portal/LanguageSwitcher';
import ExpiryNotice from '@/components/portal/ExpiryNotice';
import UserSettings from '@/components/portal/UserSettings';

// Translation content
const translations = {
  en: {
    projectNotFound: 'Project Not Found',
    invalidLink: 'This project link is invalid or expired',
    returnHome: 'Return Home',
    noPreview: 'No preview available',
    enterToken: 'Enter Your Token',
    tokenPrompt: 'Please enter the token you received by email',
    submit: 'Submit',
    invalidToken: 'Invalid token. Please try again.'
  },
  de: {
    projectNotFound: 'Projekt nicht gefunden',
    invalidLink: 'Dieser Projektlink ist ungültig oder abgelaufen',
    returnHome: 'Zur Startseite',
    noPreview: 'Keine Vorschau verfügbar',
    enterToken: 'Token eingeben',
    tokenPrompt: 'Bitte geben Sie den Token ein, den Sie per E-Mail erhalten haben',
    submit: 'Absenden',
    invalidToken: 'Ungültiger Token. Bitte versuchen Sie es erneut.'
  }
};

// Get user's IP address (in a real app, this would be handled server-side)
const getUserIP = async (): Promise<string> => {
  try {
    // In a production environment, you would use your own backend endpoint
    // This is just for demonstration purposes
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'unknown';
  }
};

const Portal = () => {
  const { projects, getProjectByIdAndKey, updateProjectStatus, updateProjectRating, addAuditLog } = useProjects();
  const { verifyMagicLink, isLoading } = useAuth();
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
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const key = params.get('key');
    
    const loadProject = async () => {
      // If no id or key in the URL, show token input modal
      if (!id || !key) {
        setIsVerifying(false);
        setIsTokenModalOpen(true);
        return;
      }
      
      const isValid = await verifyMagicLink(id, key);
      if (!isValid) {
        setIsVerifying(false);
        toast({
          title: 'Invalid Link',
          description: 'This project link is invalid or expired',
          variant: 'destructive',
        });
        return;
      }
      
      const foundProject = getProjectByIdAndKey(id, key);
      
      // Debug logging to see what's happening
      console.log("Available projects:", projects);
      console.log("Looking for project with id:", id);
      console.log("Looking for project with key:", key);
      console.log("Found project:", foundProject);
      
      if (!foundProject) {
        setIsVerifying(false);
        toast({
          title: 'Project Not Found',
          description: 'The requested project could not be found',
          variant: 'destructive',
        });
        return;
      }
      
      // Check if project is expired
      if (foundProject.expiresAt) {
        const expiryDate = new Date(foundProject.expiresAt);
        if (expiryDate < new Date()) {
          setIsExpired(true);
        }
      }

      setProject(foundProject);
      setLanguage(foundProject.language || 'en');
      
      // Log view in audit log
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
    // Format of the token should be "id:key"
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
      // Redirect to the project page with the id and key
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
    if (!project) return;
    
    updateProjectStatus(project.id, 'rejected', rejectionReason);
    setIsRejectModalOpen(false);
    toast({
      title: language === 'en' ? 'Project Rejected' : 'Projekt abgelehnt',
      description: language === 'en' ? 
        'Feedback has been submitted' : 
        'Feedback wurde übermittelt',
      variant: 'destructive',
    });
  };
  
  const handleRatingSubmit = () => {
    if (!project) return;
    
    updateProjectRating(project.id, rating);
    updateProjectStatus(project.id, 'approved');
    setShowRatingModal(false);
    
    toast({
      title: language === 'en' ? 'Project Approved' : 'Projekt genehmigt',
      description: language === 'en' ? 
        'Thank you for your approval!' : 
        'Vielen Dank für Ihre Genehmigung!',
    });
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

    // Log download in audit log
    addAuditLog(project.id, { action: 'viewed' });
  };
  
  const handleLanguageChange = (newLanguage: 'en' | 'de') => {
    setLanguage(newLanguage);
  };
  
  const t = translations[language];
  
  if (isLoading || isVerifying) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-designer-background">
        <img 
          src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
          alt="CogswellShare" 
          className="h-16 mb-6"
        />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Token input modal
  if (isTokenModalOpen) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-designer-background text-white">
        <img 
          src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
          alt="CogswellShare" 
          className="h-16 mb-6"
        />
        <div className="w-full max-w-md p-6 bg-black/80 border border-white/10 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-center">{t.enterToken}</h1>
          <p className="text-designer-text-secondary mb-6 text-center">{t.tokenPrompt}</p>
          
          <div className="space-y-4">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="proj-123:key-abc123"
              className="w-full p-3 bg-white/5 border border-white/10 rounded-md text-white"
            />
            
            {tokenError && (
              <p className="text-red-500 text-sm">{tokenError}</p>
            )}
            
            <button 
              onClick={handleTokenSubmit}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors"
            >
              {t.submit}
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <a href="https://cogswell.de" target="_blank" rel="noopener noreferrer" className="text-designer-text-secondary underline hover:text-white">
              Need help? Visit cogswell.de
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-designer-background text-white">
        <img 
          src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
          alt="CogswellShare" 
          className="h-16 mb-6"
        />
        <h1 className="text-2xl font-bold mb-4">{t.projectNotFound}</h1>
        <p className="text-designer-text-secondary mb-6">{t.invalidLink}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
        >
          {t.returnHome}
        </button>
        <div className="mt-8 text-center">
          <a href="https://cogswell.de" target="_blank" rel="noopener noreferrer" className="text-designer-text-secondary underline hover:text-white">
            Need help? Visit cogswell.de
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-designer-background">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher 
          currentLanguage={language} 
          onLanguageChange={handleLanguageChange}
        />
      </div>
      
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        password={password}
        setPassword={setPassword}
        passwordError={passwordError}
        onSubmit={handlePasswordSubmit}
        language={language}
      />
      
      <RejectionModal
        isOpen={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onSubmit={handleReject}
        language={language}
      />
      
      <RatingModal
        isOpen={showRatingModal}
        onOpenChange={setShowRatingModal}
        rating={rating}
        setRating={setRating}
        onSubmit={handleRatingSubmit}
        language={language}
      />
      
      {isExpired && (
        <ExpiryNotice language={language} />
      )}
      
      {isVerified && (
        <div className="flex flex-col md:flex-row h-full">
          <ProjectSidebar 
            project={project}
            onStatusChange={handleStatusChange}
            handleCopyLink={handleCopyLink}
            language={language}
            isExpired={isExpired}
            onDownload={handleDownload}
          />
          
          <div className="flex-1 flex flex-col">
            <ViewportToolbar
              viewport={viewport}
              setViewport={setViewport}
              zoom={zoom}
              setZoom={setZoom}
              hasPreviewUrl={!!project.previewUrl}
              language={language}
            />
            
            <div className="flex-1 p-4 overflow-hidden">
              {project.previewUrl ? (
                <PortalViewport url={project.previewUrl} viewport={viewport} zoom={zoom} />
              ) : project.fileData ? (
                <FilePreview 
                  fileData={project.fileData} 
                  zoom={zoom} 
                  onDownload={handleDownload}
                  language={language}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-designer-text-secondary">
                  {t.noPreview}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portal;
