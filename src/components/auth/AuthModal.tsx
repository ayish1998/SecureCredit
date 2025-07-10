import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'forgot-password' && 'Reset Password'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {mode === 'login' && (
            <LoginForm
              onSwitchToRegister={() => setMode('register')}
              onForgotPassword={() => setMode('forgot-password')}
            />
          )}
          {mode === 'register' && (
            <RegisterForm
              onSwitchToLogin={() => setMode('login')}
            />
          )}
          {mode === 'forgot-password' && (
            <ForgotPasswordForm
              onBackToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};