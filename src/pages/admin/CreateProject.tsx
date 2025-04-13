
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/context/ProjectContext';
import Layout from '@/components/Layout';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Mail, Link as LinkIcon, Percent } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { applyWatermark } from '@/utils/fileService';

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
        // Apply watermark to image files
        const watermarkedUrl = await applyWatermark(selectedFile);
        
        fileData = {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileUrl: URL.createObjectURL(selectedFile),
          watermarkedUrl
        };
      }
      
      addProject({
        name,
        previewUrl: projectType === 'url' ? previewUrl : '',
        fileData,
        customerEmail,
        expiresAt: hasExpiry ? new Date(expiryDate).toISOString() : null,
        hasPassword,
        password: hasPassword ? password : undefined,
        progress
      });
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: 'Project created',
        description: 'Email with magic link has been sent to the client',
      });
      
      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create project',
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
                
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="text-lg font-medium">Security Options</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="expiry-toggle" className="text-designer-text-primary">
                        Set Expiration Date
                      </Label>
                      <p className="text-xs text-designer-text-secondary">
                        The approval link will expire after this date
                      </p>
                    </div>
                    <Switch
                      id="expiry-toggle"
                      checked={hasExpiry}
                      onCheckedChange={setHasExpiry}
                    />
                  </div>
                  
                  {hasExpiry && (
                    <div className="space-y-2 pl-6 border-l-2 border-white/10">
                      <Label htmlFor="expiry-date" className="text-designer-text-primary">
                        Expiration Date
                      </Label>
                      <Input
                        id="expiry-date"
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        min={new Date().toISOString().split('T')[0]}
                        required={hasExpiry}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="password-toggle" className="text-designer-text-primary">
                        Password Protection
                      </Label>
                      <p className="text-xs text-designer-text-secondary">
                        Require a password to access the preview
                      </p>
                    </div>
                    <Switch
                      id="password-toggle"
                      checked={hasPassword}
                      onCheckedChange={setHasPassword}
                    />
                  </div>
                  
                  {hasPassword && (
                    <div className="space-y-2 pl-6 border-l-2 border-white/10">
                      <Label htmlFor="password" className="text-designer-text-primary">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="text"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        required={hasPassword}
                      />
                      <p className="text-xs text-designer-text-secondary">
                        This password will be shared with the client in the email
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/admin/dashboard')}
                  className="border-white/10 hover:bg-white/10 text-designer-text-primary"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create & Send Approval Link'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CreateProject;
