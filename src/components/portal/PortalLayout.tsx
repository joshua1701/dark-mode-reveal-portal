
import React from 'react';
import { Project, ProjectStatus } from '@/types/project';
import LanguageSwitcher from './LanguageSwitcher';
import ProjectSidebar from './ProjectSidebar';
import ViewportToolbar from './ViewportToolbar';
import PortalViewport from './PortalViewport';
import FilePreview from './FilePreview';

interface PortalLayoutProps {
  project: Project;
  viewport: 'mobile' | 'tablet' | 'desktop';
  setViewport: (viewport: 'mobile' | 'tablet' | 'desktop') => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  language: 'en' | 'de';
  onLanguageChange: (language: 'en' | 'de') => void;
  onStatusChange: (status: ProjectStatus) => void;
  onCopyLink: () => void;
  onDownload: () => void;
  isExpired: boolean;
}

const PortalLayout: React.FC<PortalLayoutProps> = ({
  project,
  viewport,
  setViewport,
  zoom,
  setZoom,
  language,
  onLanguageChange,
  onStatusChange,
  onCopyLink,
  onDownload,
  isExpired
}) => {
  // Translation content
  const translations = {
    en: {
      noPreview: 'No preview available'
    },
    de: {
      noPreview: 'Keine Vorschau verfügbar'
    }
  };
  
  const t = translations[language];

  return (
    <div className="flex flex-col h-screen bg-designer-background">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher 
          currentLanguage={language} 
          onLanguageChange={onLanguageChange}
        />
      </div>
      
      <div className="flex flex-col md:flex-row h-full">
        <ProjectSidebar 
          project={project}
          onStatusChange={onStatusChange}
          handleCopyLink={onCopyLink}
          language={language}
          isExpired={isExpired}
          onDownload={onDownload}
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
                onDownload={onDownload}
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
    </div>
  );
};

export default PortalLayout;
