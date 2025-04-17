
import React from 'react';

type ProjectNotFoundProps = {
  language: 'en' | 'de';
  onNavigateHome: () => void;
};

const ProjectNotFound: React.FC<ProjectNotFoundProps> = ({ language, onNavigateHome }) => {
  // Translation content
  const translations = {
    en: {
      projectNotFound: 'Project Not Found',
      invalidLink: 'This project link is invalid or expired',
      returnHome: 'Return Home'
    },
    de: {
      projectNotFound: 'Projekt nicht gefunden',
      invalidLink: 'Dieser Projektlink ist ungültig oder abgelaufen',
      returnHome: 'Zur Startseite'
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
      <p className="text-designer-text-secondary mb-6">{t.invalidLink}</p>
      <button 
        onClick={onNavigateHome}
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
};

export default ProjectNotFound;
