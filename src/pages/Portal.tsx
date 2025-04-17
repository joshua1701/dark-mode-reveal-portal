
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProjects, Project, ProjectStatus } from '@/context/ProjectContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import TokenModal from '@/components/portal/TokenModal';
import PortalLayout from '@/components/portal/PortalLayout';
import ProjectNotFound from '@/components/portal/ProjectNotFound';
import PasswordModal from '@/components/portal/PasswordModal';
import RejectionModal from '@/components/portal/RejectionModal';
import RatingModal from '@/components/portal/RatingModal';
import ExpiryNotice from '@/components/portal/ExpiryNotice';

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
  const { getProjectByIdAndKey, updateProjectStatus, updateProjectRating, addAuditLog } = useProjects();
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
      
      try {
        // Try to fetch the project directly from Supabase
        const { data: projectData, error } = await supabase
          .from('projects')
          .select(`
            id, name, preview_url, type, status, customer_email, created_at,
            created_by, expires_at, password_protected, password, token,
            brand_name, progress, language, archived
          `)
          .eq('id', id)
          .eq('token', key)
          .single();
        
        if (error) {
          console.error('Error fetching project:', error);
          // Fall back to local storage
          const localProject = getProjectByIdAndKey(id, key);
          
          if (!localProject) {
            setIsVerifying(false);
            toast({
              title: 'Project Not Found',
              description: 'The requested project could not be found',
              variant: 'destructive',
            });
            return;
          }
          
          setProject(localProject);
          setLanguage(localProject.language || 'en');
          handleProjectFound(localProject);
        } else {
          // Fetch audit logs for the project
          const { data: auditLogData } = await supabase
            .from('audit_log')
            .select('*')
            .eq('project_id', projectData.id)
            .order('timestamp', { ascending: false });
          
          // Find last viewed timestamp
          const lastViewedEntry = auditLogData?.find((entry: any) => entry.action === 'viewed');
          
          // Map to our Project type
          const mappedProject: Project = {
            id: projectData.id,
            name: projectData.name,
            status: projectData.status as ProjectStatus,
            createdAt: projectData.created_at,
            customerEmail: projectData.customer_email,
            previewUrl: projectData.preview_url,
            fileData: projectData.type === 'file' ? {
              fileName: 'file', // Need to fetch file data separately
              fileType: 'file',
              fileUrl: projectData.preview_url
            } : undefined,
            expiresAt: projectData.expires_at,
            hasPassword: projectData.password_protected,
            password: projectData.password,
            magicKey: projectData.token,
            comments: '',
            progress: projectData.progress || 0,
            auditLog: auditLogData?.map((log: any) => ({
              timestamp: log.timestamp,
              action: log.action,
              ipAddress: log.ip_address,
              userAgent: log.user_agent
            })) || [],
            lastViewed: lastViewedEntry?.timestamp,
            language: projectData.language || 'en',
            archived: projectData.archived || false,
            brandName: projectData.brand_name,
            version: 1 // Default to version 1
          };
          
          setProject(mappedProject);
          setLanguage(mappedProject.language || 'en');
          handleProjectFound(mappedProject);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        setIsVerifying(false);
        toast({
          title: 'Error',
          description: 'Failed to load project information',
          variant: 'destructive',
        });
      }
    };
    
    const handleProjectFound = async (foundProject: Project) => {
      // Check if project is expired
      if (foundProject.expiresAt) {
        const expiryDate = new Date(foundProject.expiresAt);
        if (expiryDate < new Date()) {
          setIsExpired(true);
        }
      }
      
      // Log view in audit log
      try {
        const ipAddress = await getUserIP();
        const userAgent = navigator.userAgent;
        
        // Add to Supabase
        await supabase
          .from('audit_log')
          .insert({
            project_id: foundProject.id,
            action: 'viewed',
            ip_address: ipAddress,
            user_agent: userAgent
          });
        
        // Also update local copy via context
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
  }, [location.search, getProjectByIdAndKey, navigate, addAuditLog]);
  
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
    
    try {
      // Try to fetch the project from Supabase
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('id, token')
        .eq('id', id)
        .eq('token', key)
        .single();
      
      if (error || !projectData) {
        setTokenError(language === 'en' ? 
          'Invalid token. Please try again.' : 
          'Ungültiger Token. Bitte versuchen Sie es erneut.');
        return;
      }
      
      // Redirect to the project page with the id and key
      navigate(`/portal?id=${id}&key=${key}`);
    } catch (error) {
      console.error('Error verifying token:', error);
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
  
  const handleReject = async () => {
    if (!project || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Update in Supabase
      await updateProjectStatus(project.id, 'rejected', rejectionReason);
      
      toast({
        title: language === 'en' ? 'Project Rejected' : 'Projekt abgelehnt',
        description: language === 'en' ? 
          'Feedback has been submitted' : 
          'Feedback wurde übermittelt',
        variant: 'destructive',
      });
      
      // Force refresh project data
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
  
  const handleRatingSubmit = async () => {
    if (!project || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Update in Supabase
      await updateProjectRating(project.id, rating);
      await updateProjectStatus(project.id, 'approved');
      
      toast({
        title: language === 'en' ? 'Project Approved' : 'Projekt genehmigt',
        description: language === 'en' ? 
          'Thank you for your approval!' : 
          'Vielen Dank für Ihre Genehmigung!',
      });
      
      // Force refresh project data
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
  
  const handleDownload = async () => {
    if (!project?.fileData) return;
    
    try {
      // Try to get a signed URL from Supabase if this is a file in storage
      const { data: filesData, error: filesError } = await supabase
        .from('files')
        .select('url, type')
        .eq('project_id', project.id)
        .single();
      
      if (filesError) {
        console.error('Error fetching file info:', filesError);
        // Fall back to direct URL
        downloadFile(project.fileData.watermarkedUrl || project.fileData.fileUrl, project.fileData.fileName);
        return;
      }
      
      // Get a signed URL for the file
      const { data: signedUrl, error: signError } = await supabase
        .storage
        .from('project_files')
        .createSignedUrl(filesData.url, 60); // Valid for 60 seconds
      
      if (signError) {
        console.error('Error getting signed URL:', signError);
        // Fall back to direct URL
        downloadFile(project.fileData.watermarkedUrl || project.fileData.fileUrl, project.fileData.fileName);
        return;
      }
      
      downloadFile(signedUrl.signedUrl, filesData.url.split('/').pop() || 'download');
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fall back to direct URL
      downloadFile(project.fileData.watermarkedUrl || project.fileData.fileUrl, project.fileData.fileName);
    }
    
    toast({
      title: language === 'en' ? 'Download started' : 'Download gestartet',
      description: language === 'en' ? 
        'Your file is being downloaded' : 
        'Ihre Datei wird heruntergeladen',
    });

    // Log download in audit log
    addAuditLog(project.id, { action: 'viewed' });
  };
  
  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `CogswellShare_${filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleLanguageChange = (newLanguage: 'en' | 'de') => {
    setLanguage(newLanguage);
  };
  
  if (isVerifying) {
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
      <TokenModal
        isOpen={isTokenModalOpen}
        onOpenChange={setIsTokenModalOpen}
        token={token}
        setToken={setToken}
        tokenError={tokenError}
        onSubmit={handleTokenSubmit}
        language={language}
      />
    );
  }
  
  if (!project) {
    return <ProjectNotFound language={language} onNavigateHome={() => navigate('/')} />;
  }
  
  return (
    <>
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
        isSubmitting={isSubmitting}
      />
      
      <RatingModal
        isOpen={showRatingModal}
        onOpenChange={setShowRatingModal}
        rating={rating}
        setRating={setRating}
        onSubmit={handleRatingSubmit}
        language={language}
        isSubmitting={isSubmitting}
      />
      
      {isExpired && (
        <ExpiryNotice language={language} />
      )}
      
      {isVerified && (
        <PortalLayout
          project={project}
          viewport={viewport}
          setViewport={setViewport}
          zoom={zoom}
          setZoom={setZoom}
          language={language}
          onLanguageChange={handleLanguageChange}
          onStatusChange={handleStatusChange}
          onCopyLink={handleCopyLink}
          onDownload={handleDownload}
          isExpired={isExpired}
        />
      )}
    </>
  );
};

export default Portal;
