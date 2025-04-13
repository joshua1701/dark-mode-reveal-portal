
export type ProjectStatus = 'pending' | 'approved' | 'rejected';

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
};
