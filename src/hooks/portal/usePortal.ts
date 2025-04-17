
import { usePortalCore } from './usePortalCore';
import { usePortalProject } from './usePortalProject';
import { usePortalModals } from './usePortalModals';
import { usePortalStatus } from './usePortalStatus';
import { usePortalNavigation } from './usePortalNavigation';
import { ProjectStatus } from '@/types/project';

export const usePortal = () => {
  const portalCore = usePortalCore();
  const { authLoading, handleCopyLink, handleDownload } = usePortalProject(portalCore);
  
  const { 
    isPasswordModalOpen, setIsPasswordModalOpen,
    password, setPassword,
    passwordError, handlePasswordSubmit,
    isTokenModalOpen, setIsTokenModalOpen,
    token, setToken,
    tokenError, handleTokenSubmit,
    isRejectModalOpen, setIsRejectModalOpen,
    rejectionReason, setRejectionReason,
    showRatingModal, setShowRatingModal,
    rating, setRating,
    handleNavigateHome
  } = usePortalModals({
    ...portalCore,
    setIsRejectModalOpen: (open: boolean) => portalCore.setIsSubmitting(false),
    setShowRatingModal: (open: boolean) => portalCore.setIsSubmitting(false)
  });
  
  const { handleStatusChange, handleReject, handleRatingSubmit } = usePortalStatus({
    ...portalCore,
    setIsRejectModalOpen,
    setShowRatingModal
  });
  
  usePortalNavigation();
  
  // Fix for isRejectModalOpen and rejectionReason
  const onStatusChange = (status: ProjectStatus) => {
    handleStatusChange(status);
  };
  
  const onReject = () => {
    handleReject(rejectionReason);
  };
  
  const onRatingSubmit = () => {
    handleRatingSubmit(rating);
  };

  return {
    project: portalCore.project,
    viewport: portalCore.viewport,
    setViewport: portalCore.setViewport,
    zoom: portalCore.zoom,
    setZoom: portalCore.setZoom,
    language: portalCore.language,
    handleLanguageChange: portalCore.handleLanguageChange,
    isVerifying: portalCore.isVerifying,
    isVerified: portalCore.isVerified,
    authLoading,
    linkError: portalCore.linkError,
    linkErrorDetails: portalCore.linkErrorDetails,
    isExpired: portalCore.isExpired,
    
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    password,
    setPassword,
    passwordError,
    handlePasswordSubmit,
    
    isRejectModalOpen,
    setIsRejectModalOpen,
    rejectionReason,
    setRejectionReason,
    handleReject: onReject,
    
    isSubmitting: portalCore.isSubmitting,
    
    showRatingModal,
    setShowRatingModal,
    rating,
    setRating,
    handleRatingSubmit: onRatingSubmit,
    
    isTokenModalOpen,
    setIsTokenModalOpen,
    token,
    setToken,
    tokenError,
    handleTokenSubmit,
    
    handleStatusChange: onStatusChange,
    handleCopyLink,
    handleDownload,
    handleNavigateHome
  };
};
