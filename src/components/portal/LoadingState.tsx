
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-designer-background">
      <img 
        src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
        alt="CogswellShare" 
        className="h-16 mb-6"
      />
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default LoadingState;
