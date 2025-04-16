
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Upload, UserPlus, Users, UserCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/types/project';

const SettingsMenu = () => {
  const { user, updateProfileImage, addUser, users } = useAuth();
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage || null);
  
  // Add user form state
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');
  const [inviteLink, setInviteLink] = useState('');

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
  
  const handleAddUser = () => {
    if (!newUsername || !newEmail) {
      toast({
        title: 'Missing information',
        description: 'Please provide both username and email',
        variant: 'destructive',
      });
      return;
    }
    
    const link = addUser(newUsername, newEmail, newRole);
    if (link) {
      setInviteLink(link);
      
      // Reset form
      setNewUsername('');
      setNewEmail('');
    }
  };
  
  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: 'Link copied',
      description: 'Invitation link has been copied to clipboard',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-designer-text-secondary hover:text-white hover:bg-white/10"
        >
          <Settings className="h-4 w-4 mr-1" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-black/80 border-white/10">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="mt-4">
          <TabsList className="grid grid-cols-3 bg-white/5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 py-4">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={imagePreview || undefined} alt={user?.username} />
                  <AvatarFallback className="text-2xl">
                    {user ? getInitials(user.username) : 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="mt-4 space-y-2">
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
              
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user?.username} disabled className="bg-white/5" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email} disabled className="bg-white/5" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={user?.role} disabled className="bg-white/5" />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Add New User</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-username">Username</Label>
                  <Input 
                    id="new-username" 
                    value={newUsername} 
                    onChange={(e) => setNewUsername(e.target.value)} 
                    placeholder="Enter username"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email</Label>
                  <Input 
                    id="new-email" 
                    type="email"
                    value={newEmail} 
                    onChange={(e) => setNewEmail(e.target.value)} 
                    placeholder="Enter email"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="role-admin" 
                      name="role"
                      value="admin"
                      checked={newRole === 'admin'}
                      onChange={() => setNewRole('admin')}
                      className="accent-designer-badge"
                    />
                    <Label htmlFor="role-admin" className="cursor-pointer">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      id="role-customer" 
                      name="role"
                      value="customer"
                      checked={newRole === 'customer'}
                      onChange={() => setNewRole('customer')}
                      className="accent-designer-badge"
                    />
                    <Label htmlFor="role-customer" className="cursor-pointer">Customer</Label>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleAddUser} className="mt-2">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              
              {inviteLink && (
                <div className="p-3 mt-4 bg-white/5 border border-white/10 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Invitation Link</span>
                    <Button size="sm" variant="outline" onClick={handleCopyInviteLink}>
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-designer-text-secondary break-all">{inviteLink}</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-medium mb-4">Existing Users</h3>
              
              <div className="divide-y divide-white/10">
                {users.map(u => (
                  <div key={u.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.profileImage} />
                        <AvatarFallback>{getInitials(u.username)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-sm text-designer-text-secondary">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                        {u.role}
                      </span>
                      {u.id === user?.id && (
                        <span className="text-xs px-2 py-1 rounded-full bg-designer-badge/20 text-designer-badge">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Preferences Tab */}
          <TabsContent value="preferences" className="py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Interface Preferences</h3>
              <p className="text-designer-text-secondary">
                Preferences will be added in a future update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsMenu;
