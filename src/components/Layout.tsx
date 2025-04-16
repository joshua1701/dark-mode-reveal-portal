
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SettingsMenu from './admin/SettingsMenu';

type LayoutProps = {
  children: React.ReactNode;
  showHeader?: boolean;
};

const Layout: React.FC<LayoutProps> = ({ children, showHeader = true }) => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center bg-designer-background text-designer-text-primary">
        <img 
          src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
          alt="CogswellShare" 
          className="h-16 mb-6"
        />
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p>Loading...</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-screen bg-designer-background text-designer-text-primary">
      {showHeader && user && (
        <header className="bg-black/20 border-b border-white/10 py-3 px-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/b906aa0a-ce73-4a5d-bf54-a39b37f9e953.png" 
                alt="CogswellShare" 
                className="h-10"
              />
              <h1 className="text-xl font-bold text-white">CogswellShare</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center mr-2">
                {user.profileImage ? (
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user.profileImage} alt={user.username} />
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 mr-2 flex items-center justify-center">
                    <span className="text-sm font-medium">{getInitials(user.username)}</span>
                  </div>
                )}
                <span className="text-designer-text-secondary">
                  {user.username}
                </span>
              </div>
              
              <SettingsMenu />
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-designer-text-secondary hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="mt-auto py-4 px-6 text-center text-xs text-designer-text-secondary border-t border-white/10">
        <p>© 2024 CogswellShare. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
