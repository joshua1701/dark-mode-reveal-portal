
import React, { useState } from 'react';
import { useProjects, Project } from '@/context/ProjectContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Calendar, 
  Globe, 
  FileText, 
  Archive, 
  Star, 
  Check, 
  X,
  Flag,
  MessageSquare,
  Language,
  ExternalLink
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import StarRating from '@/components/StarRating';
import ProgressBar from '@/components/ProgressBar';

interface ProjectDetailsDialogProps {
  project: Project;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = ({
  project,
  isOpen,
  onOpenChange,
}) => {
  const { updateInternalNotes, updateProjectVersion, updateProjectLanguage } = useProjects();
  const [notes, setNotes] = useState(project.internalNotes || '');
  const [version, setVersion] = useState(project.version || 1);
  const [language, setLanguage] = useState<'en' | 'de'>(project.language || 'en');

  const handleSaveNotes = () => {
    updateInternalNotes(project.id, notes);
  };

  const handleVersionChange = (newVersion: number) => {
    if (newVersion < 1) return;
    setVersion(newVersion);
    updateProjectVersion(project.id, newVersion);
  };

  const handleLanguageChange = (newLanguage: 'en' | 'de') => {
    setLanguage(newLanguage);
    updateProjectLanguage(project.id, newLanguage);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/portal?id=${project.id}&key=${project.magicKey}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied',
      description: 'Customer link has been copied to clipboard',
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500';
      case 'in-review':
        return 'bg-purple-500';
      case 'final':
        return 'bg-orange-500';
      case 'approved':
        return 'bg-designer-badge';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/70 border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {project.name}
            <Badge className={`ml-2 ${getStatusBadgeStyle(project.status)}`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
            {project.archived && (
              <Badge className="bg-gray-500 ml-1">Archived</Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-designer-text-secondary">
            Project ID: {project.id}
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <ProgressBar value={project.progress || 0} />
        </div>

        <Tabs defaultValue="details">
          <TabsList className="bg-black/50 border border-white/10">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="notes">Internal Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center text-designer-text-secondary mb-1">
                  <Calendar className="w-4 h-4 mr-1" /> Created At
                </div>
                <div>{formatDate(project.createdAt)}</div>
              </div>
              
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center text-designer-text-secondary mb-1">
                  <Calendar className="w-4 h-4 mr-1" /> Expires At
                </div>
                <div>{project.expiresAt ? formatDate(project.expiresAt) : 'Never'}</div>
              </div>
              
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center text-designer-text-secondary mb-1">
                  <Globe className="w-4 h-4 mr-1" /> Client Email
                </div>
                <div>{project.customerEmail}</div>
              </div>
              
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center text-designer-text-secondary mb-1">
                  <Language className="w-4 h-4 mr-1" /> Language
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`cursor-pointer ${language === 'en' ? 'bg-designer-badge' : 'bg-white/20'}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    🇺🇸 English
                  </Badge>
                  <Badge 
                    className={`cursor-pointer ${language === 'de' ? 'bg-designer-badge' : 'bg-white/20'}`}
                    onClick={() => handleLanguageChange('de')}
                  >
                    🇩🇪 German
                  </Badge>
                </div>
              </div>
              
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center text-designer-text-secondary mb-1">
                  <FileText className="w-4 h-4 mr-1" /> Password Protected
                </div>
                <div className="flex items-center">
                  {project.hasPassword ? (
                    <Check className="h-5 w-5 text-designer-badge" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center text-designer-text-secondary mb-1">
                  <Flag className="w-4 h-4 mr-1" /> Version
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0 border-white/10"
                    onClick={() => handleVersionChange(version - 1)}
                    disabled={version <= 1}
                  >
                    -
                  </Button>
                  <span className="mx-2">v{version}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 w-8 p-0 border-white/10"
                    onClick={() => handleVersionChange(version + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              {project.customerRating && (
                <div className="bg-white/5 p-3 rounded border border-white/10">
                  <div className="flex items-center text-designer-text-secondary mb-1">
                    <Star className="w-4 h-4 mr-1" /> Client Rating
                  </div>
                  <StarRating rating={project.customerRating} readOnly />
                </div>
              )}
            </div>
            
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <div className="flex items-center text-designer-text-secondary mb-2">
                <Copy className="w-4 h-4 mr-1" /> Magic Link
              </div>
              <div className="flex items-center">
                <code className="bg-black/30 p-2 rounded text-xs flex-1 overflow-x-auto">
                  {window.location.origin}/portal?id={project.id}&key={project.magicKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="ml-2 border-white/10 hover:bg-white/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4 mt-4">
            {project.previewUrl ? (
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center text-designer-text-secondary mb-2">
                  <Globe className="w-4 h-4 mr-1" /> Preview URL
                </div>
                <div className="flex items-center">
                  <code className="bg-black/30 p-2 rounded text-xs flex-1 overflow-x-auto">
                    {project.previewUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 border-white/10 hover:bg-white/10"
                    asChild
                  >
                    <a href={project.previewUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : project.fileData ? (
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center text-designer-text-secondary mb-2">
                  <FileText className="w-4 h-4 mr-1" /> File Upload
                </div>
                <div>
                  <p className="mb-2">Filename: {project.fileData.fileName}</p>
                  <p className="mb-2">Type: {project.fileData.fileType}</p>
                  {project.fileData.fileType.startsWith('image/') && (
                    <div className="mt-4">
                      <p className="text-designer-text-secondary mb-2">Preview:</p>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        <div>
                          <p className="text-xs mb-1">Original</p>
                          <img 
                            src={project.fileData.fileUrl} 
                            alt="Original" 
                            className="max-h-40 rounded border border-white/10"
                          />
                        </div>
                        {project.fileData.watermarkedUrl && (
                          <div>
                            <p className="text-xs mb-1">Watermarked</p>
                            <img 
                              src={project.fileData.watermarkedUrl} 
                              alt="Watermarked" 
                              className="max-h-40 rounded border border-white/10"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-designer-text-secondary text-center py-4">
                No content available for this project.
              </div>
            )}
            
            {project.comments && (
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <div className="flex items-center text-designer-text-secondary mb-2">
                  <MessageSquare className="w-4 h-4 mr-1" /> Client Comments
                </div>
                <div className="bg-black/30 p-3 rounded text-sm">
                  {project.comments}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <div className="flex items-center text-designer-text-secondary mb-2">
                <MessageSquare className="w-4 h-4 mr-1" /> Internal Notes
              </div>
              <Textarea
                placeholder="Add internal notes about this project..."
                className="min-h-[200px] bg-black/30 border-white/10 text-white"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button 
                onClick={handleSaveNotes} 
                className="mt-2"
              >
                Save Notes
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <DialogClose asChild>
            <Button variant="outline" className="border-white/10 hover:bg-white/10">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsDialog;
