
export type ProjectStatus = 'pending' | 'in-review' | 'final' | 'approved' | 'rejected';

export type AuditLogEvent = {
  timestamp: string;
  action: 'created' | 'viewed' | 'approved' | 'rejected' | 'commented' | 'reminded';
  ipAddress?: string;
  userAgent?: string;
};

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  customerEmail: string;
  previewUrl: string;
  fileData?: {
    fileName: string;
    fileType: string;
    fileUrl: string;
    watermarkedUrl?: string;
  };
  expiresAt: string | null;
  hasPassword: boolean;
  password?: string;
  magicKey: string;
  comments?: string;
  customerRating?: 1 | 2 | 3 | 4 | 5;
  progress?: number; // Progress value between 0-100
  auditLog?: AuditLogEvent[];
  lastViewed?: string;
  language?: 'en' | 'de';
  internalNotes?: string;
  archived?: boolean;
  version?: number; // For tracking design versions (v1, v2, final)
  brandName?: string; // Brand name field
};

export type UserRole = 'admin' | 'customer';

export type User = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  createdAt: string;
  createdBy?: string;
};
