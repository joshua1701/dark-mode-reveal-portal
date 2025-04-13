
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

const Portal = () => {
  const { getProjectByIdAndKey, updateProjectStatus, updateProjectRating } = useProjects();
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
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    const key = params.get('key');
    
    const loadProject = async () => {
      if (!id || !key) {
        toast({
          title: 'Invalid Link',
          description: 'This approval link is invalid or expired',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
      
      const isValid = await verifyMagicLink(id, key);
      if (!isValid) {
        navigate('/');
        return;
      }
      
      const foundProject = getProjectByIdAndKey(id, key);
      if (!foundProject) {
        toast({
          title: 'Project Not Found',
          description: 'The requested project could not be found',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
      
      setProject(foundProject);
      
      if (foundProject.hasPassword) {
        setIsPasswordModalOpen(true);
      } else {
        setIsVerified(true);
      }
      
      setIsVerifying(false);
    };
    
    loadProject();
  }, [location.search, getProjectByIdAndKey, verifyMagicLink, navigate]);
  
  const handlePasswordSubmit = () => {
    if (!project) return;
    
    if (password === project.password) {
      setIsPasswordModalOpen(false);
      setIsVerified(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };
  
  const handleCopyLink = () => {
    if (!project) return;
    
    navigator.clipboard.writeText(project.previewUrl);
    toast({
      title: 'Link copied',
      description: 'Preview URL has been copied to clipboard',
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
      title: 'Project Rejected',
      description: 'Feedback has been submitted',
      variant: 'destructive',
    });
  };
  
  const handleRatingSubmit = () => {
    if (!project) return;
    
    updateProjectRating(project.id, rating);
    updateProjectStatus(project.id, 'approved');
    setShowRatingModal(false);
    
    toast({
      title: 'Project Approved',
      description: 'Thank you for your approval!',
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
      title: 'Download started',
      description: 'Your file is being downloaded',
    });
  };
  
  if (isLoading || isVerifying) {
    return (
      <div className="flex justify-center items-center h-screen bg-designer-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-designer-background text-white">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <p className="text-designer-text-secondary mb-6">This project link is invalid or expired</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-designer-background">
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        password={password}
        setPassword={setPassword}
        passwordError={passwordError}
        onSubmit={handlePasswordSubmit}
      />
      
      <RejectionModal
        isOpen={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onSubmit={handleReject}
      />
      
      <RatingModal
        isOpen={showRatingModal}
        onOpenChange={setShowRatingModal}
        rating={rating}
        setRating={setRating}
        onSubmit={handleRatingSubmit}
      />
      
      {isVerified && (
        <div className="flex flex-col md:flex-row h-full">
          <ProjectSidebar 
            project={project}
            onStatusChange={handleStatusChange}
            handleCopyLink={handleCopyLink} 
          />
          
          <div className="flex-1 flex flex-col">
            <ViewportToolbar
              viewport={viewport}
              setViewport={setViewport}
              zoom={zoom}
              setZoom={setZoom}
              hasPreviewUrl={!!project.previewUrl}
            />
            
            <div className="flex-1 p-4 overflow-hidden">
              {project.previewUrl ? (
                <PortalViewport url={project.previewUrl} viewport={viewport} zoom={zoom} />
              ) : project.fileData ? (
                <FilePreview 
                  fileData={project.fileData} 
                  zoom={zoom} 
                  onDownload={handleDownload}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-designer-text-secondary">
                  No preview available
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
