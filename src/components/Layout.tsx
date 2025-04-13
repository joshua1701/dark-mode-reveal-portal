
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-designer-background text-designer-text-primary">
      {showHeader && user && (
        <header className="bg-black/20 border-b border-white/10 py-3 px-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Designer Approval Portal</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-designer-text-secondary mr-2">
                Welcome, {user.username}
              </span>
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
        <p>© 2024 Designer Approval Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
