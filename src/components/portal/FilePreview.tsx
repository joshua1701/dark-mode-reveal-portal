
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Project } from '@/context/ProjectContext';

type FilePreviewProps = {
  fileData: Project['fileData'],
  zoom: number,
  onDownload: () => void
};

const FilePreview: React.FC<FilePreviewProps> = ({ fileData, zoom, onDownload }) => {
  if (!fileData) return null;
  
  const isImage = fileData.fileType.startsWith('image/');
  const isPdf = fileData.fileType === 'application/pdf';
  
  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/30 border-white/10 hover:bg-white/10"
          onClick={onDownload}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
      
      <div className="bg-black/30 p-1 rounded-lg flex items-center justify-center overflow-auto max-h-full max-w-full" style={{ transform: `scale(${zoom})` }}>
        {isImage && (
          <img 
            src={fileData.watermarkedUrl || fileData.fileUrl} 
            alt="Preview" 
            className="max-w-full max-h-[calc(100vh-200px)] object-contain"
          />
        )}
        {isPdf && (
          <iframe
            src={fileData.fileUrl}
            className="w-[800px] h-[800px] border-0"
            title="PDF Preview"
          />
        )}
        {!isImage && !isPdf && (
          <div className="p-8 text-center text-designer-text-secondary">
            <p>Preview not available for this file type</p>
            <Button 
              className="mt-4"
              onClick={onDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
