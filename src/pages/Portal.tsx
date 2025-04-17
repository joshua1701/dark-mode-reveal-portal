import React from 'react';
import { usePortal } from '@/hooks/portal';
import TokenModal from '@/components/portal/TokenModal';
import PortalLayout from '@/components/portal/PortalLayout';
import ProjectNotFound from '@/components/portal/ProjectNotFound';
import PasswordModal from '@/components/portal/PasswordModal';
import RejectionModal from '@/components/portal/RejectionModal';
import RatingModal from '@/components/portal/RatingModal';
import ExpiryNotice from '@/components/portal/ExpiryNotice';
import LoadingState from '@/components/portal/LoadingState';

const Portal = () => {
  const {
    project,
    viewport,
    setViewport,
    zoom,
    setZoom,
    language,
    handleLanguageChange,
    isVerifying,
    isVerified,
    authLoading,
    linkError,
    linkErrorDetails,
    isExpired,
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
    handleReject,
    isSubmitting,
    showRatingModal,
    setShowRatingModal,
    rating,
    setRating,
    handleRatingSubmit,
    isTokenModalOpen,
    setIsTokenModalOpen,
    token,
    setToken,
    tokenError,
    handleTokenSubmit,
    handleStatusChange,
    handleCopyLink,
    handleDownload,
    handleNavigateHome
  } = usePortal();
  
  if (authLoading || isVerifying) {
    return <LoadingState />;
  }

  // Token input modal
  if (isTokenModalOpen) {
    return (
      <TokenModal
        isOpen={isTokenModalOpen}
        onOpenChange={setIsTokenModalOpen}
        token={token}
        setToken={setToken}
        tokenError={tokenError}
        onSubmit={handleTokenSubmit}
        language={language}
      />
    );
  }
  
  if (linkError || !project) {
    return <ProjectNotFound 
      language={language} 
      onNavigateHome={handleNavigateHome} 
      errorDetails={linkErrorDetails || undefined}
    />;
  }
  
  return (
    <>
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        password={password}
        setPassword={setPassword}
        passwordError={passwordError}
        onSubmit={handlePasswordSubmit}
        language={language}
      />
      
      <RejectionModal
        isOpen={isRejectModalOpen}
        onOpenChange={setIsRejectModalOpen}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onSubmit={handleReject}
        language={language}
        isSubmitting={isSubmitting}
      />
      
      <RatingModal
        isOpen={showRatingModal}
        onOpenChange={setShowRatingModal}
        rating={rating}
        setRating={setRating}
        onSubmit={handleRatingSubmit}
        language={language}
        isSubmitting={isSubmitting}
      />
      
      {isExpired && (
        <ExpiryNotice language={language} />
      )}
      
      {isVerified && (
        <PortalLayout
          project={project}
          viewport={viewport}
          setViewport={setViewport}
          zoom={zoom}
          setZoom={setZoom}
          language={language}
          onLanguageChange={handleLanguageChange}
          onStatusChange={handleStatusChange}
          onCopyLink={handleCopyLink}
          onDownload={handleDownload}
          isExpired={isExpired}
        />
      )}
    </>
  );
};

export default Portal;
