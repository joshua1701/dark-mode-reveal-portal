
import React from 'react';
import { Project, ProjectStatus } from '@/context/ProjectContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, X } from 'lucide-react';
import ProgressBar from '@/components/ProgressBar';
import StarRating from '@/components/StarRating';
import { LinkIcon } from 'lucide-react';

// Translation content
const translations = {
  en: {
    previewUrl: 'Preview URL:',
    projectApproved: 'Project Approved',
    approvedNotification: 'You approved this project. Your designer has been notified.',
    changesRequested: 'Changes Requested',
    feedbackSubmitted: 'Your feedback has been submitted to the designer.',
    approveProject: 'Approve Project',
    requestChanges: 'Request Changes',
    expired: 'Expired'
  },
  de: {
    previewUrl: 'Vorschau-URL:',
    projectApproved: 'Projekt genehmigt',
    approvedNotification: 'Sie haben dieses Projekt genehmigt. Ihr Designer wurde benachrichtigt.',
    changesRequested: 'Änderungen angefordert',
    feedbackSubmitted: 'Ihr Feedback wurde an den Designer übermittelt.',
    approveProject: 'Projekt genehmigen',
    requestChanges: 'Änderungen anfordern',
    expired: 'Abgelaufen'
  }
};

type ProjectSidebarProps = {
  project: Project;
  onStatusChange: (status: ProjectStatus) => void;
  handleCopyLink: () => void;
  language?: 'en' | 'de';
  isExpired?: boolean;
};

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ 
  project, 
  onStatusChange,
  handleCopyLink,
  language = 'en',
  isExpired = false
}) => {
  const t = translations[language];

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
    <div className="w-full md:w-[320px] bg-black/40 border-r border-white/10 p-6 flex flex-col">
      <div className="mb-6">
        <img 
          src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
          alt="CogswellShare" 
          className="h-12 mb-4"
        />
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold mb-2">{project.name}</h1>
          {project.version && project.version > 1 && (
            <Badge className="bg-white/10 text-xs">v{project.version}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusBadgeStyle(project.status)}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
          {isExpired && (
            <Badge variant="outline" className="border-red-500 text-red-500">
              {t.expired}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <ProgressBar value={project.progress || 70} />
      </div>
      
      {project.previewUrl && (
        <div className="mb-6">
          <div className="text-sm text-designer-text-secondary mb-2">{t.previewUrl}</div>
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
      
      {!isExpired && project.status === 'pending' && (
        <div className="flex flex-col space-y-4 mt-auto">
          <Button 
            className="bg-designer-badge hover:bg-designer-hover text-black font-semibold"
            onClick={() => onStatusChange('approved')}
          >
            <Check className="mr-2 h-5 w-5" />
            {t.approveProject}
          </Button>
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/10"
            onClick={() => onStatusChange('rejected')}
          >
            <X className="mr-2 h-5 w-5" />
            {t.requestChanges}
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
              {t.projectApproved}
            </p>
            <p className="text-xs text-designer-text-secondary mt-1">
              {t.approvedNotification}
            </p>
          </div>
        </div>
      )}
      
      {project.status === 'rejected' && (
        <div className="mt-auto p-4 bg-red-500/20 rounded-lg border border-red-500/30">
          <p className="text-sm font-medium text-red-400 flex items-center">
            <X className="mr-2 h-5 w-5" />
            {t.changesRequested}
          </p>
          <p className="text-xs text-designer-text-secondary mt-1">
            {t.feedbackSubmitted}
          </p>
          {project.comments && (
            <div className="mt-2 p-2 bg-black/30 rounded border border-white/10 text-xs">
              {project.comments}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 pt-6 border-t border-white/10 text-center">
        <p className="text-xs text-designer-text-secondary">Powered by CogswellShare</p>
      </div>
    </div>
  );
};

export default ProjectSidebar;
