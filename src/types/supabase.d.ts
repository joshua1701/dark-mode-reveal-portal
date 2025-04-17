
// This file will contain type definitions for Supabase tables
// when you need to create them in the database

export type ProjectTable = {
  id: string;
  name: string;
  preview_url: string;
  type: 'url' | 'file';
  status: 'pending' | 'in-review' | 'final' | 'approved' | 'rejected';
  customer_email: string;
  created_at: string;
  created_by: string;
  expires_at: string | null;
  password_protected: boolean;
  password: string | null;
  token: string;
  brand_name: string | null;
  progress: number | null;
  language: 'en' | 'de';
  archived: boolean;
  version: number;
}

export type AuditLogTable = {
  id: string;
  project_id: string;
  action: string;
  timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
}

export type FileTable = {
  id: string;
  project_id: string;
  url: string;
  type: string;
  has_watermark: boolean;
  watermarked_url: string | null;
}

export type CommentTable = {
  id: string;
  project_id: string;
  user_role: 'admin' | 'customer';
  content: string;
  created_at: string;
}
