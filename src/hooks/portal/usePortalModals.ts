
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const usePortalModals = (
  portalCore: ReturnType<typeof import('./usePortalCore').usePortalCore>
) => {
  const { project, setIsVerified, language } = portalCore;
  const { verifyMagicLink } = useAuth();
  const navigate = useNavigate();

  // Password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Token modal state
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState('');

  // Rejection modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);

  const handlePasswordSubmit = () => {
    if (!project) return;
    
    if (password === project.password) {
      setIsPasswordModalOpen(false);
      setIsVerified(true);
      setPasswordError('');
    } else {
      setPasswordError(language === 'en' ? 
        'Incorrect password. Please try again.' : 
        'Falsches Passwort. Bitte versuchen Sie es erneut.');
    }
  };

  const handleTokenSubmit = async () => {
    const parts = token.trim().split(':');
    if (parts.length !== 2) {
      setTokenError(language === 'en' ? 
        'Invalid token format. Please try again.' : 
        'Ungültiges Token-Format. Bitte versuchen Sie es erneut.');
      return;
    }

    const [id, key] = parts;
    const isValid = await verifyMagicLink(id, key);

    if (isValid) {
      navigate(`/portal?id=${id}&key=${key}`);
    } else {
      setTokenError(language === 'en' ? 
        'Invalid token. Please try again.' : 
        'Ungültiger Token. Bitte versuchen Sie es erneut.');
    }
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  return {
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    password,
    setPassword,
    passwordError,
    handlePasswordSubmit,
    
    isTokenModalOpen,
    setIsTokenModalOpen,
    token,
    setToken,
    tokenError,
    handleTokenSubmit,
    
    isRejectModalOpen,
    setIsRejectModalOpen,
    rejectionReason,
    setRejectionReason,
    
    showRatingModal,
    setShowRatingModal,
    rating,
    setRating,
    
    handleNavigateHome
  };
};
