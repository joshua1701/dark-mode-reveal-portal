
import React from 'react';

type ExpiryNoticeProps = {
  language: 'en' | 'de';
};

const translations = {
  en: {
    title: 'This link has expired',
    message: 'Please contact the sender for a new link.',
  },
  de: {
    title: 'Dieser Link ist abgelaufen',
    message: 'Bitte kontaktieren Sie den Absender für einen neuen Link.',
  }
};

const ExpiryNotice: React.FC<ExpiryNoticeProps> = ({ language }) => {
  const t = translations[language];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="neo-blur rounded-lg p-8 max-w-md text-center">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
            alt="CogswellShare" 
            className="h-16"
          />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-red-500">{t.title}</h2>
        <p className="text-designer-text-secondary mb-6">{t.message}</p>
      </div>
    </div>
  );
};

export default ExpiryNotice;
