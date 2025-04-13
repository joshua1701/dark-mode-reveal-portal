
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

type ProjectSecurityOptionsProps = {
  hasExpiry: boolean;
  setHasExpiry: (hasExpiry: boolean) => void;
  expiryDate: string;
  setExpiryDate: (date: string) => void;
  hasPassword: boolean;
  setHasPassword: (hasPassword: boolean) => void;
  password: string;
  setPassword: (password: string) => void;
};

const ProjectSecurityOptions: React.FC<ProjectSecurityOptionsProps> = ({
  hasExpiry,
  setHasExpiry,
  expiryDate,
  setExpiryDate,
  hasPassword,
  setHasPassword,
  password,
  setPassword,
}) => {
  return (
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
  );
};

export default ProjectSecurityOptions;
