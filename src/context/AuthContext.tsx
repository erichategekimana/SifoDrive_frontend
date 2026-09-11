import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../core/models/User';
import { AuthService } from '../core/services/AuthService';
import { Logger } from '../core/utils/Logger';

const logger = new Logger('AuthContext');

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (phoneNumber: string, purpose?: 'LOGIN' | 'REGISTRATION' | 'PASSWORD_RESET') => Promise<void>;
  verifyOtp: (phoneNumber: string, otpCode: string, purpose?: 'LOGIN' | 'REGISTRATION') => Promise<User>;
  registerGuest: (payload: {
    first_name: string;
    last_name: string;
    phone_number: string;
    password?: string;
    terms_of_service_accepted: boolean;
  }) => Promise<{ phone_number: string }>;
  registerStudent: (payload: {
    first_name: string;
    last_name: string;
    phone_number: string;
    password?: string;
    terms_of_service_accepted: boolean;
    privacy_policy_accepted: boolean;
    national_id?: string;
  }) => Promise<{ phone_number: string }>;
  acceptConsent: (type: 'terms' | 'privacy') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginDemoUser: (role?: 'GUEST' | 'STUDENT') => User;
  needsLegalConsent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authService = AuthService.getInstance();
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const stored = authService.getStoredUser();
    if (stored?.id === 'usr-demo-001') {
      setIsLoading(false);
      return;
    }
    try {
      const freshUser = await authService.getProfile();
      setUser(freshUser);
    } catch (e) {
      logger.warn('Failed to refresh user profile from server:', e);
    } finally {
      setIsLoading(false);
    }
  }, [authService]);

  useEffect(() => {
    const handleAuthExpired = () => {
      logger.info('Session expired event received');
      setUser(null);
    };

    window.addEventListener('sifo:auth-expired', handleAuthExpired);

    // If user exists locally, verify token / refresh profile
    if (user) {
      refreshUser();
    } else {
      setIsLoading(false);
    }

    return () => {
      window.removeEventListener('sifo:auth-expired', handleAuthExpired);
    };
  }, []);

  const requestOtp = async (phoneNumber: string, purpose: 'LOGIN' | 'REGISTRATION' | 'PASSWORD_RESET' = 'LOGIN') => {
    await authService.requestOtp(phoneNumber, purpose);
  };

  const verifyOtp = async (phoneNumber: string, otpCode: string, purpose: 'LOGIN' | 'REGISTRATION' = 'LOGIN') => {
    const authenticatedUser = await authService.verifyOtp(phoneNumber, otpCode, purpose);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const registerGuest = async (payload: {
    first_name: string;
    last_name: string;
    phone_number: string;
    password?: string;
    terms_of_service_accepted: boolean;
  }) => {
    return authService.registerGuest(payload);
  };

  const registerStudent = async (payload: {
    first_name: string;
    last_name: string;
    phone_number: string;
    password?: string;
    terms_of_service_accepted: boolean;
    privacy_policy_accepted: boolean;
    national_id?: string;
  }) => {
    return authService.registerStudent(payload);
  };

  const acceptConsent = async (type: 'terms' | 'privacy') => {
    if (type === 'terms') {
      await authService.acceptTermsOfService();
    } else {
      await authService.acceptPrivacyPolicy();
    }
    await refreshUser();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const loginDemoUser = (role: 'GUEST' | 'STUDENT' = 'STUDENT') => {
    const demoUser = new User({
      id: 'usr-demo-001',
      phone_number: '+250788123456',
      first_name: 'Jean',
      last_name: 'Mugisha',
      role: role,
      status: 'ACTIVE',
      student_id: 'SD-2026-RW-009',
      terms_accepted: true,
      privacy_accepted: true,
    });
    authService.setStoredUser(demoUser);
    localStorage.setItem('sifo_tokens', JSON.stringify({
      access: 'demo-access-token',
      refresh: 'demo-refresh-token',
    }));
    setUser(demoUser);
    return demoUser;
  };

  const needsLegalConsent = Boolean(user && (!user.termsAccepted || (user.isStudent() && !user.privacyAccepted)));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        requestOtp,
        verifyOtp,
        registerGuest,
        registerStudent,
        acceptConsent,
        logout,
        refreshUser,
        loginDemoUser,
        needsLegalConsent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
