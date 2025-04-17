
import React from 'react';

type LoginLayoutProps = {
  children: React.ReactNode;
};

const LoginLayout = ({ children }: LoginLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-designer-background text-designer-text-primary">
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
          alt="CogswellShare" 
          className="h-16 mb-4"
        />
        <h1 className="text-3xl font-bold text-white">CogswellShare</h1>
        <p className="text-designer-text-secondary">Design Delivery Portal</p>
      </div>
      {children}
    </div>
  );
};

export default LoginLayout;
