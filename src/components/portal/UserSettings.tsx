
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Upload, UserCircle } from 'lucide-react';

const UserSettings = () => {
  const { user, updateProfileImage } = useAuth();
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (imagePreview) {
      updateProfileImage(imagePreview);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          {user.profileImage ? (
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={user.profileImage} alt={user.username} />
              <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
            </Avatar>
          ) : (
            <UserCircle className="h-4 w-4 mr-2" />
          )}
          {user.username}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-black/80 border-white/10">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your profile settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={imagePreview || undefined} alt={user.username} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.username)}
              </AvatarFallback>
            </Avatar>
            
            <div className="mt-4 space-y-2 w-full max-w-xs">
              <Label htmlFor="profile-image" className="cursor-pointer w-full">
                <div className="flex items-center justify-center gap-2 py-2 px-3 border border-white/10 rounded-md hover:bg-white/5 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload Image</span>
                </div>
                <Input 
                  id="profile-image" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </Label>
              
              {imageFile && (
                <Button onClick={handleUpload} className="w-full">
                  Save Image
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={user.username} disabled className="bg-white/5" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="bg-white/5" />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettings;
