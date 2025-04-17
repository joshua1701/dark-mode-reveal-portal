
import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Download, Calendar, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import Layout from '@/components/Layout';
import RejectionModal from '@/components/portal/RejectionModal';
import RatingModal from '@/components/portal/RatingModal';
import { toast } from '@/components/ui/use-toast';

const CustomerProjectView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { getProject, updateProjectStatus, updateProjectRating, addAuditLog } = useProjects();
  const [project, setProject] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id && !isLoading) {
      const projectData = getProject(id);
      if (projectData) {
        setProject(projectData);
        // Log the view
        addAuditLog(id, {
          action: 'viewed',
          userAgent: navigator.userAgent
        });
      }
    }
  }, [id, getProject, isLoading, addAuditLog]);

  // If loading, show nothing
  if (isLoading) {
    return null;
  }
  
  // If no user or not a customer, redirect to login
  if (!user || user.role !== 'customer') {
    return <Navigate to="/" replace />;
  }

  // If project not found or doesn't belong to this customer
  if (!project || project.customerEmail !== user.email) {
    return <Navigate to="/customer/dashboard" replace />;
  }

  const handleStatusChange = (status: 'approved' | 'rejected') => {
    if (status === 'rejected') {
      setIsRejectModalOpen(true);
    } else {
      setShowRatingModal(true);
    }
  };
  
  const handleReject = () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      updateProjectStatus(project.id, 'rejected', rejectionReason);
      
      toast({
        title: 'Project Rejected',
        description: 'Your feedback has been submitted',
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
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      updateProjectRating(project.id, rating);
      updateProjectStatus(project.id, 'approved');
      
      toast({
        title: 'Project Approved',
        description: 'Thank you for your approval!',
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
    if (!project.fileData) return;
    
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

    addAuditLog(project.id, { action: 'viewed' });
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = () => {
    const status = project.status;
    
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 flex items-center gap-1">
            <Check className="h-3 w-3" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500 flex items-center gap-1">
            <X className="h-3 w-3" /> Rejected
          </Badge>
        );
      case 'in-review':
        return <Badge className="bg-blue-500">In Review</Badge>;
      case 'final':
        return <Badge className="bg-purple-500">Final</Badge>;
      default:
        return <Badge className="bg-blue-500">Pending Approval</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/customer/dashboard')}
          className="mb-6"
        >
          ← Back to Dashboard
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-black/40 border-white/10 overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{project.name}</CardTitle>
                    {project.brandName && (
                      <CardDescription>{project.brandName}</CardDescription>
                    )}
                  </div>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              
              <CardContent className="pb-6">
                {project.previewUrl ? (
                  <div className="aspect-video w-full bg-black/60 rounded-md overflow-hidden border border-white/10">
                    <iframe
                      src={project.previewUrl}
                      title={project.name}
                      className="w-full h-full"
                    />
                  </div>
                ) : project.fileData ? (
                  <div className="aspect-video flex items-center justify-center bg-black/60 rounded-md border border-white/10">
                    <Button onClick={handleDownload} className="gap-2">
                      <Download size={18} /> Download Preview
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-black/60 rounded-md border border-white/10 text-designer-text-secondary">
                    No preview available
                  </div>
                )}
                
                {project.comments && (
                  <div className="mt-6 p-4 bg-white/5 rounded-md border border-white/10">
                    <h3 className="text-lg font-medium mb-2">Project Comments</h3>
                    <p className="text-designer-text-secondary whitespace-pre-wrap">{project.comments}</p>
                  </div>
                )}
              </CardContent>
              
              {project.status === 'pending' && (
                <CardFooter className="pt-0 gap-4">
                  <Button 
                    onClick={() => handleStatusChange('approved')} 
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <Check className="h-4 w-4 mr-2" /> Approve Project
                  </Button>
                  
                  <Button 
                    onClick={() => handleStatusChange('rejected')} 
                    variant="destructive" 
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" /> Decline Project
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
          
          <div>
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-designer-text-secondary text-sm">Created</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-designer-text-secondary" />
                    <span>{formatDate(project.createdAt)}</span>
                  </div>
                </div>
                
                {project.lastViewed && (
                  <div>
                    <p className="text-designer-text-secondary text-sm">Last viewed</p>
                    <div className="flex items-center mt-1">
                      <Eye className="h-4 w-4 mr-2 text-designer-text-secondary" />
                      <span>{formatDate(project.lastViewed)}</span>
                    </div>
                  </div>
                )}
                
                {project.expiresAt && (
                  <div>
                    <p className="text-designer-text-secondary text-sm">Expires</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-designer-text-secondary" />
                      <span>
                        {new Date(project.expiresAt) > new Date() 
                          ? formatDate(project.expiresAt)
                          : 'Expired'}
                      </span>
                    </div>
                  </div>
                )}
                
                {project.fileData && (
                  <Button 
                    onClick={handleDownload} 
                    variant="outline" 
                    className="w-full mt-4"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download File
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <RejectionModal
          isOpen={isRejectModalOpen}
          onOpenChange={setIsRejectModalOpen}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          onSubmit={handleReject}
          language="en"
          isSubmitting={isSubmitting}
        />
        
        <RatingModal
          isOpen={showRatingModal}
          onOpenChange={setShowRatingModal}
          rating={rating}
          setRating={setRating}
          onSubmit={handleRatingSubmit}
          language="en"
          isSubmitting={isSubmitting}
        />
      </div>
    </Layout>
  );
};

export default CustomerProjectView;
