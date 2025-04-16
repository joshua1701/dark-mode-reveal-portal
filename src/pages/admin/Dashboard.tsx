
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
import { 
  Loader2, 
  Plus, 
  ExternalLink, 
  ClipboardCopy, 
  Search, 
  Filter, 
  Archive, 
  Eye, 
  MoreHorizontal,
  Trash2,
  Mail,
  File,
  Globe,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProjectDetailsDialog from '@/components/admin/ProjectDetailsDialog';
import AuditLogDialog from '@/components/admin/AuditLogDialog';

const Dashboard = () => {
  const { projects, loading, setProjectArchived, sendReminderEmail, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAuditLogDialog, setShowAuditLogDialog] = useState(false);

  const handleCopyLink = (project: Project) => {
    const link = `${window.location.origin}/portal?id=${project.id}&key=${project.magicKey}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link copied',
      description: 'Customer link has been copied to clipboard',
    });
  };

  const handleSendReminder = async (project: Project) => {
    const success = await sendReminderEmail(project.id);
    if (success) {
      toast({
        title: 'Reminder sent',
        description: `Reminder email sent to ${project.customerEmail}`,
      });
    }
  };

  const handleViewAuditLog = (project: Project) => {
    setSelectedProject(project);
    setShowAuditLogDialog(true);
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsDialog(true);
  };

  const handleArchiveProject = (project: Project) => {
    setProjectArchived(project.id, !project.archived);
  };

  const handleDeleteProject = (project: Project) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject(project.id);
    }
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
      case 'in-review':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'final':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'approved':
        return 'bg-designer-badge hover:bg-designer-hover';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const filteredProjects = projects
    .filter(project => showArchived ? true : !project.archived)
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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowArchived(!showArchived)}
              className={`border-white/10 hover:bg-white/10 ${showArchived ? 'bg-white/10' : ''}`}
            >
              <Archive className="h-4 w-4 mr-2" />
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </Button>
            <Button asChild>
              <Link to="/admin/create-project" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Project
              </Link>
            </Button>
          </div>
        </div>

        <Card className="bg-black/40 border-white/10 mb-8">
          <CardHeader className="pb-3">
            <CardTitle>Project Statistics</CardTitle>
            <CardDescription className="text-designer-text-secondary">
              Your project portfolio at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <p className="text-designer-text-secondary text-sm mb-1">Last 7 Days</p>
                <p className="text-3xl font-bold text-white">
                  {projects.filter(p => {
                    const createdAt = new Date(p.createdAt);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return createdAt > sevenDaysAgo;
                  }).length}
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
                <option value="in-review">In Review</option>
                <option value="final">Final</option>
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
                    <TableHead className="text-designer-text-secondary">Last View</TableHead>
                    <TableHead className="text-designer-text-secondary">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow 
                      key={project.id} 
                      className={`border-white/10 hover:bg-white/5 ${project.archived ? 'opacity-60' : ''}`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {project.fileData ? 
                            <File className="h-4 w-4 mr-2 text-designer-text-secondary" /> : 
                            <Globe className="h-4 w-4 mr-2 text-designer-text-secondary" />
                          }
                          <span>{project.name}</span>
                          {project.version && project.version > 1 && (
                            <Badge className="ml-2 bg-white/10 text-xs">v{project.version}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(project.createdAt)}</TableCell>
                      <TableCell>{project.customerEmail}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeStyle(project.status)}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {project.lastViewed ? (
                          <div className="flex items-center text-sm">
                            <Eye className="h-3 w-3 mr-1 text-designer-text-secondary" />
                            {formatDate(project.lastViewed)}
                          </div>
                        ) : (
                          <span className="text-designer-text-secondary text-sm">Not viewed</span>
                        )}
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/10 hover:bg-white/10 text-designer-text-secondary hover:text-white"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-black/80 border-white/10">
                              <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-white/10"
                                onClick={() => handleViewDetails(project)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-white/10"
                                onClick={() => handleViewAuditLog(project)}
                              >
                                <File className="mr-2 h-4 w-4" />
                                <span>Audit Log</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-white/10"
                                onClick={() => handleSendReminder(project)}
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Send Reminder</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem
                                className="cursor-pointer hover:bg-white/10"
                                onClick={() => handleArchiveProject(project)}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                <span>{project.archived ? 'Restore' : 'Archive'}</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-red-500 hover:bg-red-500/20"
                                onClick={() => handleDeleteProject(project)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {selectedProject && (
        <>
          <ProjectDetailsDialog
            project={selectedProject}
            isOpen={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
          />
          <AuditLogDialog
            project={selectedProject}
            isOpen={showAuditLogDialog}
            onOpenChange={setShowAuditLogDialog}
          />
        </>
      )}
    </Layout>
  );
};

export default Dashboard;
