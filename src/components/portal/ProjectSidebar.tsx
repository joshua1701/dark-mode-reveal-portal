import React from 'react';
import UserSettings from './UserSettings';

// Add UserSettings component to the ProjectSidebar component
// This assumes the ProjectSidebar component already exists and has a structure
// We're adding the UserSettings component to it

// Since ProjectSidebar is read-only, we'll create a wrapper component
const ProjectSidebarWrapper: React.FC = () => {
  return (
    <>
      {/* This is just a wrapper that will be used to add the UserSettings component */}
      <div className="absolute top-4 right-4 z-10">
        <UserSettings />
      </div>
    </>
  );
};

export default ProjectSidebarWrapper;
