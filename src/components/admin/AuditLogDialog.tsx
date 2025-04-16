
import React from 'react';
import { Project, AuditLogEvent } from '@/types/project';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, FileText, Mail, Clock, MousePointer, Check, X, MessageSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AuditLogDialogProps {
  project: Project;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuditLogDialog: React.FC<AuditLogDialogProps> = ({
  project,
  isOpen,
  onOpenChange,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-green-400" />;
      case 'approved':
        return <Check className="h-4 w-4 text-designer-badge" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-400" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4 text-purple-400" />;
      case 'reminded':
        return <Mail className="h-4 w-4 text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'created':
        return 'Project Created';
      case 'viewed':
        return 'Project Viewed';
      case 'approved':
        return 'Project Approved';
      case 'rejected':
        return 'Project Rejected';
      case 'commented':
        return 'Comment Added';
      case 'reminded':
        return 'Reminder Sent';
      default:
        return action.charAt(0).toUpperCase() + action.slice(1);
    }
  };

  // Sort audit logs by timestamp in descending order (newest first)
  const sortedLogs = project.auditLog 
    ? [...project.auditLog].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/70 border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Audit Log</DialogTitle>
          <DialogDescription className="text-designer-text-secondary">
            Activity history for {project.name}
          </DialogDescription>
        </DialogHeader>

        {sortedLogs.length > 0 ? (
          <div className="overflow-y-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-designer-text-secondary">Timestamp</TableHead>
                  <TableHead className="text-designer-text-secondary">Action</TableHead>
                  <TableHead className="text-designer-text-secondary">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLogs.map((log, index) => (
                  <TableRow key={index} className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-sm">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span>{getActionText(log.action)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-designer-text-secondary">
                      {log.ipAddress && (
                        <div className="flex items-center gap-1">
                          <MousePointer className="h-3 w-3" />
                          <span>{log.ipAddress}</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-designer-text-secondary">
            No activity logs available for this project.
          </div>
        )}

        <div className="flex justify-end pt-4">
          <DialogClose asChild>
            <Button variant="outline" className="border-white/10 hover:bg-white/10">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuditLogDialog;
