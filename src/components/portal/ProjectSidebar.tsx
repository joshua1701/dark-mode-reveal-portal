
import React from 'react';
import UserSettings from './UserSettings';
import { Project, ProjectStatus } from '@/types/project';

// Define the props interface for ProjectSidebar
interface ProjectSidebarProps {
  project: Project;
  onStatusChange: (status: ProjectStatus) => void;
  handleCopyLink: () => void;
  language: 'en' | 'de';
  isExpired: boolean;
}

// Create a wrapper component
const ProjectSidebarWrapper: React.FC<ProjectSidebarProps> = (props) => {
  return (
    <>
      {/* This is just a wrapper that will be used to add the UserSettings component */}
      <div className="absolute top-4 right-4 z-10">
        <UserSettings />
      </div>
      {/* We would pass the props to the actual ProjectSidebar here if it existed */}
    </>
  );
};

export default ProjectSidebarWrapper;
