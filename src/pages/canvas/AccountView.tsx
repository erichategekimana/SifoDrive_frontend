import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Settings as SettingsIcon,
  ShieldCheck,
  TrendingUp,
  Save,
  CheckCircle2,
  Key,
  Smartphone,
  Sparkles,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Link2,
  ExternalLink,
  Plus,
  Globe,
  X,
  AlertCircle,
  Camera,
  Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/I18nContext';
import { AuthService } from '../../core/services/AuthService';

export const AccountView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const authService = AuthService.getInstance();

  const isDark = theme === 'dark';

  // Active section inside Account: settings, profile, security, progress
  const [activeTab, setActiveTab] = useState<'settings' | 'profile' | 'security' | 'progress'>('settings');

  // --- SETTINGS STATE ---
  const [notifPrefs, setNotifPrefs] = useState({
    sms_enabled: true,
    email_enabled: false,
    exam_alerts: true,
    booking_alerts: true,
    promo_alerts: false,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Ways to Contact state
  const [contactMethods, setContactMethods] = useState<Array<{ type: string; value: string; is_primary?: boolean }>>([]);
  const [newContactType, setNewContactType] = useState<string>('email');
  const [newContactValue, setNewContactValue] = useState<string>('');
  const [contactNotice, setContactNotice] = useState<string | null>(null);

  // --- PROFILE STATE ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [biography, setBiography] = useState(user?.biography || '');
  const [links, setLinks] = useState<Array<{ title: string; url: string }>>(user?.links || []);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Device Photo Upload state
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- SECURITY STATE ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(user?.twoFactorEnabled ?? false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'phone' | 'email'>(user?.twoFactorMethod ?? 'phone');
  const [twoFactorNotice, setTwoFactorNotice] = useState<string | null>(null);
  const [isSaving2FA, setIsSaving2FA] = useState(false);

  // Active Sessions state
  const [activeSessions, setActiveSessions] = useState<Array<{ id: string; ip_address: string; user_agent: string; last_active: string | null; is_current: boolean }>>([]);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Sync user state when user object loads/changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setBiography(user.biography || '');
      setLinks(user.links || []);
      setContactMethods(user.contactMethods || []);
      setTwoFactorEnabled(user.twoFactorEnabled);
      setTwoFactorMethod(user.twoFactorMethod || 'phone');
    }
  }, [user]);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewPhotoUrl) {
        URL.revokeObjectURL(previewPhotoUrl);
      }
    };
  }, [previewPhotoUrl]);

  // Handle modal escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isChangePasswordModalOpen && !isChangingPassword) {
        setIsChangePasswordModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isChangePasswordModalOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isChangePasswordModalOpen, isChangingPassword]);

  // Load notification preferences and active sessions on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const prefs = await authService.getNotificationPreferences();
        if (prefs) {
          setNotifPrefs(prefs);
        }
      } catch {
        // Fallback already provided in authService
      }

      try {
        setIsLoadingSessions(true);
        const sessions = await authService.getActiveSessions();
        setActiveSessions(sessions);
      } catch {
        // Fallback handled in authService
      } finally {
        setIsLoadingSessions(false);
      }
    };
    loadData();
  }, []);

  // --- HANDLERS: SETTINGS ---
  const handleToggleNotif = async (key: keyof typeof notifPrefs, val: boolean) => {
    const updated = { ...notifPrefs, [key]: val };
    setNotifPrefs(updated);
    setNotifSaving(true);
    try {
      await authService.updateNotificationPreferences(updated);
      setNotifSuccess(true);
      setTimeout(() => setNotifSuccess(false), 2500);
    } catch {
      // Ignored
    } finally {
      setNotifSaving(false);
    }
  };

  const handleAddContactMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactValue.trim()) return;

    const updated = [...contactMethods, { type: newContactType, value: newContactValue.trim(), is_primary: contactMethods.length === 0 }];
    setContactMethods(updated);
    setNewContactValue('');
    try {
      await updateProfile({ contactMethods: updated, contact_methods: updated });
      setContactNotice(t('accountView.savedSuccess'));
      setTimeout(() => setContactNotice(null), 3000);
    } catch (err: any) {
      setContactNotice(err.message || 'Error saving contact method');
    }
  };

  const handleRemoveContactMethod = async (indexToRemove: number) => {
    const updated = contactMethods.filter((_, idx) => idx !== indexToRemove);
    setContactMethods(updated);
    try {
      await updateProfile({ contactMethods: updated, contact_methods: updated });
      setContactNotice(t('accountView.savedSuccess'));
      setTimeout(() => setContactNotice(null), 3000);
    } catch (err: any) {
      setContactNotice(err.message || 'Error removing contact method');
    }
  };

  // --- HANDLERS: PROFILE ---
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('Photo size exceeds 5MB limit.');
        return;
      }
      setProfileError(null);
      setSelectedPhotoFile(file);
      setRemoveExistingPhoto(false);
      if (previewPhotoUrl) {
        URL.revokeObjectURL(previewPhotoUrl);
      }
      setPreviewPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleClearPhoto = () => {
    if (previewPhotoUrl) {
      URL.revokeObjectURL(previewPhotoUrl);
      setPreviewPhotoUrl(null);
    }
    setSelectedPhotoFile(null);
    setRemoveExistingPhoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    setLinks([...links, { title: newLinkTitle.trim(), url: newLinkUrl.trim() }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      if (selectedPhotoFile || removeExistingPhoto) {
        // Use FormData for device image file upload
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        if (email) formData.append('email', email);
        formData.append('biography', biography);
        formData.append('links', JSON.stringify(links));
        if (selectedPhotoFile) {
          formData.append('profile_photo', selectedPhotoFile);
        } else if (removeExistingPhoto) {
          formData.append('profile_photo', '');
        }
        await updateProfile(formData);
      } else {
        // Standard JSON payload
        await updateProfile({
          firstName,
          lastName,
          email,
          biography,
          links,
        });
      }

      setProfileSuccess(true);
      setIsEditingProfile(false);
      setSelectedPhotoFile(null);
      setRemoveExistingPhoto(false);
      setTimeout(() => setProfileSuccess(false), 3500);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelEditProfile = () => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setBiography(user.biography || '');
      setLinks(user.links || []);
    }
    if (previewPhotoUrl) {
      URL.revokeObjectURL(previewPhotoUrl);
      setPreviewPhotoUrl(null);
    }
    setSelectedPhotoFile(null);
    setRemoveExistingPhoto(false);
    setIsEditingProfile(false);
    setProfileError(null);
  };

  // --- HANDLERS: SECURITY ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordNotice({ text: t('accountView.passwordMinChars'), isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ text: t('accountView.passwordsDoNotMatch'), isError: true });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPasswordNotice({ text: t('accountView.passwordUpdated'), isError: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
      }, 1000);
      setTimeout(() => setPasswordNotice(null), 5000);
    } catch (err: any) {
      setPasswordNotice({ text: err.message || 'Failed to change password. Please check your current password.', isError: true });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSave2FA = async (enabled: boolean, method: 'phone' | 'email') => {
    setIsSaving2FA(true);
    try {
      await updateProfile({
        twoFactorEnabled: enabled,
        two_factor_enabled: enabled,
        twoFactorMethod: method,
        two_factor_method: method,
      });
      setTwoFactorEnabled(enabled);
      setTwoFactorMethod(method);
      setTwoFactorNotice(t('accountView.savedSuccess'));
      setTimeout(() => setTwoFactorNotice(null), 3000);
    } catch (err: any) {
      setTwoFactorNotice(err.message || 'Failed to update 2FA settings');
    } finally {
      setIsSaving2FA(false);
    }
  };

  const handleTerminateOtherSessions = async () => {
    try {
      await authService.terminateOtherSessions();
      setSessionNotice(t('accountView.terminateSessionsSuccess'));
      const freshSessions = await authService.getActiveSessions();
      setActiveSessions(freshSessions);
      setTimeout(() => setSessionNotice(null), 4000);
    } catch (err: any) {
      setSessionNotice(err.message || 'Failed to terminate other sessions');
    }
  };

  const getRoleLabel = () => {
    if (user?.role === 'GUEST') return t('accountView.roleGuest');
    if (user?.role === 'TUTOR') return t('accountView.roleTutor');
    return t('accountView.roleStudent');
  };

  const getContactIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return <Mail size={14} color="#0055A5" />;
      case 'phone':
        return <Phone size={14} color="#058728" />;
      case 'linkedin':
        return <Link2 size={14} color="#0077B5" />;
      default:
        return <Globe size={14} color="#6B7280" />;
    }
  };

  const navItems: Array<{
    id: 'settings' | 'profile' | 'security' | 'progress';
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'settings', label: t('accountView.tabSettings'), icon: <SettingsIcon size={16} /> },
    { id: 'profile', label: t('accountView.tabProfile'), icon: <UserIcon size={16} /> },
    { id: 'security', label: t('accountView.tabSecurity'), icon: <ShieldCheck size={16} /> },
    { id: 'progress', label: t('accountView.tabProgress'), icon: <TrendingUp size={16} /> },
  ];

  // Resolve photo URL to show in avatar
  const currentPhotoUrl = previewPhotoUrl || (removeExistingPhoto ? null : user?.profilePhoto);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100%',
        width: '100%',
      }}
    >
      {/* Left Secondary Sub-Navigation Sidebar (Directly Connected to Canvas Blue Rail) */}
      <nav
        aria-label="Account Sub Navigation"
        className="account-sub-nav"
      >
        {/* User Identity Box Removed as requested! Navigation links start immediately */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`account-sub-nav-btn ${isActive ? 'active' : ''}`}
              >
                <span style={{ color: isActive ? (isDark ? '#38BDF8' : '#0055A5') : (isDark ? '#94A3B8' : '#6B7280'), display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Guest Upgrade Callout if in Guest Mode */}
        {user?.role === 'GUEST' && (
          <div
            style={{
              margin: '24px 12px 12px 12px',
              padding: '12px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E40AF', fontWeight: 700, marginBottom: '6px' }}>
              <Sparkles size={14} />
              <span>{t('accountView.upgradeNow')}</span>
            </div>
            <p style={{ color: '#1E3A8A', margin: '0 0 10px 0', fontSize: '0.75rem', lineHeight: '1.3' }}>
              {t('accountView.guestUpgradePrompt')}
            </p>
            <button
              type="button"
              onClick={() => navigate('/upgrade')}
              style={{
                width: '100%',
                padding: '6px 10px',
                backgroundColor: '#0055A5',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('accountView.upgradeNow')}
            </button>
          </div>
        )}
      </nav>

      {/* Right Content Area: Vertically Ordered Sections */}
      <div style={{ flex: 1, minWidth: 0, padding: '28px 36px 48px 36px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '850px' }}>

          {/* ========================================================================= */}
          {/* TAB 1: SETTINGS                                                           */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="canvas-card" style={{ padding: '24px' }}>
              <div className="account-card-header">
                <h2 className="account-card-title">
                  {t('accountView.settingsHeader')}
                </h2>
              </div>

              {contactNotice && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#F0FFF4',
                    border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #C6F6D5',
                    color: isDark ? '#34D399' : '#22543D',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                  }}
                >
                  <CheckCircle2 size={16} color={isDark ? '#34D399' : '#058728'} />
                  <span>{contactNotice}</span>
                </div>
              )}

              {/* Vertical Stack of Setting Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>

                {/* 1. Language Preference */}
                <div className="account-divider">
                  <label className="account-label" style={{ marginBottom: '4px' }}>
                    {t('accountView.languagePreference')}
                  </label>
                  <p className="account-subtext" style={{ margin: '0 0 12px 0' }}>
                    {t('accountView.languageDescription')}
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setLanguage('rw')}
                      style={{
                        padding: '8px 16px',
                        border: isDark ? '1px solid #38BDF8' : '1px solid #0055A5',
                        backgroundColor: language === 'rw' ? '#0055A5' : (isDark ? '#0F172A' : '#FFFFFF'),
                        color: language === 'rw' ? '#FFFFFF' : (isDark ? '#F1F5F9' : '#2D3B45'),
                        fontWeight: language === 'rw' ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {t('accountView.kinyarwanda')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      style={{
                        padding: '8px 16px',
                        border: isDark ? '1px solid #38BDF8' : '1px solid #0055A5',
                        backgroundColor: language === 'en' ? '#0055A5' : (isDark ? '#0F172A' : '#FFFFFF'),
                        color: language === 'en' ? '#FFFFFF' : (isDark ? '#F1F5F9' : '#2D3B45'),
                        fontWeight: language === 'en' ? 700 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {t('accountView.english')}
                    </button>
                  </div>
                </div>

                {/* 2. Light / Dark Mode Toggle (Canvas theme toggle strictly inside settings) */}
                <div className="account-divider">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <label className="account-label" style={{ margin: 0 }}>
                        {t('accountView.interfaceTheme')}
                      </label>
                      <p className="account-subtext" style={{ margin: '4px 0 0 0' }}>
                        {isDark ? t('accountView.darkTheme') : t('accountView.whiteTheme')}
                      </p>
                    </div>
                    <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isDark}
                        onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: isDark ? '#0055A5' : '#D1D5DB',
                          transition: '0.2s',
                          borderRadius: '12px',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          height: '18px',
                          width: '18px',
                          left: isDark ? '22px' : '3px',
                          bottom: '3px',
                          backgroundColor: '#FFFFFF',
                          transition: '0.2s',
                          borderRadius: '50%',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Notification Preferences */}
                <div className="account-divider">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <label className="account-label">
                      {t('accountView.notificationPreferences')}
                    </label>
                    {notifSaving && <span style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#6B7280' }}>Saving...</span>}
                    {notifSuccess && <span style={{ fontSize: '0.75rem', color: isDark ? '#34D399' : '#058728', fontWeight: 600 }}>Saved!</span>}
                  </div>
                  <p style={{ fontSize: '0.825rem', color: '#666666', margin: '0 0 16px 0' }}>
                    {t('accountView.manageNotificationsDesc')}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', cursor: 'pointer', color: isDark ? '#E2E8F0' : '#374151' }}>
                      <input
                        type="checkbox"
                        checked={notifPrefs.sms_enabled}
                        onChange={(e) => handleToggleNotif('sms_enabled', e.target.checked)}
                      />
                      <span>{t('accountView.smsNotifications')}</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', cursor: 'pointer', color: isDark ? '#E2E8F0' : '#374151' }}>
                      <input
                        type="checkbox"
                        checked={notifPrefs.email_enabled}
                        onChange={(e) => handleToggleNotif('email_enabled', e.target.checked)}
                      />
                      <span>{t('accountView.emailNotifications')}</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', cursor: 'pointer', color: isDark ? '#E2E8F0' : '#374151' }}>
                      <input
                        type="checkbox"
                        checked={notifPrefs.exam_alerts}
                        onChange={(e) => handleToggleNotif('exam_alerts', e.target.checked)}
                      />
                      <span>{t('accountView.examAlerts')}</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', cursor: 'pointer', color: isDark ? '#E2E8F0' : '#374151' }}>
                      <input
                        type="checkbox"
                        checked={notifPrefs.booking_alerts}
                        onChange={(e) => handleToggleNotif('booking_alerts', e.target.checked)}
                      />
                      <span>{t('accountView.bookingAlerts')}</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', cursor: 'pointer', color: isDark ? '#E2E8F0' : '#374151' }}>
                      <input
                        type="checkbox"
                        checked={notifPrefs.promo_alerts}
                        onChange={(e) => handleToggleNotif('promo_alerts', e.target.checked)}
                      />
                      <span>{t('accountView.promoAlerts')}</span>
                    </label>
                  </div>
                </div>

                {/* 4. Ways to Contact */}
                <div>
                  <label className="account-label" style={{ marginBottom: '4px' }}>
                    {t('accountView.waysToContact')}
                  </label>
                  <p className="account-subtext" style={{ margin: '0 0 16px 0' }}>
                    {t('accountView.waysToContactDesc')}
                  </p>

                  {/* List of current contact methods */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                    {contactMethods.length === 0 ? (
                      <div className="account-item-box" style={{ fontSize: '0.85rem', color: isDark ? '#94A3B8' : '#6B7280', fontStyle: 'italic', padding: '10px 12px', borderStyle: 'dashed' }}>
                        {t('accountView.noContactMethods')}
                      </div>
                    ) : (
                      contactMethods.map((cm, idx) => (
                        <div
                          key={idx}
                          className="account-item-box"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderRadius: '2px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {getContactIcon(cm.type)}
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: isDark ? '#E2E8F0' : '#4B5563', backgroundColor: isDark ? '#334155' : '#E5E7EB', padding: '2px 6px', borderRadius: '2px' }}>
                              {cm.type}
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45' }}>
                              {cm.value}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveContactMethod(idx)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#9CA3AF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px',
                            }}
                            title={t('accountView.remove')}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add New Contact Method Form */}
                  <form onSubmit={handleAddContactMethod} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                      value={newContactType}
                      onChange={(e) => setNewContactType(e.target.value)}
                      className="canvas-input"
                      style={{
                        minWidth: '120px',
                      }}
                    >
                      <option value="email">{t('accountView.typeEmail')}</option>
                      <option value="phone">{t('accountView.typePhone')}</option>
                      <option value="linkedin">{t('accountView.typeLinkedin')}</option>
                      <option value="other">{t('accountView.typeOther')}</option>
                    </select>

                    <input
                      type="text"
                      placeholder={newContactType === 'email' ? 'user@example.com' : newContactType === 'phone' ? '+250 788 000 000' : 'https://linkedin.com/in/...'}
                      value={newContactValue}
                      onChange={(e) => setNewContactValue(e.target.value)}
                      className="canvas-input"
                      style={{
                        flex: 1,
                        minWidth: '220px',
                      }}
                    />

                    <button
                      type="submit"
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#0055A5',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Plus size={15} />
                      <span>{t('accountView.addContactMethod')}</span>
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PROFILE                                                            */}
          {/* ========================================================================= */}
          {activeTab === 'profile' && (
            <div className="canvas-card" style={{ padding: '24px' }}>
              <div className="account-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 className="account-card-title">
                    {t('accountView.profileHeader')}
                  </h2>
                  <span className="canvas-badge canvas-badge-open">
                    {user?.studentId ? `ID: ${user.studentId}` : getRoleLabel()}
                  </span>
                </div>

                {!isEditingProfile ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      backgroundColor: '#0055A5',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '2px',
                    }}
                  >
                    <Edit3 size={15} />
                    <span>{t('accountView.editProfile')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEditProfile}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      backgroundColor: isDark ? '#334155' : '#F3F4F6',
                      color: isDark ? '#E2E8F0' : '#4B5563',
                      border: isDark ? '1px solid #475569' : '1px solid #D1D5DB',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '2px',
                    }}
                  >
                    <X size={15} />
                    <span>{t('accountView.cancel')}</span>
                  </button>
                )}
              </div>

              {profileSuccess && (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#F0FFF4',
                    border: '1px solid #C6F6D5',
                    color: '#22543D',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.875rem',
                  }}
                >
                  <CheckCircle2 size={16} color="#058728" />
                  <span>{t('accountView.savedSuccess')}</span>
                </div>
              )}

              {profileError && (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#FFF5F5',
                    border: '1px solid #FED7D7',
                    color: '#9B2C2C',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.875rem',
                  }}
                >
                  <AlertCircle size={16} color="#E53E3E" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* VIEW MODE (Default) */}
              {!isEditingProfile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Avatar & Names Header Display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #EAEAEA' }}>
                    <div style={{ position: 'relative' }}>
                      {user?.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt={user.fullName}
                          style={{
                            width: '76px',
                            height: '76px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #0055A5',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '76px',
                            height: '76px',
                            borderRadius: '50%',
                            backgroundColor: '#0055A5',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '1.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        title={t('accountView.changePhoto')}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: '#0055A5',
                          color: '#FFFFFF',
                          border: '2px solid #FFFFFF',
                          borderRadius: '50%',
                          width: '26px',
                          height: '26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Camera size={13} />
                      </button>
                    </div>

                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45' }}>
                        {user?.fullName || `${firstName} ${lastName}`.trim() || 'User'}
                      </h3>
                      <div style={{ marginTop: '6px' }}>
                        <span style={{ fontSize: '0.85rem', color: isDark ? '#94A3B8' : '#4B5563' }}>{user?.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertically Ordered Detail Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Phone Number (Explicitly Locked Notice) */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#6B7280', marginBottom: '4px' }}>
                        {t('accountView.phone')}
                      </label>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45', display: 'block' }}>
                        {user?.phoneNumber || 'N/A'}
                      </span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: isDark ? '#64748B' : '#9CA3AF' }}>
                        {t('accountView.phoneLockedNote')}
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#6B7280', marginBottom: '4px' }}>
                        {t('accountView.typeEmail')}
                      </label>
                      <span style={{ fontSize: '0.95rem', color: user?.email ? (isDark ? '#F8FAFC' : '#2D3B45') : (isDark ? '#64748B' : '#9CA3AF') }}>
                        {user?.email || 'No email provided'}
                      </span>
                    </div>

                    {/* Biography */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#6B7280', marginBottom: '4px' }}>
                        {t('accountView.biography')}
                      </label>
                      {user?.biography ? (
                        <p style={{ margin: 0, fontSize: '0.9rem', color: isDark ? '#E2E8F0' : '#374151', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                          {user.biography}
                        </p>
                      ) : (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: isDark ? '#64748B' : '#9CA3AF', fontStyle: 'italic' }}>
                          {t('accountView.noBiography')}
                        </p>
                      )}
                    </div>

                    {/* Links */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#6B7280', marginBottom: '6px' }}>
                        {t('accountView.links')}
                      </label>
                      {links.length === 0 ? (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: isDark ? '#64748B' : '#9CA3AF', fontStyle: 'italic' }}>
                          {t('accountView.noLinks')}
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.875rem',
                                color: isDark ? '#38BDF8' : '#0055A5',
                                textDecoration: 'none',
                                fontWeight: 500,
                              }}
                            >
                              <ExternalLink size={14} />
                              <span>{link.title}: {link.url}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Ways to Contact Summary */}
                    {contactMethods.length > 0 && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: isDark ? '#94A3B8' : '#6B7280', marginBottom: '6px' }}>
                          {t('accountView.waysToContact')}
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {contactMethods.map((cm, i) => (
                            <span
                              key={i}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                backgroundColor: isDark ? '#1E293B' : '#F3F4F6',
                                border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
                                fontSize: '0.8rem',
                                color: isDark ? '#E2E8F0' : '#374151',
                                borderRadius: '2px',
                              }}
                            >
                              {getContactIcon(cm.type)}
                              <strong>{cm.type}:</strong> {cm.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* EDIT MODE */
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
                  {/* Profile Picture: Choose from device (NO MORE LINK PASTING!) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', marginBottom: '8px' }}>
                      {t('accountView.profilePhoto')}
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                      {/* Avatar preview */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {currentPhotoUrl ? (
                          <img
                            src={currentPhotoUrl}
                            alt="Preview"
                            style={{
                              width: '76px',
                              height: '76px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: isDark ? '2px solid #38BDF8' : '2px solid #0055A5',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '76px',
                              height: '76px',
                              borderRadius: '50%',
                              backgroundColor: '#0055A5',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '1.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>

                      {/* File Picker Control */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={handlePhotoFileChange}
                          style={{ display: 'none' }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                              border: isDark ? '1px solid #38BDF8' : '1px solid #0055A5',
                              color: isDark ? '#38BDF8' : '#0055A5',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              borderRadius: '2px',
                            }}
                          >
                            <Upload size={15} />
                            <span>{currentPhotoUrl ? t('accountView.changePhoto') : t('accountView.choosePhoto')}</span>
                          </button>

                          {(selectedPhotoFile || (!removeExistingPhoto && user?.profilePhoto)) && (
                            <button
                              type="button"
                              onClick={handleClearPhoto}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: isDark ? '#334155' : '#F3F4F6',
                                border: isDark ? '1px solid #475569' : '1px solid #D1D5DB',
                                color: '#DC2626',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                borderRadius: '2px',
                              }}
                            >
                              {t('accountView.removePhoto')}
                            </button>
                          )}
                        </div>

                        {selectedPhotoFile && (
                          <div style={{ fontSize: '0.75rem', color: '#058728', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} />
                            <span>{selectedPhotoFile.name} ({(selectedPhotoFile.size / 1024).toFixed(0)} KB)</span>
                          </div>
                        )}

                        <span style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
                          {t('accountView.photoHelp')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* First Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', marginBottom: '6px' }}>
                      {t('accountView.firstName')}
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="canvas-input"
                      style={{
                        width: '100%',
                      }}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', marginBottom: '6px' }}>
                      {t('accountView.lastName')}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="canvas-input"
                      style={{
                        width: '100%',
                      }}
                    />
                  </div>

                  {/* Phone Number (Strictly READ-ONLY / LOCKED) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', marginBottom: '6px' }}>
                      {t('accountView.phone')}
                    </label>
                    <input
                      type="text"
                      value={user?.phoneNumber || ''}
                      disabled
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
                        backgroundColor: isDark ? '#0F172A' : '#F3F4F6',
                        color: isDark ? '#94A3B8' : '#6B7280',
                        fontSize: '0.9rem',
                        cursor: 'not-allowed',
                        borderRadius: '2px',
                      }}
                    />
                    <span style={{ fontSize: '0.75rem', color: isDark ? '#64748B' : '#6B7280', marginTop: '4px', display: 'block' }}>
                      {t('accountView.phoneLockedNote')}
                    </span>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', marginBottom: '6px' }}>
                      {t('accountView.typeEmail')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="canvas-input"
                      style={{
                        width: '100%',
                      }}
                    />
                  </div>

                  {/* Biography */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', marginBottom: '6px' }}>
                      {t('accountView.biography')}
                    </label>
                    <textarea
                      rows={4}
                      value={biography}
                      onChange={(e) => setBiography(e.target.value)}
                      placeholder={t('accountView.biographyPlaceholder')}
                      className="canvas-input"
                      style={{
                        width: '100%',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  {/* Links Editor */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', marginBottom: '6px' }}>
                      {t('accountView.links')}
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                      {links.map((link, idx) => (
                        <div key={idx} className="account-item-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '2px' }}>
                          <span style={{ fontSize: '0.85rem', color: isDark ? '#F8FAFC' : '#2D3B45' }}>
                            <strong>{link.title}:</strong> {link.url}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(idx)}
                            style={{ backgroundColor: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '2px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder={t('accountView.linkTitle')}
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        className="canvas-input"
                        style={{ flex: 1, padding: '7px 10px' }}
                      />
                      <input
                        type="url"
                        placeholder={t('accountView.linkUrl')}
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="canvas-input"
                        style={{ flex: 2, padding: '7px 10px' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddLink}
                        style={{
                          padding: '7px 12px',
                          backgroundColor: isDark ? '#334155' : '#F3F4F6',
                          border: isDark ? '1px solid #475569' : '1px solid #D1D5DB',
                          color: isDark ? '#F8FAFC' : '#2D3B45',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          borderRadius: '2px',
                        }}
                      >
                        {t('accountView.addLink')}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', paddingTop: '10px' }}>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 20px',
                        backgroundColor: '#0055A5',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: isSavingProfile ? 'not-allowed' : 'pointer',
                        opacity: isSavingProfile ? 0.7 : 1,
                        borderRadius: '2px',
                      }}
                    >
                      <Save size={16} />
                      <span>{isSavingProfile ? 'Saving...' : t('accountView.saveProfile')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditProfile}
                      style={{
                        padding: '9px 18px',
                        backgroundColor: isDark ? '#334155' : '#FFFFFF',
                        color: isDark ? '#F8FAFC' : '#374151',
                        border: isDark ? '1px solid #475569' : '1px solid #D1D5DD',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {t('accountView.cancel')}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SECURITY                                                           */}
          {/* ========================================================================= */}
          {activeTab === 'security' && (
            <div className="canvas-card" style={{ padding: '24px' }}>
              <div className="account-card-header">
                <h2 className="account-card-title">
                  {t('accountView.securityHeader')}
                </h2>
              </div>

              {passwordNotice && !isChangePasswordModalOpen && (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: !passwordNotice.isError ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#F0FFF4') : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFF5F5'),
                    border: !passwordNotice.isError ? (isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #C6F6D5') : (isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #FED7D7'),
                    color: !passwordNotice.isError ? (isDark ? '#34D399' : '#22543D') : (isDark ? '#F87171' : '#9B2C2C'),
                    marginBottom: '20px',
                    fontSize: '0.875rem',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {!passwordNotice.isError ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{passwordNotice.text}</span>
                </div>
              )}

              {/* 1. Password Management Section */}
              <div className="account-divider">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ maxWidth: '480px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', margin: '0 0 6px 0' }}>
                      {t('accountView.updatePassword')}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: isDark ? '#94A3B8' : '#666666', margin: 0, lineHeight: '1.4' }}>
                      {t('accountView.changePasswordDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordNotice(null);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setIsChangePasswordModalOpen(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#0055A5',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      transition: 'background-color 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#004080')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0055A5')}
                  >
                    <Key size={16} />
                    <span>{t('accountView.changePassword')}</span>
                  </button>
                </div>
              </div>

              {/* 2. Two-Factor Authentication (2FA) */}
              <div className="account-divider" style={{ paddingTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', margin: 0 }}>
                    {t('accountView.twoFactorAuth')}
                  </h3>
                  {isSaving2FA && <span style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#6B7280' }}>Updating...</span>}
                  {twoFactorNotice && <span style={{ fontSize: '0.75rem', color: isDark ? '#34D399' : '#058728', fontWeight: 600 }}>{twoFactorNotice}</span>}
                </div>
                <p style={{ fontSize: '0.825rem', color: isDark ? '#94A3B8' : '#666666', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                  {t('accountView.twoFactorDesc')}
                </p>

                {/* 2FA Toggle Switch */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: isDark ? '#0F172A' : '#F9FAFB', border: isDark ? '1px solid #334155' : '1px solid #E5E7EB', marginBottom: '16px', borderRadius: '2px' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45' }}>
                      {t('accountView.enable2FA')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: twoFactorEnabled ? (isDark ? '#34D399' : '#058728') : (isDark ? '#94A3B8' : '#6B7280'), marginTop: '2px', fontWeight: 500 }}>
                      {twoFactorEnabled ? '2FA is currently ACTIVE on login' : '2FA is disabled'}
                    </div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => handleSave2FA(e.target.checked, twoFactorMethod)}
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: twoFactorEnabled ? '#058728' : '#D1D5DB',
                        transition: '0.2s',
                        borderRadius: '12px',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        height: '18px',
                        width: '18px',
                        left: twoFactorEnabled ? '22px' : '3px',
                        bottom: '3px',
                        backgroundColor: '#FFFFFF',
                        transition: '0.2s',
                        borderRadius: '50%',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    />
                  </label>
                </div>

                {/* 2FA Delivery Method Selection */}
                {twoFactorEnabled && (
                  <div style={{ padding: '14px 16px', backgroundColor: isDark ? 'rgba(56, 189, 248, 0.1)' : '#F0F9FF', border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #BAE6FD', display: 'flex', flexDirection: 'column', gap: '10px', borderRadius: '2px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#38BDF8' : '#0369A1' }}>
                      {t('accountView.twoFactorMethod')}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: isDark ? '#E2E8F0' : '#1E293B', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="twoFactorMethod"
                        value="phone"
                        checked={twoFactorMethod === 'phone'}
                        onChange={() => handleSave2FA(true, 'phone')}
                      />
                      <span><strong>{t('accountView.methodPhone')}</strong> ({user?.phoneNumber || 'Registered Phone'})</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: isDark ? '#E2E8F0' : '#1E293B', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="twoFactorMethod"
                        value="email"
                        checked={twoFactorMethod === 'email'}
                        onChange={() => handleSave2FA(true, 'email')}
                      />
                      <span><strong>{t('accountView.methodEmail')}</strong> ({user?.email || 'Registered Email'})</span>
                    </label>
                  </div>
                )}
              </div>

              {/* 3. Active Sessions (DYNAMIC, NOT HARDCODED) */}
              <div style={{ paddingTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', margin: 0 }}>
                    {t('accountView.activeSessions')}
                  </h3>
                  {activeSessions.length > 1 && (
                    <button
                      type="button"
                      onClick={handleTerminateOtherSessions}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FFF1F2',
                        border: isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #FECDD3',
                        color: isDark ? '#FCA5A5' : '#BE123C',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      {t('accountView.terminateOtherSessions')}
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.825rem', color: isDark ? '#94A3B8' : '#666666', margin: '0 0 16px 0' }}>
                  {t('accountView.activeSessionsDesc')}
                </p>

                {sessionNotice && (
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#F0FFF4',
                      border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #C6F6D5',
                      color: isDark ? '#34D399' : '#22543D',
                      marginBottom: '14px',
                      fontSize: '0.85rem',
                      borderRadius: '2px',
                    }}
                  >
                    {sessionNotice}
                  </div>
                )}

                {/* Dynamically Rendered Session List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {isLoadingSessions ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: isDark ? '#94A3B8' : '#6B7280', fontSize: '0.875rem' }}>
                      Loading active sessions...
                    </div>
                  ) : activeSessions.length === 0 ? (
                    <div style={{ padding: '14px 16px', border: isDark ? '1px solid #334155' : '1px solid #E5E7EB', backgroundColor: isDark ? '#0F172A' : '#F9FAFB', borderRadius: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <Smartphone size={22} color={isDark ? '#38BDF8' : '#0055A5'} />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45' }}>
                            {navigator.userAgent}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#6B7280', marginTop: '3px' }}>
                            IP: <span style={{ fontFamily: 'monospace', color: isDark ? '#CBD5E1' : '#374151' }}>{user?.lastLoginIp || '127.0.0.1'}</span>
                            {' • '}
                            <span>{t('accountView.activeNow')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    activeSessions.map((session, index) => {
                      const isCurrent = session.is_current || index === 0;
                      return (
                        <div
                          key={session.id || index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            border: isCurrent ? (isDark ? '1px solid #1E3A5F' : '1px solid #BFDBFE') : (isDark ? '1px solid #334155' : '1px solid #E5E7EB'),
                            backgroundColor: isCurrent ? (isDark ? '#172033' : '#F8FAFC') : (isDark ? '#0F172A' : '#FFFFFF'),
                            borderRadius: '2px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <Smartphone size={22} color={isCurrent ? (isDark ? '#38BDF8' : '#0055A5') : (isDark ? '#94A3B8' : '#6B7280')} />
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45' }}>
                                {session.user_agent || navigator.userAgent}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#6B7280', marginTop: '3px' }}>
                                IP: <span style={{ fontFamily: 'monospace', color: isDark ? '#CBD5E1' : '#374151' }}>{session.ip_address || user?.lastLoginIp || '127.0.0.1'}</span>
                                {' • '}
                                <span>{session.last_active ? new Date(session.last_active).toLocaleString() : t('accountView.activeNow')}</span>
                              </div>
                            </div>
                          </div>

                          {isCurrent && (
                            <span className="canvas-badge canvas-badge-open" style={{ flexShrink: 0 }}>
                              {t('accountView.currentSession')}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: PROGRESS                                                           */}
          {/* ========================================================================= */}
          {activeTab === 'progress' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Readiness Meter Card */}
              <div className="canvas-card" style={{ padding: '24px' }}>
                <div className="account-card-header">
                  <h2 className="account-card-title">
                    {t('accountView.policeExamReadiness')}
                  </h2>
                  <span className="canvas-badge canvas-badge-resolved">
                    {t('accountView.eligible')}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: isDark ? '#94A3B8' : '#4B5563', marginBottom: '20px', lineHeight: '1.5' }}>
                  {t('accountView.policeThresholdDesc')}
                </p>

                {/* Progress Bar with Threshold Marker */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: isDark ? '#E2E8F0' : '#374151' }}>{t('accountView.scoreThreshold')}</span>
                    <span style={{ color: '#058728' }}>{t('accountView.eligibleToApply')}</span>
                  </div>
                  <div style={{ height: '12px', backgroundColor: isDark ? '#334155' : '#E5E7EB', overflow: 'hidden', borderRadius: '2px' }}>
                    <div style={{ width: '88%', height: '100%', backgroundColor: '#058728' }} />
                  </div>
                </div>

                {/* Vertically Ordered Progress Metric Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="canvas-metric-box alert-submitted" style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#666666', fontWeight: 600 }}>{t('accountView.testsCompleted')}</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#058728', marginTop: '4px', display: 'block' }}>14 / 15</span>
                  </div>
                  <div className="canvas-metric-box alert-score" style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#666666', fontWeight: 600 }}>{t('accountView.averageScore')}</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: isDark ? '#38BDF8' : '#0055A5', marginTop: '4px', display: 'block' }}>17.6 / 20</span>
                  </div>
                  <div className="canvas-metric-box alert-due" style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#666666', fontWeight: 600 }}>{t('accountView.remainingTests')}</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D9381E', marginTop: '4px', display: 'block' }}>{t('accountView.remainingCount')}</span>
                  </div>
                </div>
              </div>

              {/* Module-by-Module Progress Breakdown */}
              <div className="canvas-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#2D3B45', marginBottom: '16px', margin: '0 0 16px 0' }}>
                  {t('accountView.completedModules')}
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="canvas-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: isDark ? '2px solid #334155' : '2px solid #E5E7EB', textAlign: 'left', fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#6B7280' }}>
                        <th style={{ padding: '10px 12px' }}>{t('accountView.moduleCol')}</th>
                        <th style={{ padding: '10px 12px' }}>{t('accountView.typeCol')}</th>
                        <th style={{ padding: '10px 12px' }}>{t('accountView.hoursCol')}</th>
                        <th style={{ padding: '10px 12px' }}>{t('accountView.scoreCol')}</th>
                        <th style={{ padding: '10px 12px' }}>{t('accountView.statusCol')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB', fontSize: '0.875rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45' }}>1. Amategeko Rusange n'Ibyapa byo mu Muhanda</td>
                        <td style={{ padding: '12px', color: isDark ? '#94A3B8' : '#6B7280' }}>Police Standard Theory</td>
                        <td style={{ padding: '12px', color: isDark ? '#CBD5E1' : '#333333' }}>14h</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45' }}>18 / 20 (90%)</td>
                        <td style={{ padding: '12px' }}><span className="canvas-badge canvas-badge-resolved">{t('accountView.completed')}</span></td>
                      </tr>
                      <tr style={{ borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB', fontSize: '0.875rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45' }}>2. Ibyapa by'Impuruza n'Ibyo Gutegeka</td>
                        <td style={{ padding: '12px', color: isDark ? '#94A3B8' : '#6B7280' }}>Road Signs Deep Dive</td>
                        <td style={{ padding: '12px', color: isDark ? '#CBD5E1' : '#333333' }}>8h</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45' }}>17 / 20 (85%)</td>
                        <td style={{ padding: '12px' }}><span className="canvas-badge canvas-badge-resolved">{t('accountView.completed')}</span></td>
                      </tr>
                      <tr style={{ fontSize: '0.875rem' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45' }}>3. Ubumenyi rusange bwa Moto n'Imodoka</td>
                        <td style={{ padding: '12px', color: isDark ? '#94A3B8' : '#6B7280' }}>Mechanical Inspection</td>
                        <td style={{ padding: '12px', color: isDark ? '#CBD5E1' : '#333333' }}>6h</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: isDark ? '#F8FAFC' : '#2D3B45' }}>16 / 20 (80%)</td>
                        <td style={{ padding: '12px' }}><span className="canvas-badge canvas-badge-progress">{t('accountView.inProgress')}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Change Password Dialog Modal */}
      {isChangePasswordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-modal-title"
          onClick={() => {
            if (!isChangingPassword) {
              setIsChangePasswordModalOpen(false);
              setPasswordNotice(null);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
              borderRadius: '4px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#EBF8FF',
                    color: isDark ? '#38BDF8' : '#0055A5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Key size={18} />
                </div>
                <h3
                  id="change-password-modal-title"
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: isDark ? '#F8FAFC' : '#1E293B',
                  }}
                >
                  {t('accountView.changePassword')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isChangingPassword) {
                    setIsChangePasswordModalOpen(false);
                    setPasswordNotice(null);
                  }
                }}
                disabled={isChangingPassword}
                aria-label="Close dialog"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                  color: isDark ? '#94A3B8' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdatePassword} style={{ padding: '20px' }}>
              {passwordNotice && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: !passwordNotice.isError ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#F0FFF4') : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFF5F5'),
                    border: !passwordNotice.isError ? (isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #C6F6D5') : (isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #FED7D7'),
                    color: !passwordNotice.isError ? (isDark ? '#34D399' : '#22543D') : (isDark ? '#F87171' : '#9B2C2C'),
                    marginBottom: '16px',
                    fontSize: '0.85rem',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {!passwordNotice.isError ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{passwordNotice.text}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: isDark ? '#E2E8F0' : '#2D3B45',
                      marginBottom: '6px',
                    }}
                  >
                    {t('accountView.currentPassword')}
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="canvas-input"
                    style={{ width: '100%' }}
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: isDark ? '#E2E8F0' : '#2D3B45',
                      marginBottom: '6px',
                    }}
                  >
                    {t('accountView.newPassword')}
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="canvas-input"
                    style={{ width: '100%' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '4px', display: 'block' }}>
                    {t('accountView.passwordMinChars')}
                  </span>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: isDark ? '#E2E8F0' : '#2D3B45',
                      marginBottom: '6px',
                    }}
                  >
                    {t('accountView.confirmPassword')}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="canvas-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordModalOpen(false);
                    setPasswordNotice(null);
                  }}
                  disabled={isChangingPassword}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isDark ? '#334155' : '#F1F5F9',
                    color: isDark ? '#E2E8F0' : '#475569',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    borderRadius: '2px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                  }}
                >
                  {t('accountView.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    backgroundColor: '#0055A5',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                    opacity: isChangingPassword ? 0.7 : 1,
                    borderRadius: '2px',
                  }}
                >
                  <Key size={15} />
                  <span>{isChangingPassword ? 'Updating...' : t('accountView.changePassword')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
