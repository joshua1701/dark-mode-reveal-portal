
import React from 'react';
import { Project, ProjectStatus } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check, X, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UserSettings from './UserSettings';
import { Badge } from '@/components/ui/badge';

// Translation content
const translations = {
  en: {
    projectDetails: 'Project Details',
    status: 'Status',
    customerInfo: 'Customer Information',
    email: 'Email',
    brand: 'Brand',
    createdAt: 'Created At',
    expiresAt: 'Expires At',
    never: 'Never',
    previewLink: 'Preview Link',
    copy: 'Copy Link',
    approve: 'Approve',
    reject: 'Reject',
    pending: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
    download: 'Download File'
  },
  de: {
    projectDetails: 'Projektdetails',
    status: 'Status',
    customerInfo: 'Kundeninformationen',
    email: 'E-Mail',
    brand: 'Marke',
    createdAt: 'Erstellt am',
    expiresAt: 'Läuft ab am',
    never: 'Nie',
    previewLink: 'Vorschau-Link',
    copy: 'Link kopieren',
    approve: 'Genehmigen',
    reject: 'Ablehnen',
    pending: 'Ausstehende Genehmigung',
    approved: 'Genehmigt',
    rejected: 'Abgelehnt',
    expired: 'Abgelaufen',
    download: 'Datei herunterladen'
  }
};

// Define the props interface for ProjectSidebar
interface ProjectSidebarProps {
  project: Project;
  onStatusChange: (status: ProjectStatus) => void;
  handleCopyLink: () => void;
  language: 'en' | 'de';
  isExpired: boolean;
  onDownload?: () => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  project,
  onStatusChange,
  handleCopyLink,
  language,
  isExpired,
  onDownload
}) => {
  const t = translations[language];
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t.never;
    
    return new Date(dateString).toLocaleDateString(
      language === 'en' ? 'en-US' : 'de-DE',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    );
  };
  
  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <Badge className="bg-gray-500">{t.expired}</Badge>
      );
    }
    
    switch (project.status) {
      case 'approved':
        return (
          <Badge className="bg-designer-badge flex items-center gap-1">
            <Check className="h-3 w-3" /> {t.approved}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-destructive flex items-center gap-1">
            <X className="h-3 w-3" /> {t.rejected}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500">{t.pending}</Badge>
        );
    }
  };
  
  return (
    <div className="w-full md:w-80 p-4 bg-black/20 border-r border-white/10 overflow-y-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <img 
          src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
          alt="CogswellShare" 
          className="h-8"
        />
        <div>
          <UserSettings />
        </div>
      </div>
      
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-2">
          {project.name}
        </h1>
        {getStatusBadge()}
      </div>
      
      <div className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
        <h2 className="text-sm font-medium text-designer-text-secondary mb-3">
          {t.projectDetails}
        </h2>
        
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-designer-text-secondary">{t.createdAt}</p>
            <p>{formatDate(project.createdAt)}</p>
          </div>
          
          {project.expiresAt && (
            <div>
              <p className="text-designer-text-secondary">{t.expiresAt}</p>
              <p>{formatDate(project.expiresAt)}</p>
            </div>
          )}
          
          <div>
            <p className="text-designer-text-secondary">{t.customerInfo}</p>
            <div className="flex items-center gap-2 mt-1">
              <Avatar className="h-6 w-6">
                <AvatarFallback>
                  {project.customerEmail.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{project.customerEmail}</span>
            </div>
          </div>
          
          {project.brandName && (
            <div>
              <p className="text-designer-text-secondary">{t.brand}</p>
              <p>{project.brandName}</p>
            </div>
          )}
        </div>
      </div>
      
      {project.previewUrl && (
        <div className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
          <h2 className="text-sm font-medium text-designer-text-secondary mb-3">
            {t.previewLink}
          </h2>
          
          <div className="mb-2 text-xs text-designer-text-secondary truncate">
            {project.previewUrl}
          </div>
          
          <Button 
            onClick={handleCopyLink} 
            size="sm" 
            className="w-full"
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            {t.copy}
          </Button>
        </div>
      )}
      
      {project.fileData && onDownload && (
        <div className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
          <Button 
            onClick={onDownload} 
            size="sm" 
            className="w-full"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {t.download}
          </Button>
        </div>
      )}
      
      {!isExpired && project.status === 'pending' && (
        <div className="mt-auto pt-4 space-y-2 border-t border-white/10">
          <Button 
            onClick={() => onStatusChange('approved')} 
            className="w-full bg-designer-badge hover:bg-designer-badge/90"
          >
            <Check className="h-4 w-4 mr-2" />
            {t.approve}
          </Button>
          
          <Button 
            onClick={() => onStatusChange('rejected')} 
            variant="destructive" 
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            {t.reject}
          </Button>
        </div>
      )}
      
      <div className="mt-4 pt-4 text-xs text-center text-designer-text-secondary">
        <div className="mb-2">
          <a href="https://cogswell.de" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            Need help? Visit cogswell.de
          </a>
        </div>
        <p>© 2025 CogswellShare</p>
      </div>
    </div>
  );
};

export default ProjectSidebar;
