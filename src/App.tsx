
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProjectProvider } from "@/context/ProjectContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import CreateProject from "./pages/admin/CreateProject";
import CustomerDashboard from "./pages/customer/Dashboard";
import Portal from "./pages/Portal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, allowedRoles = ['admin', 'customer'] }: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          setIsLoading(false);
          return;
        }
        
        setUser(session.user);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!error) {
            setUserProfile(data);
          }
        } else {
          setUserProfile(null);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  if (isLoading) {
    return null;
  }
  
  if (!user || !userProfile || !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Admin only protected route
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

// Document title
document.title = "CogswellShare";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProjectProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/create-project" 
              element={
                <AdminRoute>
                  <CreateProject />
                </AdminRoute>
              } 
            />
            
            {/* Customer Routes */}
            <Route 
              path="/customer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Portal Route - No authentication required for magic links */}
            <Route path="/portal" element={<Portal />} />
            
            {/* Auth callback route for magic links */}
            <Route path="/auth/callback" element={<Login />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
