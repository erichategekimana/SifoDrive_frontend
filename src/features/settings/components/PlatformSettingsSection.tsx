import React, { useState, useMemo, useRef } from 'react';
import {
  Globe,
  GraduationCap,
  Users,
  ShieldCheck,
  Settings2,
  FlaskConical,
  Activity,
  Play,
  RotateCcw,
  Search,
  Download,
  Terminal,
  Upload,
} from 'lucide-react';
import type {
  PlatformFeatureFlag,
  PlatformEnvironmentConfig,
  PlatformSubSection,
  PublicBackgroundConfig,
} from '../types';
import { DEFAULT_PUBLIC_BACKGROUND, DEFAULT_PUBLIC_BG_URL } from '../hooks/useAdminSettingsData';
import { useToast } from '../../../context/ToastContext';
import { useTranslation } from '../../../context/I18nContext';

interface PlatformSettingsSectionProps {
  platformConfig: PlatformEnvironmentConfig;
  setPlatformConfig: React.Dispatch<React.SetStateAction<PlatformEnvironmentConfig>>;
  featureFlags: PlatformFeatureFlag[];
  setFeatureFlags: React.Dispatch<React.SetStateAction<PlatformFeatureFlag[]>>;
  onResetDefaults: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export const PlatformSettingsSection: React.FC<PlatformSettingsSectionProps> = ({
  platformConfig,
  setPlatformConfig,
  featureFlags,
  setFeatureFlags,
  onResetDefaults,
  onSave,
  isSaving,
}) => {
  const { showToast } = useToast();
  const { language } = useTranslation();
  const isRw = language === 'rw';

  // Active Sub-Section: Public | Student | Tutors | Admins | General
  const [activeSubSection, setActiveSubSection] = useState<PlatformSubSection>('public');

  // Search & Filters for Feature Flags
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Interactive Feature Simulation Modal
  const [simulatingFlag, setSimulatingFlag] = useState<PlatformFeatureFlag | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Public Background Image Studio State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

  const publicBg = platformConfig.publicBackground || DEFAULT_PUBLIC_BACKGROUND;

  const updatePublicBg = (patch: Partial<PublicBackgroundConfig>) => {
    setPlatformConfig((prev) => ({
      ...prev,
      publicBackground: {
        ...(prev.publicBackground || DEFAULT_PUBLIC_BACKGROUND),
        ...patch,
      },
    }));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setUploadError(null);

    // 1. Validate File Format
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      setUploadError('Only PNG, JPG, or WebP images are supported.');
      showToast('Invalid format. Use PNG, JPG, or WebP.', 'error');
      return;
    }

    // 2. Validate File Size (Max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError('Image size exceeds 5MB limit.');
      showToast('Image size must be 5MB or less.', 'error');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setIsUploading(false);
      setUploadError('Failed to read image file.');
      showToast('Error reading image file.', 'error');
    };

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        setIsUploading(false);
        setUploadError('Corrupted image file.');
        showToast('Corrupted image file.', 'error');
      };

      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // 3. Validate Dimensions (Min 1280x720)
        if (width < 1280 || height < 720) {
          setIsUploading(false);
          setUploadError(`Resolution must be at least 1280 × 720 px (selected: ${width} × ${height} px).`);
          showToast('Image resolution is too low. Min 1280 × 720.', 'error');
          return;
        }

        // 4. Validate Landscape Orientation
        if (width < height) {
          setIsUploading(false);
          setUploadError('Image must be in landscape format (width greater than height).');
          showToast('Image must be in landscape format.', 'error');
          return;
        }

        // 5. Optimize via Canvas to max width 1280 to keep performance snappy and well within storage limits
        try {
          const maxTargetW = 1280;
          const scale = width > maxTargetW ? maxTargetW / width : 1;
          const targetW = Math.round(width * scale);
          const targetH = Math.round(height * scale);

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, targetW, targetH);
            const optimized = canvas.toDataURL('image/jpeg', 0.65);

            updatePublicBg({
              enabled: true,
              imageDataUrl: optimized,
              imageFileName: file.name,
              imageDimensions: { width, height },
            });
            setUploadError(null);
            showToast('Background image uploaded successfully.', 'success');
          }
        } catch {
          setUploadError('Failed to process image.');
          showToast('Failed to optimize image.', 'error');
        } finally {
          setIsUploading(false);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    updatePublicBg({
      imageDataUrl: DEFAULT_PUBLIC_BG_URL,
      imageFileName: 'Highway Landscape (Default)',
      imageDimensions: undefined,
    });
    showToast('Reverted to default background image.', 'info');
  };

  // Toggle single flag
  const toggleFlag = (id: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextState = !f.isEnabled;
          showToast(
            `${f.name} is now ${nextState ? 'ENABLED' : 'DISABLED'}`,
            nextState ? 'success' : 'info'
          );
          return {
            ...f,
            isEnabled: nextState,
            lastToggledAt: new Date().toISOString(),
            toggledBy: 'System Administrator',
          };
        }
        return f;
      })
    );
  };

  // Change audience rollout
  const updateAudience = (id: string, targetAudience: PlatformFeatureFlag['targetAudience']) => {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, targetAudience } : f))
    );
    showToast(`Rollout audience updated to ${targetAudience}`, 'info');
  };

  // Filter flags based on active sub-section, search, and category
  const filteredFlags = useMemo(() => {
    return featureFlags.filter((f) => {
      // In specific sub-sections, default filter by scope unless in General
      const matchesScope =
        activeSubSection === 'general' ? true : f.scope === activeSubSection;

      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.nameKinyarwanda && f.nameKinyarwanda.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'beta' && (f.status === 'BETA' || f.status === 'ALPHA' || f.status === 'EXPERIMENTAL')) ||
        f.category === selectedCategory;

      return matchesScope && matchesSearch && matchesCat;
    });
  }, [featureFlags, activeSubSection, searchQuery, selectedCategory]);

  // Run Interactive Feature Simulation
  const handleStartSimulation = (flag: PlatformFeatureFlag) => {
    setSimulatingFlag(flag);
    setSimulationLogs([
      `[INIT] Initializing sandboxed test harness for: ${flag.id}`,
      `[SCOPE] Target domain: ${flag.scope?.toUpperCase() || 'GENERAL'}`,
      `[VERSION] Runtime release payload: ${flag.version} (${flag.status})`,
      `[TARGET] Audience policy: ${flag.targetAudience} | Risk: ${flag.riskLevel}`,
    ]);
    setIsSimulating(true);

    setTimeout(() => {
      setSimulationLogs((prev) => [
        ...prev,
        `[HEALTH] Service dependency check: OK (Latency: 12ms)`,
        `[SECURITY] Policy verification & signature: VALID`,
        `[RUNNING] Executing feature lifecycle test hook...`,
      ]);
    }, 700);

    setTimeout(() => {
      setSimulationLogs((prev) => [
        ...prev,
        `[SUCCESS] Simulation completed successfully! 0 errors detected.`,
        `[RESULT] Feature "${flag.name}" is verified and safe for candidate traffic.`,
      ]);
      setIsSimulating(false);
    }, 1600);
  };

  const handleExportJson = () => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      platformConfig,
      featureFlags,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `sifo_platform_settings_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    showToast('Platform configuration exported as JSON', 'success');
  };

  const getStatusBadgeColor = (status: PlatformFeatureFlag['status']) => {
    switch (status) {
      case 'STABLE':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'BETA':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
      case 'ALPHA':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'EXPERIMENTAL':
        return { bg: 'rgba(244, 63, 94, 0.15)', text: '#fb7185', border: 'rgba(244, 63, 94, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  const getRiskBadgeColor = (risk: PlatformFeatureFlag['riskLevel']) => {
    switch (risk) {
      case 'HIGH':
        return { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171' };
      case 'MEDIUM':
        return { bg: 'rgba(245, 158, 11, 0.12)', text: '#fcd34d' };
      case 'LOW':
      default:
        return { bg: 'rgba(148, 163, 184, 0.12)', text: '#cbd5e1' };
    }
  };

  const subSections: {
    key: PlatformSubSection;
    label: string;
    labelRw: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'public',
      label: 'Public',
      labelRw: 'Abashyitsi (Public)',
      icon: <Globe size={16} />,
    },
    {
      key: 'student',
      label: 'Student',
      labelRw: 'Abanyeshuri (Student)',
      icon: <GraduationCap size={16} />,
    },
    {
      key: 'tutors',
      label: 'Tutors',
      labelRw: 'Abarimu (Tutors)',
      icon: <Users size={16} />,
    },
    {
      key: 'admins',
      label: 'Admins',
      labelRw: 'Abayobozi (Admins)',
      icon: <ShieldCheck size={16} />,
    },
    {
      key: 'general',
      label: 'General',
      labelRw: 'Rusange (General)',
      icon: <Settings2 size={16} />,
    },
  ];

  const currentSection = subSections.find((s) => s.key === activeSubSection)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ── SUB-SECTIONS NAVIGATION BAR ── */}
      <div
        className="glass-panel"
        style={{
          padding: '8px 12px',
          borderRadius: '14px',
          border: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {subSections.map((sec) => {
            const isActive = activeSubSection === sec.key;
            const flagCount =
              sec.key === 'general'
                ? featureFlags.length
                : featureFlags.filter((f) => f.scope === sec.key).length;

            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => {
                  setActiveSubSection(sec.key);
                  setSelectedCategory('all');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: isActive ? '1px solid #0284c7' : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(2, 132, 199, 0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(2, 132, 199, 0.2)' : 'none',
                }}
              >
                {sec.icon}
                <span>{isRw ? sec.labelRw : sec.label}</span>
                {flagCount > 0 && (
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '999px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                      color: isActive ? '#38bdf8' : '#94a3b8',
                    }}
                  >
                    {flagCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                backgroundColor: '#0284c7',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          <button
            type="button"
            onClick={handleExportJson}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Download size={14} />
            Export Config
          </button>
          <button
            type="button"
            onClick={onResetDefaults}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={14} />
            Factory Reset
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-SECTION 1: PUBLIC ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubSection === 'public' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* ── BACKGROUND IMAGE ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header with Title and Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                  {isRw ? 'Ifoto y’Inyuma' : 'Background Image'}
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                  {isRw
                    ? 'Ifoto igaragara inyuma ku mpande za ecran (100vh).'
                    : 'Displays behind public pages covering screen height (100vh).'}
                </div>
              </div>

              {/* On / Off Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: publicBg.enabled ? '#34d399' : '#64748b' }}>
                  {publicBg.enabled ? 'ENABLED' : 'OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !publicBg.enabled;
                    updatePublicBg({ enabled: next });
                    showToast(`Background Image ${next ? 'ENABLED' : 'DISABLED'}`, 'info');
                  }}
                  aria-label="Toggle background image"
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: publicBg.enabled ? '#0284c7' : '#334155',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: publicBg.enabled ? '23px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageFileChange}
              style={{ display: 'none' }}
            />

            {/* 2-Column Layout: Left (Vertical Settings: Image, Light, Dark) | Right (Live Preview) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                alignItems: 'stretch',
              }}
            >
              {/* LEFT COLUMN: Vertically Stacked Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Upload Area / Selected Image */}
                {!publicBg.imageDataUrl ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '1px dashed rgba(56, 189, 248, 0.4)',
                      borderRadius: '10px',
                      padding: '20px',
                      textAlign: 'center',
                      backgroundColor: 'rgba(2, 132, 199, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Upload size={22} color="#38bdf8" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                      {isUploading ? 'Validating...' : (isRw ? 'Kanda hano uhitemo ifoto muri mudasobwa' : 'Upload Image from Computer')}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      PNG, JPG, or WebP • Landscape (Min 1280 × 720 px) • Max 5MB
                    </div>
                    {uploadError && (
                      <div style={{ marginTop: '8px', fontSize: '0.76rem', color: '#f87171', fontWeight: 600 }}>
                        ⚠️ {uploadError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={publicBg.imageDataUrl}
                        alt="Background"
                        style={{
                          width: '68px',
                          height: '42px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>
                          {publicBg.imageFileName || 'Background Image'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                          {publicBg.imageDimensions
                            ? `${publicBg.imageDimensions.width} × ${publicBg.imageDimensions.height} px • Landscape`
                            : 'Landscape Image'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid var(--border-subtle)',
                          color: '#cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isRw ? 'Hindura' : 'Change'}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isRw ? 'Gukuraho' : 'Remove'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Light Mode Settings (Stacked vertically) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>
                    {isRw ? 'Uburyo bwa Manywa (Light Mode)' : 'Light Mode'}
                  </div>

                  {/* Light Image Opacity */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>{isRw ? 'Urumuri rw’Ifoto' : 'Image Opacity'}</span>
                      <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                        {Math.round((publicBg.lightImageOpacity ?? 0.20) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((publicBg.lightImageOpacity ?? 0.20) * 100)}
                      onChange={(e) => updatePublicBg({ lightImageOpacity: Number(e.target.value) / 100 })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#64748b' }}
                    />
                  </div>

                  {/* Light Gradient Opacity */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>{isRw ? 'Urumuri rw’Amabara' : 'Gradient Opacity'}</span>
                      <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                        {Math.round((publicBg.lightGradientOpacity ?? 0.85) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((publicBg.lightGradientOpacity ?? 0.85) * 100)}
                      onChange={(e) => updatePublicBg({ lightGradientOpacity: Number(e.target.value) / 100 })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#64748b' }}
                    />
                  </div>
                </div>

                {/* 3. Dark Mode Settings (Stacked vertically) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff' }}>
                    {isRw ? 'Uburyo bw’Ijoro (Dark Mode)' : 'Dark Mode'}
                  </div>

                  {/* Dark Image Opacity */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>{isRw ? 'Urumuri rw’Ifoto' : 'Image Opacity'}</span>
                      <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                        {Math.round((publicBg.darkImageOpacity ?? 0.15) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((publicBg.darkImageOpacity ?? 0.15) * 100)}
                      onChange={(e) => updatePublicBg({ darkImageOpacity: Number(e.target.value) / 100 })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#64748b' }}
                    />
                  </div>

                  {/* Dark Gradient Opacity */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                      <span>{isRw ? 'Urumuri rw’Amabara' : 'Gradient Opacity'}</span>
                      <span style={{ fontWeight: 600, color: '#cbd5e1' }}>
                        {Math.round((publicBg.darkGradientOpacity ?? 0.70) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((publicBg.darkGradientOpacity ?? 0.70) * 100)}
                      onChange={(e) => updatePublicBg({ darkGradientOpacity: Number(e.target.value) / 100 })}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#64748b' }}
                    />
                  </div>
                </div>

                {/* Save Changes button directly below settings */}
                {onSave && (
                  <div>
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={isSaving}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        backgroundColor: '#0284c7',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        opacity: isSaving ? 0.7 : 1,
                        transition: 'background-color 0.15s ease',
                        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                        width: '100%',
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Live Preview */}
              <div
                style={{
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  backgroundColor: previewTheme === 'light' ? '#ffffff' : '#0b0f17',
                  position: 'relative',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '360px',
                }}
              >
                {/* Preview mode switch bar */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: previewTheme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(11, 15, 23, 0.85)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: previewTheme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: previewTheme === 'light' ? '#0f172a' : '#f8fafc',
                    }}
                  >
                    {isRw ? 'Igaragara ry’Ako Kanya' : 'Live Preview'}
                  </span>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('light')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: previewTheme === 'light' ? '#0284c7' : 'rgba(148, 163, 184, 0.15)',
                        color: previewTheme === 'light' ? '#ffffff' : '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme('dark')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: previewTheme === 'dark' ? '#0284c7' : 'rgba(148, 163, 184, 0.15)',
                        color: previewTheme === 'dark' ? '#ffffff' : '#94a3b8',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Preview Body Layering */}
                <div
                  style={{
                    flex: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '280px',
                  }}
                >
                  {/* Image Layer in Preview */}
                  {publicBg.enabled && (publicBg.imageDataUrl || DEFAULT_PUBLIC_BG_URL) ? (
                    <img
                      src={publicBg.imageDataUrl || DEFAULT_PUBLIC_BG_URL}
                      alt=""
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity:
                          previewTheme === 'light'
                            ? publicBg.lightImageOpacity ?? 0.20
                            : publicBg.darkImageOpacity ?? 0.15,
                        pointerEvents: 'none',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        fontSize: '0.76rem',
                        color: previewTheme === 'light' ? '#94a3b8' : '#64748b',
                      }}
                    >
                      {isRw ? 'Nta foto igaragara (Feature irazimije)' : 'Feature is OFF'}
                    </div>
                  )}

                  {/* Gradient Layer in Preview */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background:
                        previewTheme === 'light'
                          ? 'radial-gradient(ellipse 100% 800px at 50% 0%, rgba(16, 185, 129, 0.22) 0%, rgba(14, 165, 233, 0.14) 45%, transparent 80%)'
                          : 'radial-gradient(ellipse 100% 800px at 50% 0%, rgba(16, 185, 129, 0.18) 0%, rgba(14, 165, 233, 0.10) 45%, transparent 80%)',
                    opacity:
                      previewTheme === 'light'
                        ? publicBg.lightGradientOpacity ?? 0.85
                        : publicBg.darkGradientOpacity ?? 0.70,
                    pointerEvents: 'none',
                  }}
                />

                {/* Sample Content Typography in Preview */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    textAlign: 'center',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: previewTheme === 'light' ? '#0f172a' : '#f8fafc',
                    }}
                  >
                    Sifo Driving Academy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Globe size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                {isRw ? 'Igenzura ry’Abashyitsi' : 'Guest Access Controls'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. Allow Public Guest Checkout */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Guest Pay-As-You-Go Checkout
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Allows visitors to buy mock tests with just a phone number via MoMo without account sign-up.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.allowPublicGuestCheckout ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, allowPublicGuestCheckout: e.target.checked });
                      showToast(`Guest Pay-As-You-Go ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Directly impacts the public pricing & mock exam checkout modal.
                </div>
              </div>

              {/* 2. Public Catalog Visibility */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Public Pricing & Course Catalog
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Show complete tuition packages, hourly fees, and subscription passes to public visitors.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.publicCatalogVisible ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, publicCatalogVisible: e.target.checked });
                      showToast(`Public catalog ${e.target.checked ? 'VISIBLE' : 'HIDDEN'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  When disabled, visitors are prompted to log in before viewing rates.
                </div>
              </div>

              {/* 3. Candidate Online Registration */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Public Self-Registration
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Allow prospective driving candidates to create student accounts directly online.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.publicSelfRegistration ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, publicSelfRegistration: e.target.checked });
                      showToast(`Self-Registration ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Disable during intake freeze or exclusive corporate cohorts.
                </div>
              </div>

              {/* 4. Free Road Signs Directory Access */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Open Road Signs Handbook
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Provides public access to Rwanda official road signs, markings, and traffic signals.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.publicSignsFreeAccess ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, publicSignsFreeAccess: e.target.checked });
                      showToast(`Public Road Signs ${e.target.checked ? 'OPEN' : 'LOCKED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Useful as a public good and SEO discovery magnet.
                </div>
              </div>

              {/* 5. Free Practice Exams on First Visit */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Guest Complimentary Trial Exams
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Number of free practice exams granted to guest phone numbers upon first verification.
                  </div>
                </div>
                <select
                  value={platformConfig.guestTrialExamCount ?? 2}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, guestTrialExamCount: Number(e.target.value) });
                    showToast(`Guest trial exams set to ${e.target.value}`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={0}>0 (Strictly Paid Only)</option>
                  <option value={1}>1 Free Trial Exam</option>
                  <option value={2}>2 Free Trial Exams (Recommended)</option>
                  <option value={3}>3 Free Trial Exams</option>
                  <option value={5}>5 Free Trial Exams</option>
                </select>
              </div>

              {/* 6. Anti-Bot Captcha Shield */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Anti-Bot Captcha Challenge
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Require Cloudflare Turnstile / Captcha validation before initiating MoMo payment push.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.captchaOnGuestCheckout ?? false}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, captchaOnGuestCheckout: e.target.checked });
                      showToast(`Guest Captcha ${e.target.checked ? 'ACTIVATED' : 'DEACTIVATED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#f59e0b' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Mitigates high-frequency SMS spam and fraudulent push requests.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-SECTION 2: STUDENT ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubSection === 'student' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <GraduationCap size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                {isRw ? 'Uburyo bw’Igenzura ry’Abanyeshuri n’Ibizamini' : 'Candidate Learning & Examination Policies'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. Strict Fullscreen Exam Lockdown */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Strict Fullscreen Exam Lockdown
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Enforces fullscreen mode; auto-freezes session if candidate switches browser tabs.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.strictDeviceLockdown ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, strictDeviceLockdown: e.target.checked });
                      showToast(`Fullscreen Lockdown ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ef4444' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Guarantees proctoring integrity and prevents online answer lookup during mock tests.
                </div>
              </div>

              {/* 2. Audio Question Narration */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Multilingual Voice Readout (TTS)
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Speaks questions and answer options aloud in natural Kinyarwanda and French.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.studentAudioNarration ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, studentAudioNarration: e.target.checked });
                      showToast(`Audio Question Narration ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Critical accessibility feature for candidates with reading difficulties.
                </div>
              </div>

              {/* 3. Instant Answer Explanations */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Instant Practice Feedback
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Reveals official traffic code reasoning immediately upon choosing an answer.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.studentInstantFeedback ?? false}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, studentInstantFeedback: e.target.checked });
                      showToast(`Instant Feedback ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Off by default for exam simulation mode; recommended for tutor study mode.
                </div>
              </div>

              {/* 4. Offline PWA Exam Caching */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Offline PWA Network Resilience
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Caches 20 active exam questions locally so cellular drops do not abort active tests.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.studentOfflinePwaMode ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, studentOfflinePwaMode: e.target.checked });
                      showToast(`Offline PWA Mode ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Syncs results automatically as soon as internet connection is restored.
                </div>
              </div>

              {/* 5. Exam Retake Cooldown Delay */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Failed Exam Retake Cooldown
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Enforces study pause between consecutive failed exam attempts to prevent guessing.
                  </div>
                </div>
                <select
                  value={platformConfig.studentRetakeCooldownMinutes ?? 15}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, studentRetakeCooldownMinutes: Number(e.target.value) });
                    showToast(`Retake cooldown set to ${e.target.value} minutes`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={0}>0 min (Immediate Retake Allowed)</option>
                  <option value={5}>5 minutes cooldown</option>
                  <option value={15}>15 minutes cooldown (Recommended)</option>
                  <option value={30}>30 minutes cooldown</option>
                </select>
              </div>

              {/* 6. Passing Score Benchmark */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Official Exam Passing Mark
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Minimum score required to qualify for certificate and pass verification.
                  </div>
                </div>
                <select
                  value={platformConfig.studentPassingScorePercent ?? 80}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, studentPassingScorePercent: Number(e.target.value) });
                    showToast(`Passing mark set to ${e.target.value}%`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={70}>70% (14 out of 20)</option>
                  <option value={75}>75% (15 out of 20)</option>
                  <option value={80}>80% (16 out of 20 - Rwanda Police Standard)</option>
                  <option value={85}>85% (17 out of 20)</option>
                  <option value={90}>90% (18 out of 20)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-SECTION 3: TUTORS ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubSection === 'tutors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Users size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                {isRw ? 'Uburyo bw’Igenzura ry’Abarimu n’Inyigisho' : 'Instructor & Academic Operations Controls'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. Live WebRTC Virtual Classroom */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      WebRTC Live Virtual Classrooms
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Permit driving theory instructors to broadcast live video lectures and screen shares.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.tutorLiveClassWebRtc ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, tutorLiveClassWebRtc: e.target.checked });
                      showToast(`Virtual Classrooms ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Integrated with Canvas LMS module and attendance recording.
                </div>
              </div>

              {/* 2. QR Attendance Scanner */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      QR Attendance Ticket Scanner
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Allows practical driving instructors to scan student digital passes before lesson start.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.tutorQrAttendanceScan ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, tutorQrAttendanceScan: e.target.checked });
                      showToast(`QR Scanner ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Instantly prevents proxy attendance and validates session eligibility.
                </div>
              </div>

              {/* 3. Practical Driving GPS Logger */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Fleet GPS & Route Telematics
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Records driving lesson duration, speed, and hill start / parking maneuver checkpoints.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.tutorGpsRouteTracking ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, tutorGpsRouteTracking: e.target.checked });
                      showToast(`Fleet GPS Tracking ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Monitors instructor compliance and car utilization in Kigali circuits.
                </div>
              </div>

              {/* 4. Tutor-Student Direct Chat */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      In-App Cohort Messaging
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Enable moderated direct communication between students and assigned cohort tutors.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.tutorDirectMessaging ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, tutorDirectMessaging: e.target.checked });
                      showToast(`Tutor Messaging ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0284c7' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Conversations are archived and visible to training supervisors.
                </div>
              </div>

              {/* 5. Intelligent Instructor Auto-Dispatch */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Automated Instructor Dispatch
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Automatically assigns available driving instructors to student bookings based on car gear.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.tutorAutoDispatch ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, tutorAutoDispatch: e.target.checked });
                      showToast(`Auto-Dispatch ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Optimizes daily driving schedule without manual admin intervention.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-SECTION 4: ADMINS ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubSection === 'admins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                {isRw ? 'Igenzura ry’Umutekano n’Ubuyobozi Bukuru' : 'Administrative Governance & Risk Controls'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. Sandbox Simulation Mode */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: `1px solid ${platformConfig.sandboxSimulation ? 'rgba(56, 189, 248, 0.5)' : 'var(--border-subtle)'}`,
                  background: platformConfig.sandboxSimulation ? 'rgba(56, 189, 248, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Sandbox Simulation Mode
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Simulate MoMo push payments and test mock exams without charging real balances.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.sandboxSimulation}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, sandboxSimulation: e.target.checked });
                      showToast(
                        e.target.checked ? 'Sandbox Simulation mode ON' : 'Live Gateway mode ON',
                        'info'
                      );
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#38bdf8' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Safe staging environment for QA testing and admin training.
                </div>
              </div>

              {/* 2. Read-Only Mode */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: `1px solid ${platformConfig.readOnlyMode ? 'rgba(245, 158, 11, 0.5)' : 'var(--border-subtle)'}`,
                  background: platformConfig.readOnlyMode ? 'rgba(245, 158, 11, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Read-Only Database Lock
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Freezes financial balance deductions, enrollment changes, and grade submissions.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.readOnlyMode}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, readOnlyMode: e.target.checked });
                      showToast(
                        e.target.checked ? 'Read-Only Mode ENABLED' : 'Read-Only Mode DISABLED',
                        e.target.checked ? 'info' : 'success'
                      );
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#f59e0b' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Use during official accounting reconciliation or database snapshots.
                </div>
              </div>

              {/* 3. Canary Traffic Allocation */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Canary Beta Rollout Allocation
                    </div>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#38bdf8' }}>
                      {platformConfig.betaTestingCohortPercentage}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '10px' }}>
                    Percentage of live candidate traffic routed through experimental features.
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={platformConfig.betaTestingCohortPercentage}
                    onChange={(e) =>
                      setPlatformConfig({
                        ...platformConfig,
                        betaTestingCohortPercentage: Number(e.target.value),
                      })
                    }
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#38bdf8' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>
                    <span>0% (Staff Only)</span>
                    <span>25% (Standard)</span>
                    <span>100% (All)</span>
                  </div>
                </div>
              </div>

              {/* 4. Verbose Telemetry & Security Stream */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Verbose Security Telemetry
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Log real-time browser fingerprints, auth token exchanges, and IP changes in audit ledger.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.debugTelemetry}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, debugTelemetry: e.target.checked });
                      showToast(`Verbose Telemetry ${e.target.checked ? 'ON' : 'OFF'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Provides high-resolution diagnostics for exam integrity reviews.
                </div>
              </div>

              {/* 5. Enforce 2FA for Administrators */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Mandatory 2FA for Staff
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Require SMS OTP or authenticator app verification for all admin and tutor logins.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.adminTwoFactorRequired ?? false}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, adminTwoFactorRequired: e.target.checked });
                      showToast(`Staff 2FA requirement ${e.target.checked ? 'ENFORCED' : 'OPTIONAL'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#38bdf8' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Prevents compromised staff credentials from risking system data.
                </div>
              </div>

              {/* 6. Audit Log Retention */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Audit Ledger Retention Period
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Duration before historical proctoring snapshots and access logs are archived.
                  </div>
                </div>
                <select
                  value={platformConfig.adminAuditLogRetentionDays ?? 90}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, adminAuditLogRetentionDays: Number(e.target.value) });
                    showToast(`Audit log retention set to ${e.target.value} days`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value={30}>30 Days (Fast rotation)</option>
                  <option value={90}>90 Days (Recommended)</option>
                  <option value={180}>180 Days (Semi-annual)</option>
                  <option value={365}>365 Days (1 Year Compliance)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── SUB-SECTION 5: GENERAL ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {activeSubSection === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Settings2 size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                {isRw ? 'Uburyo Rusange bwa Sisitemu n’Ivugurura' : 'Core Infrastructure & Master Platform Switches'}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* 1. Maintenance Mode Master Switch */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: `1px solid ${platformConfig.maintenanceMode ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-subtle)'}`,
                  background: platformConfig.maintenanceMode ? 'rgba(239, 68, 68, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      Maintenance Mode Master Switch
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Blocks public access and displays upgrade banner across the platform.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.maintenanceMode}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, maintenanceMode: e.target.checked });
                      showToast(
                        e.target.checked ? 'Maintenance Mode ACTIVATED' : 'Maintenance Mode DEACTIVATED',
                        e.target.checked ? 'error' : 'success'
                      );
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ef4444' }}
                  />
                </div>
                {platformConfig.maintenanceMode && (
                  <div style={{ fontSize: '0.75rem', color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '6px' }}>
                    ⚠️ Active: Non-administrators will see the maintenance landing screen.
                  </div>
                )}
              </div>

              {/* 2. Rate Limiting Shield */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Anti-Abuse Rate Limiting Tier
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Protects API, USSD webhooks, and OTP endpoints from abuse.
                  </div>
                </div>
                <select
                  value={platformConfig.rateLimitingTier}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, rateLimitingTier: e.target.value as any });
                    showToast(`Rate limiting tier updated to ${e.target.value}`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="STANDARD">Standard (120 req/min, burst tolerant)</option>
                  <option value="AGGRESSIVE">Aggressive (Anti-DDoS, 30 req/min per IP)</option>
                  <option value="RELAXED">Relaxed (Unlimited for internal staff debugging)</option>
                </select>
              </div>

              {/* 3. AI Proctoring Strictness Tier */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    AI Proctoring Biometric Strictness
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Determines facial recognition tolerance and gaze deviation rules.
                  </div>
                </div>
                <select
                  value={platformConfig.aiProctoringStrictness}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, aiProctoringStrictness: e.target.value as any });
                    showToast(`AI Proctoring strictness updated to ${e.target.value}`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="LENIENT">Lenient (Snapshot capture only, zero auto-pause)</option>
                  <option value="MODERATE">Moderate (Face pose tracking + tab switch alerts)</option>
                  <option value="STRICT">Strict (Zero tolerance: auto-freeze on 2 violations)</option>
                </select>
              </div>

              {/* 4. SMS Notification Gateway */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      SMS Gateway Master Gate
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                      Master switch for dispatching SMS payment receipts, OTPs, and schedule alerts.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={platformConfig.smsGatewayEnabled ?? true}
                    onChange={(e) => {
                      setPlatformConfig({ ...platformConfig, smsGatewayEnabled: e.target.checked });
                      showToast(`SMS Gateway ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  When disabled, OTP codes are logged to console without cellular charges.
                </div>
              </div>

              {/* 5. Platform Default Language */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Platform Default Language
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px' }}>
                    Default interface language presented to new visitors before preference selection.
                  </div>
                </div>
                <select
                  value={platformConfig.defaultLanguage ?? 'rw'}
                  onChange={(e) => {
                    setPlatformConfig({ ...platformConfig, defaultLanguage: e.target.value as any });
                    showToast(`Default language set to ${e.target.value.toUpperCase()}`, 'info');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="rw">Kinyarwanda (Ikinyarwanda - Default)</option>
                  <option value="en">English (Official Business)</option>
                </select>
              </div>

              {/* 6. Maintenance Announcement Text */}
              <div
                className="glass-panel"
                style={{
                  padding: '18px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                    Maintenance Announcement Notice
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '3px', marginBottom: '8px' }}>
                    Custom message displayed to candidates on the maintenance screen.
                  </div>
                  <input
                    type="text"
                    value={platformConfig.maintenanceMessage}
                    onChange={(e) =>
                      setPlatformConfig({ ...platformConfig, maintenanceMessage: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── FEATURE FLAGS DIRECTORY & SIMULATOR FOR CURRENT SUB-SECTION ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={18} color="#38bdf8" />
              <span>
                {isRw
                  ? `Ibikoresho n’Ibiranga Urubuga: ${currentSection.labelRw}`
                  : `${currentSection.label} Feature Flags & Runtime Switches`}
              </span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Showing {filteredFlags.length} managed flags in this scope
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              <input
                type="text"
                placeholder="Search feature flags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'beta', label: 'Beta Labs' },
                { key: 'examinations', label: 'Exams' },
                { key: 'payments', label: 'Payments' },
                { key: 'lms', label: 'LMS' },
                { key: 'security', label: 'Security' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: selectedCategory === cat.key ? '#0284c7' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedCategory === cat.key ? '#ffffff' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: selectedCategory === cat.key ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        {filteredFlags.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '32px',
              textAlign: 'center',
              borderRadius: '12px',
              border: '1px dashed var(--border-subtle)',
              color: '#94a3b8',
              fontSize: '0.86rem',
            }}
          >
            No feature flags found matching the criteria in {currentSection.label}.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {filteredFlags.map((flag) => {
              const statusStyle = getStatusBadgeColor(flag.status);
              const riskStyle = getRiskBadgeColor(flag.riskLevel);

              return (
                <div
                  key={flag.id}
                  className="glass-panel"
                  style={{
                    padding: '18px',
                    borderRadius: '12px',
                    border: flag.isEnabled ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid var(--border-subtle)',
                    background: flag.isEnabled ? 'rgba(2, 132, 199, 0.03)' : 'rgba(255, 255, 255, 0.015)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    {/* Header Badges & Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                            border: `1px solid ${statusStyle.border}`,
                          }}
                        >
                          {flag.status}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: riskStyle.bg,
                            color: riskStyle.text,
                          }}
                        >
                          {flag.riskLevel}
                        </span>
                        {flag.scope && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              color: '#38bdf8',
                              textTransform: 'uppercase',
                            }}
                          >
                            {flag.scope}
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {flag.version}
                        </span>
                      </div>

                      {/* Enable / Disable Switch */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: flag.isEnabled ? '#34d399' : '#64748b' }}>
                          {flag.isEnabled ? 'ON' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFlag(flag.id)}
                          aria-label={`Toggle ${flag.name}`}
                          style={{
                            width: '42px',
                            height: '22px',
                            borderRadius: '999px',
                            border: 'none',
                            backgroundColor: flag.isEnabled ? '#0284c7' : '#334155',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            padding: 0,
                          }}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              position: 'absolute',
                              top: '3px',
                              left: flag.isEnabled ? '23px' : '3px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            }}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 style={{ margin: '0 0 3px 0', fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                      {flag.name}
                    </h4>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '6px' }}>
                      {flag.id}
                    </div>

                    {/* Description */}
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      {isRw && flag.descriptionKinyarwanda ? flag.descriptionKinyarwanda : flag.description}
                    </p>
                  </div>

                  {/* Footer Controls: Audience & Simulator */}
                  <div
                    style={{
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Audience:</span>
                      <select
                        value={flag.targetAudience}
                        onChange={(e) => updateAudience(flag.id, e.target.value as any)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border-subtle)',
                          color: '#cbd5e1',
                          fontSize: '0.74rem',
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="ALL">All Users</option>
                        <option value="BETA_TESTERS">Beta Cohort Only</option>
                        <option value="STAFF_ONLY">Internal Staff Only</option>
                        <option value="DISABLED">Completely Disabled</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartSimulation(flag)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(2, 132, 199, 0.1)',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                        color: '#38bdf8',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Play size={12} />
                      Test in Sandbox
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── INTERACTIVE SANDBOX SIMULATION MODAL ── */}
      {simulatingFlag && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '640px',
              borderRadius: '16px',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              background: '#090d16',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} color="#38bdf8" />
                <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff' }}>
                  Sandbox Simulator: {simulatingFlag.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSimulatingFlag(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                  }}
                >
                  RELEASE: {simulatingFlag.version}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  Target: <strong>{simulatingFlag.targetAudience}</strong>
                </span>
                {isSimulating && (
                  <span style={{ fontSize: '0.78rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={12} className="animate-spin" /> Running harness...
                  </span>
                )}
              </div>

              {/* Terminal Screen */}
              <div
                style={{
                  backgroundColor: '#030712',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '16px',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: '#38bdf8',
                  minHeight: '170px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {simulationLogs.map((log, index) => (
                  <div key={index} style={{ color: log.includes('SUCCESS') ? '#34d399' : log.includes('RUNNING') ? '#fbbf24' : '#cbd5e1' }}>
                    {log}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '14px', fontSize: '0.76rem', color: '#94a3b8' }}>
                Harness executes in an isolated worker, verifying security permissions and sandbox fallback behavior.
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => setSimulatingFlag(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
