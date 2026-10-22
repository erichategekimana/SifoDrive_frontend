import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  Clock,
  Users,
  Power,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Spinner } from '../../../components/common/Spinner';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { AdminService, type AdminExamItem } from '../../../core/services/AdminService';

interface ExamsDirectoryTabProps {
  cohorts?: Array<{ id: string | number; name: string; code?: string }>;
  courses?: Array<{ id: string | number; title?: string; name?: string }>;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const ExamsDirectoryTab: React.FC<ExamsDirectoryTabProps> = ({
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN' || Boolean(user?.isSystemAdmin?.());
  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN' || Boolean(user?.isTrainingAdmin?.());
  const canPublish = isSystemAdmin || isTrainingAdmin;

  const [examsList, setExamsList] = useState<AdminExamItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOfficialExams();
      setExamsList(data || []);
    } catch (err: any) {
      console.warn('Failed to load official exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleTogglePublish = async (e: React.MouseEvent, exam: AdminExamItem) => {
    e.stopPropagation(); // Do not trigger card click
    setPublishingId(exam.id);
    try {
      const updated = await adminService.togglePublishOfficialExam(exam.id);
      success(`Exam "${updated.title}" is now ${updated.is_published ? 'published' : 'draft'}.`);
      
      const isPublicExam = exam.exam_type === 'PUBLIC_PRACTICE' || exam.id === 'e2222222-2222-4222-8222-222222222222';
      if (isPublicExam) {
        localStorage.setItem('sifo_public_exam_is_published', String(updated.is_published));
        if (!updated.is_published) {
          // Public Examination got unpublished -> automatically disable all plans
          try {
            const stored = localStorage.getItem('sifo_admin_exam_packages');
            if (stored) {
              const pkgs = JSON.parse(stored);
              if (Array.isArray(pkgs)) {
                const disabledPkgs = pkgs.map((p) => ({ ...p, isActive: false, is_active: false }));
                localStorage.setItem('sifo_admin_exam_packages', JSON.stringify(disabledPkgs));
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new CustomEvent('sifo_exam_packages_updated', { detail: disabledPkgs }));
                const channel = new BroadcastChannel('sifo_exam_packages_sync');
                channel.postMessage({ type: 'PACKAGES_UPDATED', packages: disabledPkgs });
                channel.close();
              }
            }
          } catch {}
        }
        window.dispatchEvent(new CustomEvent('sifo_public_exam_publish_changed', { detail: { is_published: updated.is_published } }));
      }

      fetchExams();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toastError(err?.response?.data?.message || 'Failed to toggle publication status.');
    } finally {
      setPublishingId(null);
    }
  };

  const handleOpenAuditPage = (exam: AdminExamItem) => {
    const typeKey = exam.exam_type === 'STUDENT' ? 'student' : 'public';
    navigate(`/admin/examinations/audit/${typeKey}`);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Clean Unboxed Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px 16px',
          padding: '4px 2px 8px 2px',
        }}
      >
        <div style={{ maxWidth: '850px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Examination Engine
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              System Governed
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.45 }}>
            No manual question creation required. The engine automatically draws <strong>20 randomized questions</strong> from the central bank across official police domains (20-min timer, 12/20 pass score, automated uneditable grading).
          </p>
        </div>

        <div style={{ alignSelf: 'flex-start' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium, var(--border-subtle))',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              letterSpacing: '0.01em',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--primary)',
              }}
            />
            <span>2 Standard Exams Available</span>
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Spinner size={32} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {examsList.map((exam) => {
            const isStudent = exam.exam_type === 'STUDENT';
            const isPublished = exam.is_published || exam.status === 'PUBLISHED';
            const isCurrentlyPublishing = publishingId === exam.id;

            return (
              <div
                key={exam.id}
                onClick={() => handleOpenAuditPage(exam)}
                style={{
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                {/* Header row: Badges, Title, Status, ONLY Publish Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {isStudent ? '1. Student Official Exam' : '2. Public Examination'}
                    </span>

                    {/* Status Badge */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: isPublished ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface-elevated)',
                        border: isPublished ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
                        color: isPublished ? '#10B981' : 'var(--text-muted)',
                      }}
                    >
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isPublished ? '#10B981' : 'var(--text-muted)',
                        }}
                      />
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>

                  {/* ONLY 'Publish' Action Button - UNTOUCHED COLORS */}
                  {canPublish && (
                    <button
                      type="button"
                      onClick={(e) => handleTogglePublish(e, exam)}
                      disabled={isCurrentlyPublishing}
                      style={{
                        padding: '7px 18px',
                        borderRadius: '9999px',
                        background: isPublished
                          ? 'rgba(239, 68, 68, 0.18)'
                          : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        border: isPublished
                          ? '1px solid rgba(239, 68, 68, 0.4)'
                          : '1px solid rgba(16, 185, 129, 0.5)',
                        color: '#FFFFFF',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isPublished ? 'none' : '0 3px 12px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Power size={13} />
                      <span>{isCurrentlyPublishing ? 'Updating...' : isPublished ? 'Unpublish' : 'Publish'}</span>
                    </button>
                  )}
                </div>

                {/* Main Title & Description */}
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {exam.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {exam.instructions ||
                      (isStudent
                        ? 'Mandatory driving theory examination for students taking the driver training curriculum. Includes full hardware pre-flight checks, camera and microphone monitoring, identity verification, and tab-departure tracking. Exactly 1 attempt.'
                        : 'Practice exam simulator for guest users and public visitors. Pay per exam or buy discounted multi-exam bundles using MTN/Airtel MoMo paying number. Instant auto-grading and answer rationale.')}
                  </p>
                </div>

                {/* Rules & Invariants Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>20-Min Timer:</strong> Auto-submits on expiry
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={14} style={{ color: '#F59E0B' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Score & Pass:</strong> 1 pt/Q • 12/20 to pass
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {isStudent ? (
                        <><strong style={{ color: 'var(--text-primary)' }}>Proctoring:</strong> Webcam + Mic + Tab Departure</>
                      ) : (
                        <><strong style={{ color: 'var(--text-primary)' }}>Public MoMo:</strong> Pay 1k, Bundles (4k, 7k, 15k)</>
                      )}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {isStudent ? (
                        <><strong style={{ color: 'var(--text-primary)' }}>Attempts:</strong> Exactly 1 attempt</>
                      ) : (
                        <><strong style={{ color: 'var(--text-primary)' }}>Review:</strong> Instant Answers & Explanations</>
                      )}
                    </span>
                  </div>
                </div>

                {/* Clickable Prompt Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    {isStudent
                      ? 'Click exam to open full student audit, attempts, proctoring violations & certificates'
                      : 'Click exam to open full sales audit, MoMo purchases, revenue ledger & practice attempts'}
                  </span>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExamsDirectoryTab;
