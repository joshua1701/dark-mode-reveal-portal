
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/context/ProjectContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { applyWatermark } from '@/utils/fileService';

// Import our new components
import ProjectDetailsForm from '@/components/admin/ProjectDetailsForm';
import ProjectSecurityOptions from '@/components/admin/ProjectSecurityOptions';
import ProjectFormActions from '@/components/admin/ProjectFormActions';

const CreateProject = () => {
  const [name, setName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectType, setProjectType] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(70);

  const { addProject } = useProjects();
  const navigate = useNavigate();

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (projectType === 'url' && !previewUrl.startsWith('http')) {
      toast({
        title: 'Invalid URL',
        description: 'Preview URL must start with http:// or https://',
        variant: 'destructive',
      });
      return;
    }
    
    if (projectType === 'file' && !selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let fileData;
      
      if (projectType === 'file' && selectedFile) {
        try {
          // Apply watermark to image files
          const watermarkedUrl = await applyWatermark(selectedFile);
          
          fileData = {
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            fileUrl: URL.createObjectURL(selectedFile),
            watermarkedUrl
          };
        } catch (error) {
          console.error("Error processing file:", error);
          toast({
            title: 'File processing error',
            description: 'There was an error processing your file, but we\'ll create the project anyway.',
            variant: 'destructive',
          });
          
          // Create basic file data without watermark
          fileData = {
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            fileUrl: URL.createObjectURL(selectedFile)
          };
        }
      }
      
      const newProject = addProject({
        name,
        previewUrl: projectType === 'url' ? previewUrl : '',
        fileData,
        customerEmail,
        expiresAt: hasExpiry ? new Date(expiryDate).toISOString() : null,
        hasPassword,
        password: hasPassword ? password : undefined,
        progress
      });
      
      // Show magic link in console for debugging
      console.log(`Project created: ${name}`);
      console.log(`Magic link: /portal?id=${newProject.id}&key=${newProject.magicKey}`);
      
      toast({
        title: 'Project created successfully',
        description: 'The project has been created and saved.',
      });
      
      // Navigate to dashboard even if email sending fails
      navigate('/admin/dashboard');
      
    } catch (error) {
      console.error("Project creation error:", error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/dashboard')}
          className="mb-6 border-white/10 hover:bg-white/10 text-designer-text-secondary hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="max-w-3xl mx-auto">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl">Create New Project</CardTitle>
              <CardDescription className="text-designer-text-secondary">
                Set up a new CogswellShare project for client approval
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <ProjectDetailsForm
                  name={name}
                  setName={setName}
                  previewUrl={previewUrl}
                  setPreviewUrl={setPreviewUrl}
                  customerEmail={customerEmail}
                  setCustomerEmail={setCustomerEmail}
                  progress={progress}
                  setProgress={setProgress}
                  projectType={projectType}
                  setProjectType={setProjectType}
                  handleFileSelected={handleFileSelected}
                  selectedFile={selectedFile}
                />
                
                <ProjectSecurityOptions
                  hasExpiry={hasExpiry}
                  setHasExpiry={setHasExpiry}
                  expiryDate={expiryDate}
                  setExpiryDate={setExpiryDate}
                  hasPassword={hasPassword}
                  setHasPassword={setHasPassword}
                  password={password}
                  setPassword={setPassword}
                />
              </CardContent>
              
              <CardFooter>
                <ProjectFormActions
                  isSubmitting={isSubmitting}
                  onCancel={() => navigate('/admin/dashboard')}
                />
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;
