
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Link as LinkIcon, Percent } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import FileUpload from '@/components/FileUpload';

type ProjectDetailsFormProps = {
  name: string;
  setName: (name: string) => void;
  previewUrl: string;
  setPreviewUrl: (url: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  progress: number;
  setProgress: (progress: number) => void;
  projectType: 'url' | 'file';
  setProjectType: (type: 'url' | 'file') => void;
  handleFileSelected: (file: File) => void;
  selectedFile: File | null;
};

const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  name,
  setName,
  previewUrl,
  setPreviewUrl,
  customerEmail,
  setCustomerEmail,
  progress,
  setProgress,
  projectType,
  setProjectType,
  handleFileSelected,
  selectedFile,
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className="text-designer-text-primary">Project Name</Label>
        <Input
          id="name"
          placeholder="Enter project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white/5 border-white/10 text-white"
          required
        />
      </div>
      
      <Tabs defaultValue="url" onValueChange={(value) => setProjectType(value as 'url' | 'file')}>
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="url">Website URL</TabsTrigger>
          <TabsTrigger value="file">Upload Design</TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="preview-url" className="text-designer-text-primary">Preview URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-designer-text-secondary" />
              <Input
                id="preview-url"
                placeholder="https://preview.example.com"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
                required={projectType === 'url'}
              />
            </div>
            <p className="text-xs text-designer-text-secondary">
              Enter the full URL where your client can preview the project
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="file" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-designer-text-primary">Upload Design File</Label>
            <FileUpload 
              onFileSelected={handleFileSelected}
              acceptedFileTypes="image/png,image/jpeg,image/svg+xml,application/pdf"
            />
            <p className="text-xs text-designer-text-secondary">
              Supported formats: PNG, JPG, SVG, PDF (max 10MB)
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-2">
        <Label htmlFor="customer-email" className="text-designer-text-primary">Customer Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-designer-text-secondary" />
          <Input
            id="customer-email"
            type="email"
            placeholder="client@example.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="progress" className="text-designer-text-primary flex items-center">
            <Percent className="h-4 w-4 mr-1" />
            Project Progress
          </Label>
          <span className="text-sm font-medium text-designer-text-primary">
            {progress}%
          </span>
        </div>
        <Slider
          id="progress"
          min={0}
          max={100}
          step={5}
          value={[progress]}
          onValueChange={(value) => setProgress(value[0])}
          className="py-2"
        />
        <p className="text-xs text-designer-text-secondary">
          Indicate how complete the project is for the client's reference
        </p>
      </div>
    </>
  );
};

export default ProjectDetailsForm;
