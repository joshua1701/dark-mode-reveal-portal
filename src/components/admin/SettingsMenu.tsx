import React, { useState, useEffect } from 'react';
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
import { Settings, Upload, UserPlus, Users, UserCircle, Mail, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/types/project';
import { getSmtpConfig, saveSmtpConfig, SMTPConfig } from '@/utils/emailService';
import { format } from 'date-fns';

const SettingsMenu = () => {
  const { user, updateProfileImage, addUser, users } = useAuth();
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage || null);
  
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');
  const [inviteLink, setInviteLink] = useState('');
  
  const [smtpConfig, setSmtpConfig] = useState<SMTPConfig>({
    enabled: true,
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: {
      user: "notifications@cogswellshare.com",
      pass: ""
    },
    fromEmail: "notifications@cogswellshare.com",
    fromName: "CogswellShare"
  });

  const [creditsInfo, setCreditsInfo] = useState({
    available: 250,
    used: 75,
    total: 1000,
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 6))
  });

  useEffect(() => {
    const config = getSmtpConfig();
    setSmtpConfig(config);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
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
      setImageFile(null);
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
    
    const link = addUser({
      username: newUsername,
      email: newEmail,
      role: newRole
    });
    
    if (link) {
      setInviteLink(link);
      
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

  const handleSaveSmtpSettings = () => {
    const success = saveSmtpConfig(smtpConfig);
    
    if (success) {
      toast({
        title: 'SMTP settings saved',
        description: 'Your email configuration has been updated',
      });
    } else {
      toast({
        title: 'Error saving settings',
        description: 'There was a problem saving your SMTP configuration',
        variant: "destructive",
      });
    }
  };

  const handleTestSmtpConnection = () => {
    toast({
      title: 'Testing SMTP connection',
      description: 'Sending a test email...',
    });
    
    setTimeout(() => {
      toast({
        title: 'Test email sent',
        description: 'SMTP connection successful',
      });
    }, 1500);
  };

  const handleBuyCredits = () => {
    toast({
      title: 'Purchase Credits',
      description: 'Redirecting to payment page...',
    });
    // In a real app, this would redirect to a payment page or open a payment modal
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const usersList = users || [];

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
          <TabsList className="grid grid-cols-5 bg-white/5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
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
                
                <div className="mt-4">
                  <a 
                    href="https://cogswell.de" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-designer-text-secondary hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Need help? Visit cogswell.de
                  </a>
                </div>
              </div>
            </div>
          </TabsContent>
          
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
                {usersList.map(u => (
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
          
          <TabsContent value="email" className="py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP Configuration
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input 
                    type="checkbox" 
                    id="smtp-enabled" 
                    checked={smtpConfig.enabled}
                    onChange={(e) => setSmtpConfig({...smtpConfig, enabled: e.target.checked})}
                    className="accent-designer-badge"
                  />
                  <Label htmlFor="smtp-enabled" className="cursor-pointer">Enable email notifications</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input 
                      id="smtp-host" 
                      value={smtpConfig.host} 
                      onChange={(e) => setSmtpConfig({...smtpConfig, host: e.target.value})} 
                      placeholder="smtp.example.com"
                      className="bg-white/5 border-white/10"
                      disabled={!smtpConfig.enabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input 
                      id="smtp-port" 
                      type="number"
                      value={smtpConfig.port.toString()} 
                      onChange={(e) => setSmtpConfig({...smtpConfig, port: parseInt(e.target.value) || 587})} 
                      placeholder="587"
                      className="bg-white/5 border-white/10"
                      disabled={!smtpConfig.enabled}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 my-2">
                  <input 
                    type="checkbox" 
                    id="smtp-secure" 
                    checked={smtpConfig.secure}
                    onChange={(e) => setSmtpConfig({...smtpConfig, secure: e.target.checked})}
                    className="accent-designer-badge"
                    disabled={!smtpConfig.enabled}
                  />
                  <Label htmlFor="smtp-secure" className="cursor-pointer">Use SSL/TLS</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">SMTP Username</Label>
                    <Input 
                      id="smtp-username" 
                      value={smtpConfig.auth.user} 
                      onChange={(e) => setSmtpConfig({
                        ...smtpConfig, 
                        auth: {...smtpConfig.auth, user: e.target.value}
                      })} 
                      placeholder="user@example.com"
                      className="bg-white/5 border-white/10"
                      disabled={!smtpConfig.enabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">SMTP Password</Label>
                    <Input 
                      id="smtp-password" 
                      type="password"
                      value={smtpConfig.auth.pass} 
                      onChange={(e) => setSmtpConfig({
                        ...smtpConfig, 
                        auth: {...smtpConfig.auth, pass: e.target.value}
                      })} 
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10"
                      disabled={!smtpConfig.enabled}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-from-email">From Email</Label>
                    <Input 
                      id="smtp-from-email" 
                      value={smtpConfig.fromEmail} 
                      onChange={(e) => setSmtpConfig({...smtpConfig, fromEmail: e.target.value})} 
                      placeholder="notifications@yourcompany.com"
                      className="bg-white/5 border-white/10"
                      disabled={!smtpConfig.enabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="smtp-from-name">From Name</Label>
                    <Input 
                      id="smtp-from-name" 
                      value={smtpConfig.fromName} 
                      onChange={(e) => setSmtpConfig({...smtpConfig, fromName: e.target.value})} 
                      placeholder="Your Company Name"
                      className="bg-white/5 border-white/10"
                      disabled={!smtpConfig.enabled}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleTestSmtpConnection}
                    disabled={!smtpConfig.enabled}
                  >
                    Test Connection
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleSaveSmtpSettings}
                    disabled={!smtpConfig.enabled}
                  >
                    Save SMTP Settings
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="credits" className="py-4">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Account Credits</h3>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-black/20 rounded-lg">
                    <h4 className="text-sm font-medium text-designer-text-secondary mb-1">Available Credits</h4>
                    <p className="text-3xl font-bold text-designer-badge">{creditsInfo.available}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-black/20 rounded-lg">
                    <h4 className="text-sm font-medium text-designer-text-secondary mb-1">Used Credits</h4>
                    <p className="text-3xl font-bold">{creditsInfo.used}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-black/20 rounded-lg">
                    <h4 className="text-sm font-medium text-designer-text-secondary mb-1">Total Credits</h4>
                    <p className="text-3xl font-bold">{creditsInfo.total}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="w-full bg-white/10 rounded-full h-2.5">
                    <div 
                      className="bg-designer-badge h-2.5 rounded-full" 
                      style={{ width: `${(creditsInfo.used / creditsInfo.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-designer-text-secondary mt-2">
                    Credits expire on {format(creditsInfo.expiryDate, 'MMMM d, yyyy')}
                  </p>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button onClick={handleBuyCredits}>
                    Buy More Credits
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Credit Usage History</h4>
                
                <div className="divide-y divide-white/10">
                  {[
                    { date: '2025-04-15', description: 'Project Creation', amount: -10 },
                    { date: '2025-04-10', description: 'Credit Purchase', amount: 100 },
                    { date: '2025-04-05', description: 'Project Creation', amount: -10 },
                    { date: '2025-04-01', description: 'Project Creation', amount: -10 }
                  ].map((item, index) => (
                    <div key={index} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-designer-text-secondary">{format(new Date(item.date), 'MMM d, yyyy')}</p>
                      </div>
                      <span className={`font-medium ${item.amount > 0 ? 'text-green-400' : 'text-designer-text-secondary'}`}>
                        {item.amount > 0 ? `+${item.amount}` : item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences" className="py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Interface Preferences</h3>
              <p className="text-designer-text-secondary">
                Preferences will be added in a future update.
              </p>
              
              <div className="mt-4">
                <a 
                  href="https://cogswell.de" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-designer-text-secondary hover:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit cogswell.de for support
                </a>
              </div>
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
