import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProjects, Project, ProjectStatus } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ProgressBar from '@/components/ProgressBar';
import StarRating from '@/components/StarRating';
import { Loader2, Check, X, Copy, Smartphone, Laptop, Monitor, ZoomIn, ZoomOut, Link as LinkIcon, Download, ThumbsUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const PortalViewport: React.FC<{ 
  url: string, 
  viewport: 'mobile' | 'tablet' | 'desktop',
  zoom: number
}> = ({ url, viewport, zoom }) => {
  const getViewportStyle = () => {
    switch (viewport) {
      case 'mobile':
        return { width: `${320 * zoom}px`, height: `${568 * zoom}px` };
      case 'tablet':
        return { width: `${768 * zoom}px`, height: `${1024 * zoom}px` };
      case 'desktop':
      default:
        return { width: '100%', height: '100%' };
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto bg-black/20 rounded-lg">
      <iframe 
        src={url} 
        style={getViewportStyle()}
        className="border-0 transition-all duration-300 ease-in-out"
        title="Project Preview"
      />
    </div>
  );
};

const FilePreview: React.FC<{
  fileData: Project['fileData'],
  zoom: number,
  onDownload: () => void
}> = ({ fileData, zoom, onDownload }) => {
  if (!fileData) return null;
  
  const isImage = fileData.fileType.startsWith('image/');
  const isPdf = fileData.fileType === 'application/pdf';
  
  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/30 border-white/10 hover:bg-white/10"
          onClick={onDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
      
      <div className="bg-black/30 p-1 rounded-lg flex items-center justify-center overflow-auto max-h-full max-w-full" style={{ transform: `scale(${zoom})` }}>
        {isImage && (
          <img 
            src={fileData.watermarkedUrl || fileData.fileUrl} 
            alt="Preview" 
            className="max-w-full max-h-[calc(100vh-200px)] object-contain"
          />
        )}
        {isPdf && (
          <iframe
            src={fileData.fileUrl}
            className="w-[800px] h-[800px] border-0"
            title="PDF Preview"
          />
        )}
        {!isImage && !isPdf && (
          <div className="p-8 text-center text-designer-text-secondary">
            <p>Preview not available for this file type</p>
            <Button 
              className="mt-4"
              onClick={onDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

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
  
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500';
      case 'approved':
        return 'bg-designer-badge';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
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
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-designer-background">
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="bg-black/80 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Password Required</DialogTitle>
            <DialogDescription className="text-designer-text-secondary">
              Enter the password provided by your designer to view this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
            />
            {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
          </div>
          <DialogFooter>
            <Button onClick={handlePasswordSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="bg-black/80 border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription className="text-designer-text-secondary">
              Please let us know why you're rejecting this design and what changes you'd like to see.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter your feedback here..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[120px] bg-white/5 border-white/10 text-white"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)} className="border-white/10 hover:bg-white/10">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Submit Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="bg-black/80 border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rate This Project</DialogTitle>
            <DialogDescription className="text-designer-text-secondary">
              How would you rate your satisfaction with this design?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-6">
            <div className="flex justify-center">
              <StarRating rating={rating} onChange={setRating} size="lg" />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleRatingSubmit}
              className="bg-designer-badge hover:bg-designer-hover text-black font-semibold"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Submit & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isVerified && (
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-[320px] bg-black/40 border-r border-white/10 p-6 flex flex-col">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/c396cd61-c7de-47be-b58c-edff18e58dbf.png" 
                alt="CogswellShare" 
                className="h-10 mb-4"
              />
              <h1 className="text-xl font-bold mb-2">{project.name}</h1>
              <Badge className={getStatusBadgeStyle(project.status)}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            
            <div className="mb-6">
              <ProgressBar value={project.progress || 70} />
            </div>
            
            {project.previewUrl && (
              <div className="mb-6">
                <div className="text-sm text-designer-text-secondary mb-2">Preview URL:</div>
                <div className="flex items-center bg-white/5 rounded-md px-3 py-2 border border-white/10">
                  <LinkIcon className="h-4 w-4 mr-2 text-designer-text-secondary" />
                  <div className="truncate text-sm flex-1">{project.previewUrl}</div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCopyLink}
                    className="ml-2 h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {project.status === 'pending' && (
              <div className="flex flex-col space-y-4 mt-auto">
                <Button 
                  className="bg-designer-badge hover:bg-designer-hover text-black font-semibold"
                  onClick={() => handleStatusChange('approved')}
                >
                  <Check className="mr-2 h-5 w-5" />
                  Approve Project
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 hover:bg-white/10"
                  onClick={() => handleStatusChange('rejected')}
                >
                  <X className="mr-2 h-5 w-5" />
                  Request Changes
                </Button>
              </div>
            )}
            
            {project.status === 'approved' && (
              <div className="mt-auto space-y-4">
                {project.customerRating && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-sm text-designer-text-secondary mb-2">Your Rating:</p>
                    <StarRating rating={project.customerRating} readOnly />
                  </div>
                )}
                
                <div className="p-4 bg-designer-badge/20 rounded-lg border border-designer-badge/30">
                  <p className="text-sm font-medium text-designer-badge flex items-center">
                    <Check className="mr-2 h-5 w-5" />
                    Project Approved
                  </p>
                  <p className="text-xs text-designer-text-secondary mt-1">
                    You approved this project. Your designer has been notified.
                  </p>
                </div>
              </div>
            )}
            
            {project.status === 'rejected' && (
              <div className="mt-auto p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                <p className="text-sm font-medium text-red-400 flex items-center">
                  <X className="mr-2 h-5 w-5" />
                  Changes Requested
                </p>
                <p className="text-xs text-designer-text-secondary mt-1">
                  Your feedback has been submitted to the designer.
                </p>
                {project.comments && (
                  <div className="mt-2 p-2 bg-black/30 rounded border border-white/10 text-xs">
                    {project.comments}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="bg-black/60 border-b border-white/10 p-3 flex items-center justify-between">
              {project.previewUrl ? (
                <>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${viewport === 'mobile' ? 'bg-white/10' : ''}`}
                      onClick={() => setViewport('mobile')}
                      title="Mobile View"
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${viewport === 'tablet' ? 'bg-white/10' : ''}`}
                      onClick={() => setViewport('tablet')}
                      title="Tablet View"
                    >
                      <Laptop className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${viewport === 'desktop' ? 'bg-white/10' : ''}`}
                      onClick={() => setViewport('desktop')}
                      title="Desktop View"
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div />
              )}
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                  title="Zoom Out"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-mono px-2">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                  title="Zoom In"
                  disabled={zoom >= 2}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 ml-2"
                  onClick={() => setZoom(1)}
                  disabled={zoom === 1}
                >
                  Reset
                </Button>
              </div>
            </div>
            
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
