
import React, { useState } from 'react';
import { Upload, X, Image, FileType, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FileUploadProps = {
  onFileSelected: (file: File) => void;
  className?: string;
  acceptedFileTypes?: string;
};

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelected, 
  className,
  acceptedFileTypes = "image/png,image/jpeg,image/svg+xml,application/pdf"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setFileType(file.type);
    
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setPreview(null); // No preview for PDFs
    }
    
    onFileSelected(file);
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    setFileType(null);
    // The parent component will need to handle clearing the selected file
  };

  const getFileIcon = () => {
    if (!fileType) return <Upload className="h-8 w-8 text-designer-text-secondary" />;
    
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-designer-text-secondary" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-designer-text-secondary" />;
    } else {
      return <FileType className="h-8 w-8 text-designer-text-secondary" />;
    }
  };

  return (
    <div 
      className={cn(
        "relative border-2 border-dashed rounded-lg p-6 transition-colors",
        isDragging ? "border-primary bg-white/5" : "border-white/10 bg-white/3",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        accept={acceptedFileTypes}
      />
      
      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-32 max-w-full rounded object-contain" 
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            {getFileIcon()}
            {fileName ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-designer-text-primary truncate max-w-[180px]">
                  {fileName}
                </span>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-5 w-5 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <div className="text-sm font-medium text-designer-text-primary">
                  Drag & drop a file or click to browse
                </div>
                <div className="text-xs text-designer-text-secondary">
                  Support: PNG, JPG, SVG, PDF (max 10MB)
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
