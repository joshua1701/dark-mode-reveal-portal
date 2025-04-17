
import { useState } from 'react';
import { Project } from '@/types/project';

export const usePortalCore = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [zoom, setZoom] = useState(1);
  const [language, setLanguage] = useState<'en' | 'de'>('en');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkErrorDetails, setLinkErrorDetails] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add the missing state variables
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const handleLanguageChange = (newLanguage: 'en' | 'de') => {
    setLanguage(newLanguage);
  };

  return {
    project,
    setProject,
    viewport,
    setViewport,
    zoom,
    setZoom,
    language,
    setLanguage,
    handleLanguageChange,
    isVerifying,
    setIsVerifying,
    isVerified,
    setIsVerified,
    isExpired,
    setIsExpired,
    linkError,
    setLinkError,
    linkErrorDetails,
    setLinkErrorDetails,
    isSubmitting,
    setIsSubmitting,
    // Add the new properties to the return value
    isRejectModalOpen,
    setIsRejectModalOpen,
    showRatingModal,
    setShowRatingModal
  };
};
