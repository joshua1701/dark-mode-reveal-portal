
import React from 'react';
import { usePortal } from '@/hooks/usePortal';
import PortalLoading from '@/components/portal/PortalLoading';
import PortalLayout from '@/components/portal/PortalLayout';
import TokenModal from '@/components/portal/TokenModal';
import PasswordModal from '@/components/portal/PasswordModal';
import RejectionModal from '@/components/portal/RejectionModal';
import RatingModal from '@/components/portal/RatingModal';
import ExpiryNotice from '@/components/portal/ExpiryNotice';
import ProjectNotFound from '@/components/portal/ProjectNotFound';
import { useNavigate } from 'react-router-dom';

const Portal = () => {
  const navigate = useNavigate();
  const {
    project,
    viewport,
    setViewport,
    zoom,
    setZoom,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    password,
    setPassword,
    passwordError,
    isVerified,
    isVerifying,
    isRejectModalOpen,
    setIsRejectModalOpen,
    rejectionReason,
    setRejectionReason,
    showRatingModal,
    setShowRatingModal,
    rating,
    setRating,
    language,
    isExpired,
    isTokenModalOpen,
    setIsTokenModalOpen,
    token,
    setToken,
    tokenError,
    isSubmitting,
    handlePasswordSubmit,
    handleTokenSubmit,
    handleCopyLink,
    handleStatusChange,
    handleReject,
    handleRatingSubmit,
    handleDownload,
    handleLanguageChange
  } = usePortal();
  
  if (isVerifying) {
    return <PortalLoading />;
  }

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
  
  if (!project) {
    return <ProjectNotFound language={language} onNavigateHome={() => navigate('/')} />;
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
