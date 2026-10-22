import React, { useState, useEffect } from 'react';
import {
  Save,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { AdminService } from '../../../../core/services/AdminService';

export interface ExamPackageConfig {
  key: string;
  name: string;
  badge: string;
  min_exams: number;
  max_exams: number;
  default_exams: number;
  price_per_exam_rwf: number;
  description: string;
  isActive: boolean;
  interval?: string; // For Enterprise time-based
}


export interface GuestTrialAndDiscountConfig {
  freeTrialExamsOnSignup: number;
  singleExamPrice: number;
  tier1Threshold: number;
  tier1DiscountPercent: number;
  tier2Threshold: number;
  tier2DiscountPercent: number;
  allowGuestPayAsYouGo: boolean;
  creditsNeverExpire: boolean;
}

const DEFAULT_EXAM_PACKAGES: ExamPackageConfig[] = [
  {
    key: 'BASIC',
    name: 'Exam',
    badge: 'Basic',
    min_exams: 1,
    max_exams: 5,
    default_exams: 1,
    price_per_exam_rwf: 1000,
    description: '1 to 5 practice exam sittings with instant scoring and question rationale.',
    isActive: true,
  },
  {
    key: 'REGULAR',
    name: 'Exam',
    badge: 'Regular',
    min_exams: 6,
    max_exams: 10,
    default_exams: 6,
    price_per_exam_rwf: 800,
    description: '6 to 10 distinct randomly generated 20-question practice attempts across official domains.',
    isActive: true,
  },
  {
    key: 'PREMIUM',
    name: 'Exam',
    badge: 'Premium',
    min_exams: 11,
    max_exams: 20,
    default_exams: 11,
    price_per_exam_rwf: 700,
    description: '11 to 20 full mock exams pulling from all official Rwanda Traffic Police theory domains.',
    isActive: true,
  },
  {
    key: 'ENTERPRISE',
    name: 'Exam',
    badge: 'Enterprise',
    min_exams: 0,
    max_exams: 999999,
    default_exams: 1,
    price_per_exam_rwf: 50000,
    interval: 'Monthly / Academy',
    description: 'Unlimited practice exam attempts for driving schools, academies, and institutional cohorts.',
    isActive: true,
  },
];


export const ExamPlansSection: React.FC = () => {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const adminService = AdminService.getInstance();

  // Exam Packages state
  const [examPackages, setExamPackages] = useState<ExamPackageConfig[]>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_exam_packages');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            isActive: p.isActive !== false && p.is_active !== false,
          }));
        }
      }
    } catch {}
    return DEFAULT_EXAM_PACKAGES;
  });

  // Track whether the Public Examination is published
  const [isPublicExamPublished, setIsPublicExamPublished] = useState<boolean>(() => {
    const stored = localStorage.getItem('sifo_public_exam_is_published');
    return stored === null ? true : stored === 'true';
  });

  // Sync with backend on mount
  useEffect(() => {
    // Check official exams list to accurately determine if public exam is published
    adminService
      .getOfficialExams()
      .then((exams) => {
        if (Array.isArray(exams)) {
          const publicExam = exams.find(
            (e) => e.exam_type === 'PUBLIC_PRACTICE' || e.id === 'e2222222-2222-4222-8222-222222222222'
          );
          if (publicExam) {
            const isPub = Boolean(publicExam.is_published);
            setIsPublicExamPublished(isPub);
            localStorage.setItem('sifo_public_exam_is_published', String(isPub));
            if (!isPub) {
              // Immediately turn off local package active states
              setExamPackages((prev) => prev.map((p) => ({ ...p, isActive: false, is_active: false })));
            }
          }
        }
      })
      .catch(() => {});

    adminService
      .getPublicExamPackages(true)
      .then((remote) => {
        if (Array.isArray(remote) && remote.length > 0) {
          setExamPackages((prev) => {
            const stored = localStorage.getItem('sifo_admin_exam_packages');
            return prev.map((local) => {
              const rem = remote.find((r) => r.key === local.key);
              if (!rem) return local;
              const remActive = rem.isActive !== false && (rem as any).is_active !== false;
              // If local is already stored, prioritize local; otherwise adopt remote
              const finalActive = stored !== null ? local.isActive : remActive;
              return {
                ...local,
                price_per_exam_rwf: stored !== null ? local.price_per_exam_rwf : (rem.price_per_exam_rwf ?? local.price_per_exam_rwf),
                min_exams: stored !== null ? local.min_exams : (rem.min_exams ?? local.min_exams),
                max_exams: stored !== null ? local.max_exams : (rem.max_exams ?? local.max_exams),
                default_exams: stored !== null ? local.default_exams : (rem.default_exams ?? local.default_exams),
                isActive: finalActive,
                is_active: finalActive,
              };
            });
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch remote exam packages in admin:', err);
      });

    const handlePublishChanged = (e: any) => {
      const isPub = Boolean(e?.detail?.is_published);
      setIsPublicExamPublished(isPub);
      if (!isPub) {
        setExamPackages((prev) => prev.map((p) => ({ ...p, isActive: false, is_active: false })));
      }
    };

    window.addEventListener('sifo_public_exam_publish_changed', handlePublishChanged);
    return () => {
      window.removeEventListener('sifo_public_exam_publish_changed', handlePublishChanged);
    };
  }, []);

  // Guest & Bundle Discount Rules
  const [guestConfig, setGuestConfig] = useState<GuestTrialAndDiscountConfig>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_guest_trials');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      freeTrialExamsOnSignup: 1,
      singleExamPrice: 1000,
      tier1Threshold: 5,
      tier1DiscountPercent: 5,
      tier2Threshold: 10,
      tier2DiscountPercent: 10,
      allowGuestPayAsYouGo: true,
      creditsNeverExpire: true,
    };
  });

  // Update Guest & Candidate settings helper
  const handleUpdateGuestSetting = <K extends keyof GuestTrialAndDiscountConfig>(
    key: K,
    value: GuestTrialAndDiscountConfig[K]
  ) => {
    setGuestConfig((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem('sifo_admin_settings_guest_trials', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('sifo_guest_config_updated', { detail: updated }));
      } catch {}
      return updated;
    });
  };

  // Save handler
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('sifo_admin_exam_packages', JSON.stringify(examPackages));
      localStorage.setItem('sifo_admin_settings_guest_trials', JSON.stringify(guestConfig));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('sifo_exam_packages_updated', { detail: examPackages }));
      window.dispatchEvent(new CustomEvent('sifo_guest_config_updated', { detail: guestConfig }));
      try {
        const channel = new BroadcastChannel('sifo_exam_packages_sync');
        channel.postMessage({ type: 'PACKAGES_UPDATED', packages: examPackages });
        channel.close();
      } catch {}

      await adminService.updateExamPackages(examPackages);

      showToast('Exam packages and candidate checkout rules saved successfully.', 'success');
    } catch (e) {
      showToast('Failed to save plans to server.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Exam Package Active
  const handleToggleExamPackage = (key: string) => {
    const targetCurrent = examPackages.find((p) => p.key === key);
    const isCurrentlyActive = targetCurrent?.isActive !== false && (targetCurrent as any)?.is_active !== false;

    // Rule: If public examination is unpublished, plans CANNOT be enabled
    if (!isCurrentlyActive && !isPublicExamPublished) {
      showToast(
        'Cannot activate plan: Public Examination is currently unpublished. Publish the exam in the "Exam" tab first.',
        'error'
      );
      return;
    }

    setExamPackages((prev) => {
      const updated = prev.map((pkg) => {
        if (pkg.key === key) {
          const nextActive = !isCurrentlyActive;
          return {
            ...pkg,
            isActive: nextActive,
            is_active: nextActive,
          };
        }
        return pkg;
      });
      const target = updated.find((p) => p.key === key);
      try {
        localStorage.setItem('sifo_admin_exam_packages', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('sifo_exam_packages_updated', { detail: updated }));
        const channel = new BroadcastChannel('sifo_exam_packages_sync');
        channel.postMessage({ type: 'PACKAGES_UPDATED', packages: updated });
        channel.close();
      } catch {}

      // Immediately sync with backend so all browsers/guests update
      adminService.updateExamPackages(updated).catch((err) => {
        console.warn('Failed to sync package toggle to backend:', err);
      });

      if (target) {
        showToast(
          target.isActive
            ? `${target.badge || target.name} plan is now active on public pricing.`
            : `${target.badge || target.name} plan is now hidden from public pricing.`,
          'info'
        );
      }
      return updated;
    });
  };

  // Update Exam Package Price
  const handleUpdateExamPrice = (key: string, newRate: number) => {
    setExamPackages((prev) => {
      const updated = prev.map((pkg) => (pkg.key === key ? { ...pkg, price_per_exam_rwf: newRate } : pkg));
      try {
        localStorage.setItem('sifo_admin_exam_packages', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('sifo_exam_packages_updated', { detail: updated }));
        const channel = new BroadcastChannel('sifo_exam_packages_sync');
        channel.postMessage({ type: 'PACKAGES_UPDATED', packages: updated });
        channel.close();
      } catch {}
      return updated;
    });
  };

  // Update Exam Package Range
  const handleUpdateExamRange = (key: string, min: number, max: number, defaultExams: number) => {
    setExamPackages((prev) => {
      const updated = prev.map((pkg) =>
        pkg.key === key
          ? { ...pkg, min_exams: min, max_exams: max, default_exams: defaultExams }
          : pkg
      );
      try {
        localStorage.setItem('sifo_admin_exam_packages', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('sifo_exam_packages_updated', { detail: updated }));
        const channel = new BroadcastChannel('sifo_exam_packages_sync');
        channel.postMessage({ type: 'PACKAGES_UPDATED', packages: updated });
        channel.close();
      } catch {}
      return updated;
    });
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Header */}
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Exam Packages &amp; Pricing
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              System Admin
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Configure official practice exam packages (Basic, Regular, Premium, Enterprise), rates, limits, and candidate checkout rules.
          </p>
        </div>

        <div>
          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.84rem',
            }}
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* PRACTICE EXAM PACKAGES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isPublicExamPublished && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f87171' }}>
                  Public Examination Engine is Unpublished (Draft)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  All pricing and practice subscription plans are automatically disabled. To sell or activate plans on the public pricing page, publish the Public Examination in the <strong>Exam</strong> tab first.
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {examPackages.map((pkg) => {
              const isEnterprise = pkg.key === 'ENTERPRISE';
              const canToggle = isPublicExamPublished || pkg.isActive;
              return (
                <div
                  key={pkg.key}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    border: pkg.isActive ? '1px solid var(--border-subtle)' : '1px dashed var(--border-subtle)',
                    background: pkg.isActive ? 'var(--bg-surface)' : 'rgba(0,0,0,0.15)',
                    opacity: !isPublicExamPublished ? 0.5 : pkg.isActive ? 1 : 0.6,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-primary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {pkg.badge}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {isEnterprise ? 'Time-based Access' : `${pkg.min_exams}–${pkg.max_exams} Exams`}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                      {pkg.badge} Plan
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                      {pkg.description}
                    </p>

                    {/* Price Rate input */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {isEnterprise ? 'Price (RWF) / Duration' : 'Rate per Exam (RWF)'}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          step={50}
                          value={pkg.price_per_exam_rwf}
                          onChange={(e) => handleUpdateExamPrice(pkg.key, Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'var(--bg-surface-elevated)',
                            border: '1px solid var(--border-medium)',
                            color: 'var(--text-primary)',
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            outline: 'none',
                          }}
                        />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                          {isEnterprise ? '/ Month' : 'RWF'}
                        </span>
                      </div>
                    </div>

                    {/* Exam range configuration (for non-enterprise) */}
                    {!isEnterprise ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                            Min Exams
                          </label>
                          <input
                            type="number"
                            value={pkg.min_exams}
                            onChange={(e) =>
                              handleUpdateExamRange(pkg.key, Number(e.target.value), pkg.max_exams, pkg.default_exams)
                            }
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-primary)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                            Max Exams
                          </label>
                          <input
                            type="number"
                            value={pkg.max_exams}
                            onChange={(e) =>
                              handleUpdateExamRange(pkg.key, pkg.min_exams, Number(e.target.value), pkg.default_exams)
                            }
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-primary)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                            Default
                          </label>
                          <input
                            type="number"
                            value={pkg.default_exams}
                            onChange={(e) =>
                              handleUpdateExamRange(pkg.key, pkg.min_exams, pkg.max_exams, Number(e.target.value))
                            }
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-primary)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(168, 85, 247, 0.1)',
                          border: '1px solid rgba(168, 85, 247, 0.25)',
                          fontSize: '0.74rem',
                          color: '#c084fc',
                          marginBottom: '14px',
                        }}
                      >
                        Enterprise tier supports unlimited exam sittings billed on weekly, monthly, or annual subscription cycles.
                      </div>
                    )}
                  </div>

                  {/* Toggle Active */}
                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.76rem', color: pkg.isActive ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {pkg.isActive ? 'Active on Public Pricing' : 'Disabled / Hidden'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleExamPackage(pkg.key)}
                      disabled={!canToggle}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: canToggle ? 'pointer' : 'not-allowed',
                        color: pkg.isActive ? 'var(--primary)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: canToggle ? 1 : 0.4,
                      }}
                      title={!isPublicExamPublished ? 'Cannot enable plan while Public Examination is unpublished' : undefined}
                    >
                      {pkg.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CANDIDATE ACCESS & CHECKOUT RULES */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Candidate Access &amp; Credit Rules
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Configure initial trial allowances and credit validity for practice exams.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
              }}
            >
              {/* Free Trial on Registration */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}
                  >
                    Free Trial on Registration
                  </label>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Mock exam attempts automatically granted to newly registered candidates.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={guestConfig.freeTrialExamsOnSignup}
                    onChange={(e) =>
                      handleUpdateGuestSetting('freeTrialExamsOnSignup', Math.max(0, Number(e.target.value)))
                    }
                    style={{
                      width: '90px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {guestConfig.freeTrialExamsOnSignup === 1 ? 'Exam Attempt' : 'Exam Attempts'}
                  </span>
                </div>
              </div>

              {/* Exam Credits Never Expire */}
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Exam Credits Never Expire (Valid until completed)
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Purchased exam credits remain in candidate balances indefinitely until taken.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateGuestSetting('creditsNeverExpire', !guestConfig.creditsNeverExpire)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: guestConfig.creditsNeverExpire ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                  title={guestConfig.creditsNeverExpire ? 'Enabled' : 'Disabled'}
                >
                  {guestConfig.creditsNeverExpire ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ExamPlansSection;
