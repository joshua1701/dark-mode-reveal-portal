
import React from 'react';

type ProjectNotFoundProps = {
  language: 'en' | 'de';
  onNavigateHome: () => void;
  errorDetails?: string;
};

const ProjectNotFound: React.FC<ProjectNotFoundProps> = ({ 
  language, 
  onNavigateHome, 
  errorDetails 
}) => {
  // Translation content
  const translations = {
    en: {
      projectNotFound: 'Project Not Found',
      invalidLink: 'This project link is invalid or expired',
      returnHome: 'Return Home',
      helpText: 'Need help? Contact the project creator for a valid link.',
      checkLink: 'Please check your link or ask for a new one.',
      errorDetails: 'Error details:'
    },
    de: {
      projectNotFound: 'Projekt nicht gefunden',
      invalidLink: 'Dieser Projektlink ist ungültig oder abgelaufen',
      returnHome: 'Zur Startseite',
      helpText: 'Brauchen Sie Hilfe? Kontaktieren Sie den Projektersteller für einen gültigen Link.',
      checkLink: 'Bitte überprüfen Sie Ihren Link oder bitten Sie um einen neuen.',
      errorDetails: 'Fehlerdetails:'
    }
  };

  const t = translations[language];

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-designer-background text-white">
      <img 
        src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
        alt="CogswellShare" 
        className="h-16 mb-6"
      />
      <h1 className="text-2xl font-bold mb-4">{t.projectNotFound}</h1>
      <p className="text-designer-text-secondary mb-2">{t.invalidLink}</p>
      <p className="text-designer-text-secondary mb-6">{t.checkLink}</p>
      {errorDetails && (
        <div className="mb-6 p-4 bg-black/20 rounded-md max-w-md text-sm">
          <p className="text-designer-text-secondary mb-2">{t.errorDetails}</p>
          <p className="font-mono text-xs whitespace-pre-wrap break-words text-designer-text-secondary">{errorDetails}</p>
        </div>
      )}
      <button 
        onClick={onNavigateHome}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
      >
        {t.returnHome}
      </button>
      <div className="mt-8 text-center">
        <p className="text-designer-text-secondary">
          {t.helpText}
        </p>
      </div>
    </div>
  );
};

export default ProjectNotFound;
