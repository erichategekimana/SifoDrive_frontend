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
  Sparkles,
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
      {/* Engine Invariant System Note */}
      <div
        style={{
          padding: '14px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(30, 41, 59, 0.4) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={20} color="#38BDF8" />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF' }}>
              Standard Driving Theory Examination Engine
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.75)' }}>
              No one creates exam questions. The engine dynamically pulls <strong>20 random questions</strong> from the central bank across official domains (1 pt each, 20-min timer, 12/20 pass score). Grades are auto-graded and uneditable.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            2 Standard System Exams
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
                  padding: '24px 28px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%)',
                  border: isPublished
                    ? '1px solid rgba(56, 189, 248, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#38BDF8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = isPublished
                    ? '1px solid rgba(56, 189, 248, 0.35)'
                    : '1px solid rgba(255, 255, 255, 0.12)';
                }}
              >
                {/* Header row: Badges, Title, Status, ONLY Publish Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        letterSpacing: '0.02em',
                        background: 'rgba(56, 189, 248, 0.18)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        color: '#38BDF8',
                      }}
                    >
                      {isStudent ? '1. Student Official Exam' : '2. Public & Guest Practice Exam'}
                    </span>

                    {!isStudent && (
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: 'rgba(255, 255, 255, 0.85)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Sparkles size={12} color="#38BDF8" />
                        <span>For Everyone • Buy via MoMo</span>
                      </span>
                    )}

                    {/* Status Badge */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                        border: isPublished ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 255, 255, 0.2)',
                        color: isPublished ? '#34D399' : 'rgba(255, 255, 255, 0.75)',
                      }}
                    >
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isPublished ? '#34D399' : 'rgba(255, 255, 255, 0.5)',
                        }}
                      />
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>

                  {/* ONLY 'Publish' Action Button */}
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
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {exam.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5 }}>
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
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} color="#38BDF8" />
                    <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                      <strong>20-Min Timer:</strong> Auto-submits on expiry
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={14} color="#F59E0B" />
                    <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                      <strong>Score & Pass:</strong> 1 pt/Q • 12/20 to pass
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={14} color="#38BDF8" />
                    <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                      {isStudent ? (
                        <><strong>Proctoring:</strong> Webcam + Mic + Tab Departure</>
                      ) : (
                        <><strong>Public MoMo:</strong> Pay 1k, Bundles (4k, 7k, 15k)</>
                      )}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={14} color="#38BDF8" />
                    <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                      {isStudent ? (
                        <><strong>Attempts:</strong> Exactly 1 attempt</>
                      ) : (
                        <><strong>Review:</strong> Instant Answers & Explanations</>
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
                    borderTop: '1px solid rgba(255, 255, 255, 0.07)',
                    fontSize: '0.78rem',
                    color: '#38BDF8',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChevronRight size={14} />
                    {isStudent
                      ? 'Click exam to open full student audit, attempts, proctoring violations & certificates'
                      : 'Click exam to open full sales audit, MoMo purchases, revenue ledger & practice attempts'}
                  </span>
                  <ArrowRight size={14} />
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
