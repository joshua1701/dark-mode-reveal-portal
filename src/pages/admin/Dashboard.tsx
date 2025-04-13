
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects, Project } from '@/context/ProjectContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, ExternalLink, ClipboardCopy, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const { projects, loading } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleCopyLink = (project: Project) => {
    const link = `${window.location.origin}/portal?id=${project.id}&key=${project.magicKey}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied',
      description: 'Customer link has been copied to clipboard',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'approved':
        return 'bg-designer-badge hover:bg-designer-hover';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      project.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(project => statusFilter === 'all' || project.status === statusFilter);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects Dashboard</h1>
            <p className="text-designer-text-secondary">Manage your client projects and approvals</p>
          </div>
          <Button asChild>
            <Link to="/admin/create-project" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Project
            </Link>
          </Button>
        </div>

        <Card className="bg-black/40 border-white/10 mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Project Statistics</CardTitle>
            <CardDescription className="text-designer-text-secondary">
              Your project portfolio at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-designer-text-secondary text-sm mb-1">Total Projects</p>
                <p className="text-3xl font-bold">{projects.length}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-designer-text-secondary text-sm mb-1">Pending Approval</p>
                <p className="text-3xl font-bold text-blue-400">
                  {projects.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-designer-text-secondary text-sm mb-1">Approved Projects</p>
                <p className="text-3xl font-bold text-designer-badge">
                  {projects.filter(p => p.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-black/40 border border-white/10 rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-designer-text-secondary" />
              <Input
                placeholder="Search projects or clients..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-designer-text-secondary" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-md py-2 px-3 text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-designer-text-secondary">Project Name</TableHead>
                    <TableHead className="text-designer-text-secondary">Created</TableHead>
                    <TableHead className="text-designer-text-secondary">Client Email</TableHead>
                    <TableHead className="text-designer-text-secondary">Status</TableHead>
                    <TableHead className="text-designer-text-secondary">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{formatDate(project.createdAt)}</TableCell>
                      <TableCell>{project.customerEmail}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeStyle(project.status)}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(project)}
                            className="border-white/10 hover:bg-white/10 text-designer-text-secondary hover:text-white"
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 hover:bg-white/10 text-designer-text-secondary hover:text-white"
                            asChild
                          >
                            <a href={`/portal?id=${project.id}&key=${project.magicKey}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-designer-text-secondary">
              {searchTerm || statusFilter !== 'all' ? (
                <p>No projects match your search criteria</p>
              ) : (
                <p>No projects yet. Create your first project!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
