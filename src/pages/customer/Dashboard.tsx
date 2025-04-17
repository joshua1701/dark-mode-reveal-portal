import React, { useState } from 'react';
import { useProjects, Project } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, Eye, Star, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Navigate, Link } from 'react-router-dom';
import Layout from '@/components/Layout';

// Get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-500';
    case 'rejected': return 'bg-red-500';
    case 'in-review': return 'bg-blue-500';
    case 'final': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

const CustomerDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { projects } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  
  // If loading, show nothing
  if (isLoading) {
    return null;
  }
  
  // If no user or not a customer, redirect to login
  if (!user || user.role !== 'customer') {
    return <Navigate to="/" replace />;
  }
  
  // Filter projects for this customer
  const customerProjects = projects.filter(project => 
    project.customerEmail === user.email && !project.archived
  );
  
  // Filter by search term if provided
  const filteredProjects = searchTerm 
    ? customerProjects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customerProjects;
  
  return (
    <Layout>
      <div className="min-h-screen bg-designer-background text-designer-text-primary">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">My Projects</h1>
                <p className="text-designer-text-secondary mt-1">
                  View and manage all your design projects
                </p>
              </div>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-designer-text-secondary h-4 w-4" />
                <Input 
                  className="pl-10 bg-white/5 border border-white/10"
                  placeholder="Search projects..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </header>
          
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No projects found</h3>
              <p className="text-designer-text-secondary mb-6">
                {searchTerm 
                  ? "No projects match your search criteria"
                  : "You don't have any active projects yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Project card component
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };
  
  return (
    <Card className="overflow-hidden bg-black/40 border-white/10">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{project.name}</CardTitle>
            {project.brandName && (
              <CardDescription>{project.brandName}</CardDescription>
            )}
          </div>
          <Badge className={`${getStatusColor(project.status)} text-white`}>
            {project.status.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-3 text-sm">
          <div className="flex items-center text-designer-text-secondary">
            <Clock className="h-4 w-4 mr-2" />
            <span>Created: {formatDate(project.createdAt)}</span>
          </div>
          
          {project.lastViewed && (
            <div className="flex items-center text-designer-text-secondary">
              <Eye className="h-4 w-4 mr-2" />
              <span>Last viewed: {formatDate(project.lastViewed)}</span>
            </div>
          )}
          
          {project.customerRating && (
            <div className="flex items-center text-designer-text-secondary">
              <Star className="h-4 w-4 mr-2" />
              <span>Your rating: {project.customerRating}/5</span>
            </div>
          )}
          
          {project.expiresAt && (
            <div className="flex items-center text-designer-text-secondary">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {new Date(project.expiresAt) > new Date() 
                  ? `Expires: ${formatDate(project.expiresAt)}`
                  : 'Expired'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link to={`/customer/project/${project.id}`}>
            View Project
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomerDashboard;
