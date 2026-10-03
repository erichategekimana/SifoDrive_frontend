import React, { useEffect, useState, useCallback } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Search,
  RefreshCw,
  X,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ReviewerService,
  type ReviewerStatsDTO,
} from '../../core/services/ReviewerService';
import {
  AdminService,
  type ExamSessionItem,
  type ExamSessionDetailItem,
} from '../../core/services/AdminService';
import { Spinner } from '../../components/common/Spinner';

export const BoardReviewerDashboard: React.FC = () => {
  const { user } = useAuth();
  const adminService = AdminService.getInstance();
  const reviewerService = ReviewerService.getInstance();

  // Reviewer credentials & profile stats
  const [stats, setStats] = useState<ReviewerStatsDTO | null>(null);

  // Exam sessions queue from DB
  const [sessions, setSessions] = useState<ExamSessionItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'PENDING' | 'TRAINING' | 'CERTIFIED' | 'REJECTED' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<'ALL' | 'B2C' | 'B2B'>('ALL');
  const [cohortFilter, setCohortFilter] = useState('ALL');
  const [cohortsList, setCohortsList] = useState<{ id: string; name: string }[]>([]);

  // Detailed Inspection Modal
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [inspectDetail, setInspectDetail] = useState<ExamSessionDetailItem | null>(null);
  const [isInspectLoading, setIsInspectLoading] = useState(false);
  const [modalTab, setModalTab] = useState<'QUESTIONS' | 'PROCTORING'>('QUESTIONS');
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load Reviewer Profile & Metrics
  const loadStats = useCallback(async () => {
    try {
      const data = await reviewerService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load reviewer profile stats:', err);
    }
  }, []);

  // Load Cohort Choices
  useEffect(() => {
    adminService
      .getCohorts()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.results || [];
        setCohortsList(list.map((c: any) => ({ id: c.id, name: c.name })));
      })
      .catch(() => {});
  }, []);

  // Fetch real exam sessions from database
  const fetchSessions = useCallback(async () => {
    try {
      setIsSessionsLoading(true);
      const params: Record<string, any> = {};

      if (activeTab === 'PENDING') {
        params.status = 'BOARD_REVIEW';
      } else if (activeTab === 'TRAINING') {
        params.status = 'TRAINING_REVIEW';
      } else if (activeTab === 'CERTIFIED') {
        params.status = 'APPROVED';
      } else if (activeTab === 'REJECTED') {
        params.status = 'REJECTED';
      }

      if (trackFilter !== 'ALL') {
        params.track = trackFilter;
      }
      if (cohortFilter !== 'ALL') {
        params.cohort = cohortFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await adminService.getExamSessions(params);
      const list = res.results || [];
      setSessions(list);
      setTotalCount(res.count ?? list.length);
    } catch (err) {
      console.error('Failed to fetch exam review sessions:', err);
    } finally {
      setIsSessionsLoading(false);
    }
  }, [activeTab, trackFilter, cohortFilter, searchQuery]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Open modal and load full question breakdown & proctoring events
  const handleOpenInspect = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setIsInspectLoading(true);
    setActionNotes('');
    setActionFeedback(null);
    setModalTab('QUESTIONS');
    try {
      const detail = await adminService.getExamSessionDetail(sessionId);
      setInspectDetail(detail);
    } catch (err: any) {
      console.error('Failed to load exam detail:', err);
    } finally {
      setIsInspectLoading(false);
    }
  };

  const handleCloseInspect = () => {
    setSelectedSessionId(null);
    setInspectDetail(null);
    setActionNotes('');
    setActionFeedback(null);
  };

  // Submit Stage 1 Adjudication (Approve or Reject)
  const handleAdjudicate = async (decision: 'APPROVE' | 'REJECT') => {
    if (!inspectDetail) return;

    if (decision === 'APPROVE' && !actionNotes.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'A review comment is mandatory to approve Stage 1 Board Certification.',
      });
      return;
    }

    setIsSubmittingAction(true);
    setActionFeedback(null);

    try {
      await adminService.executeExamStageAction(
        inspectDetail.id,
        'BOARD_DECISION',
        decision,
        actionNotes.trim()
      );

      setActionFeedback({
        type: 'success',
        message:
          decision === 'APPROVE'
            ? 'Exam certified and successfully forwarded to Stage 2 Training Admin audit.'
            : 'Exam disqualified and marked as REJECTED in the audit registry.',
      });

      // Reload detail to update modal state
      const updated = await adminService.getExamSessionDetail(inspectDetail.id);
      setInspectDetail(updated);

      // Refresh list and stats
      fetchSessions();
      loadStats();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Adjudication action failed.';
      setActionFeedback({ type: 'error', message: msg });
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const questionsList = (inspectDetail as any)?.session_questions || inspectDetail?.questions || [];
  const proctoringEvents = inspectDetail?.proctoring_events || [];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. Top Header Banner & Reviewer Credentials ───────────────────── */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: '22px 28px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(0, 85, 165, 0.08)',
              border: '1px solid rgba(0, 85, 165, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0055A5',
              flexShrink: 0,
            }}
          >
            <Award size={26} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <span
                style={{
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                }}
              >
                {stats?.reviewer_code || 'SIFO-REV-OFFICIAL'}
              </span>

              {stats?.inspector_badge_number && (
                <span
                  style={{
                    background: 'rgba(0, 85, 165, 0.08)',
                    color: '#0055A5',
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  Badge: {stats.inspector_badge_number}
                </span>
              )}

              <span
                style={{
                  background: 'rgba(22, 163, 74, 0.08)',
                  color: '#16a34a',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                ● Active Accreditation
              </span>
            </div>

            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '2px 0 4px 0', color: 'var(--text-primary)' }}>
              {user?.fullName || 'Official Board Reviewer'} — National Board Examination Console
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              {stats?.accreditation_authority || 'Rwanda National Police / Sifo Board of Examiners'} &bull; Stage 1 Examination Certification
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchSessions();
            loadStats();
          }}
          disabled={isSessionsLoading}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.84rem',
            padding: '8px 16px',
            background: 'var(--bg-surface)',
          }}
        >
          <RefreshCw size={14} className={isSessionsLoading ? 'spin' : ''} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* ── 2. Caseload Summary Metric Cards ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Pending Review Card */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 22px',
            border: activeTab === 'PENDING' ? '2px solid #0055A5' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={() => setActiveTab('PENDING')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Awaiting Board Review
            </span>
            <span
              style={{
                background: 'rgba(217, 119, 6, 0.1)',
                color: '#d97706',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
            >
              Stage 1
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#d97706', marginTop: '6px' }}>
            {stats?.pending_queue_count ?? 0}
          </div>
          <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Pending candidate submissions
          </div>
        </div>

        {/* Certified / Approved by Reviewer */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 22px',
            border: activeTab === 'CERTIFIED' ? '2px solid #16a34a' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={() => setActiveTab('CERTIFIED')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Certified by Reviewer
            </span>
            <span
              style={{
                background: 'rgba(22, 163, 74, 0.1)',
                color: '#16a34a',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
            >
              Passed
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#16a34a', marginTop: '6px' }}>
            {stats?.total_certifications_approved ?? 0}
          </div>
          <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Forwarded to Training Admin
          </div>
        </div>

        {/* Violations / Disqualified */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 22px',
            border: activeTab === 'REJECTED' ? '2px solid #dc2626' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={() => setActiveTab('REJECTED')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Integrity Violations
            </span>
            <span
              style={{
                background: 'rgba(220, 38, 38, 0.1)',
                color: '#dc2626',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
            >
              Rejected
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>
            {stats?.total_violations_confirmed ?? 0}
          </div>
          <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Disqualified examination attempts
          </div>
        </div>

        {/* Total Lifetime Audits */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 22px',
            border: activeTab === 'ALL' ? '2px solid var(--text-primary)' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onClick={() => setActiveTab('ALL')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Audits Completed
            </span>
            <span
              style={{
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                fontWeight: 700,
              }}
            >
              Registry
            </span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px' }}>
            {stats?.total_reviews_completed ?? 0}
          </div>
          <div style={{ fontSize: '0.80rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Adjudicated candidate records
          </div>
        </div>
      </div>

      {/* ── 3. Queue Control, Stage Tabs & Search Filter Bar ─────────────── */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Navigation Stage Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          {[
            { key: 'PENDING', label: 'Awaiting Board Review', badge: stats?.pending_queue_count },
            { key: 'TRAINING', label: 'Under Training Review' },
            { key: 'CERTIFIED', label: 'Approved & Certified' },
            { key: 'REJECTED', label: 'Disqualified / Rejected' },
            { key: 'ALL', label: 'All Examinations' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? '1px solid var(--text-primary)' : '1px solid transparent',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    style={{
                      background: isActive ? '#0055A5' : 'var(--bg-surface-elevated)',
                      color: isActive ? '#ffffff' : 'var(--text-primary)',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Select Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search candidate name, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters: Track & Cohort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value as any)}
              style={{
                padding: '7px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
                outline: 'none',
              }}
            >
              <option value="ALL">All Tracks</option>
              <option value="B2C">B2C (Remote Personal)</option>
              <option value="B2B">B2B (Enterprise Lab)</option>
            </select>

            {cohortsList.length > 0 && (
              <select
                value={cohortFilter}
                onChange={(e) => setCohortFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.84rem',
                  outline: 'none',
                  maxWidth: '220px',
                }}
              >
                <option value="ALL">All Cohorts</option>
                {cohortsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{sessions.length}</strong> of <strong>{totalCount}</strong> exams
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Main Examination Sessions Table ───────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--bg-surface-elevated)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '14px 18px' }}>Candidate</th>
                <th style={{ padding: '14px 18px' }}>Cohort / Track</th>
                <th style={{ padding: '14px 18px' }}>Score & Result</th>
                <th style={{ padding: '14px 18px' }}>Proctoring Telemetry</th>
                <th style={{ padding: '14px 18px' }}>Governance Stage</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isSessionsLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                    <Spinner message="Loading examination registry..." />
                  </td>
                </tr>
              ) : sessions.length > 0 ? (
                sessions.map((s) => {
                  const isAwaitingBoard = s.status === 'BOARD_REVIEW' || s.status === 'SUBMITTED' || s.status === 'FLAGGED';
                  const pct = s.total_questions > 0 ? Math.round(((s.score ?? 0) / s.total_questions) * 100) : 0;
                  const isPass = s.passed ?? (s.score !== null && s.score !== undefined && s.score >= 12);

                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-elevated)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Candidate Column */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.80rem',
                              color: 'var(--text-primary)',
                              flexShrink: 0,
                            }}
                          >
                            {s.student_name ? s.student_name.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                              {s.student_name || 'Candidate'}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span>{s.student_phone}</span>
                              {s.student_code && s.student_code !== s.student_phone && (
                                <span
                                  style={{
                                    background: 'var(--bg-surface-elevated)',
                                    padding: '1px 6px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.72rem',
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {s.student_code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cohort & Track */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span
                            style={{
                              background: s.track === 'B2B' ? 'rgba(0, 85, 165, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                              color: s.track === 'B2B' ? '#0055A5' : 'var(--text-secondary)',
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                            }}
                          >
                            {s.track === 'B2B' ? 'B2B Lab' : 'B2C Remote'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {s.cohort_name || 'Individual Registration'}
                        </div>
                      </td>

                      {/* Score & Pass Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.98rem', color: isPass ? '#16a34a' : '#dc2626' }}>
                            {s.score ?? '—'} / {s.total_questions}
                          </span>
                          <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                            ({pct}%)
                          </span>
                          <span
                            style={{
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: isPass ? 'rgba(22, 163, 74, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                              color: isPass ? '#16a34a' : '#dc2626',
                            }}
                          >
                            {isPass ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                        {s.submitted_at && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            {new Date(s.submitted_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </td>

                      {/* Proctoring Telemetry */}
                      <td style={{ padding: '14px 18px' }}>
                        {s.violation_count === 0 ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'rgba(22, 163, 74, 0.06)',
                              color: '#16a34a',
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                            }}
                          >
                            <ShieldCheck size={13} />
                            <span>Clean (0 Flags)</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'rgba(220, 38, 38, 0.08)',
                              color: '#dc2626',
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            <AlertTriangle size={13} />
                            <span>{s.violation_count} Anomalies</span>
                          </span>
                        )}
                      </td>

                      {/* Governance Stage Badge */}
                      <td style={{ padding: '14px 18px' }}>
                        {isAwaitingBoard ? (
                          <span
                            style={{
                              background: 'rgba(217, 119, 6, 0.1)',
                              color: '#b45309',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Clock size={12} />
                            <span>Awaiting Board Review</span>
                          </span>
                        ) : s.status === 'TRAINING_REVIEW' ? (
                          <span
                            style={{
                              background: 'rgba(2, 132, 199, 0.1)',
                              color: '#0284c7',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            Under Training Audit
                          </span>
                        ) : s.status === 'SYSTEM_REVIEW' ? (
                          <span
                            style={{
                              background: 'rgba(124, 58, 237, 0.1)',
                              color: '#7c3aed',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            System Approval
                          </span>
                        ) : s.status === 'APPROVED' || s.status === 'PUBLISHED' ? (
                          <span
                            style={{
                              background: 'rgba(22, 163, 74, 0.1)',
                              color: '#16a34a',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle2 size={12} />
                            <span>{s.status === 'PUBLISHED' ? 'Published' : 'Certified'}</span>
                          </span>
                        ) : s.status === 'REJECTED' ? (
                          <span
                            style={{
                              background: 'rgba(220, 38, 38, 0.1)',
                              color: '#dc2626',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                            }}
                          >
                            Rejected
                          </span>
                        ) : (
                          <span
                            style={{
                              background: 'var(--bg-surface-elevated)',
                              color: 'var(--text-secondary)',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                            }}
                          >
                            {s.status}
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenInspect(s.id)}
                          className={`btn btn-sm ${isAwaitingBoard ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            fontSize: '0.82rem',
                            padding: isAwaitingBoard ? '6px 14px' : '5px 12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Eye size={13} />
                          <span>{isAwaitingBoard ? 'Review Exam' : 'Inspect Audit'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <ShieldCheck size={36} style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
                    <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      No examination records found
                    </div>
                    <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>
                      {activeTab === 'PENDING'
                        ? 'All candidate exam submissions have been evaluated. Audit queue is clear.'
                        : 'No sessions matched the selected filter criteria.'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Detailed Adjudication & Inspection Modal ─────────────────── */}
      {selectedSessionId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseInspect();
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                background: 'var(--bg-surface)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {inspectDetail?.student_name || 'Exam Session Inspection'}
                  </h2>
                  {inspectDetail && (
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        background:
                          inspectDetail.status === 'APPROVED' || inspectDetail.status === 'PUBLISHED'
                            ? 'rgba(22, 163, 74, 0.1)'
                            : inspectDetail.status === 'REJECTED'
                            ? 'rgba(220, 38, 38, 0.1)'
                            : 'rgba(217, 119, 6, 0.1)',
                        color:
                          inspectDetail.status === 'APPROVED' || inspectDetail.status === 'PUBLISHED'
                            ? '#16a34a'
                            : inspectDetail.status === 'REJECTED'
                            ? '#dc2626'
                            : '#b45309',
                      }}
                    >
                      {inspectDetail.status}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Phone: <strong>{inspectDetail?.student_phone}</strong> &bull; Track: <strong>{inspectDetail?.track}</strong> &bull; Cohort: <strong>{inspectDetail?.cohort_name || 'Individual'}</strong>
                </div>
              </div>

              <button
                onClick={handleCloseInspect}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {isInspectLoading || !inspectDetail ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <Spinner message="Retrieving full session responses and proctoring telemetry..." />
                </div>
              ) : (
                <>
                  {/* Feedback Banner */}
                  {actionFeedback && (
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: actionFeedback.type === 'success' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                        color: actionFeedback.type === 'success' ? '#16a34a' : '#dc2626',
                        border: `1px solid ${actionFeedback.type === 'success' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
                      }}
                    >
                      {actionFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span>{actionFeedback.message}</span>
                    </div>
                  )}

                  {/* 3-Stage Governance Pipeline Progress Bar */}
                  <div
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Sequential Certification Governance
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {/* Stage 1: Board Review */}
                      <div
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          border: inspectDetail.status === 'BOARD_REVIEW' || inspectDetail.status === 'SUBMITTED' ? '2px solid #0055A5' : '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>STAGE 1</span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color:
                                inspectDetail.board_decision === 'APPROVE'
                                  ? '#16a34a'
                                  : inspectDetail.board_decision === 'REJECT'
                                  ? '#dc2626'
                                  : '#d97706',
                            }}
                          >
                            {inspectDetail.board_decision === 'APPROVE'
                              ? 'Approved'
                              : inspectDetail.board_decision === 'REJECT'
                              ? 'Rejected'
                              : 'Active Review'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', marginTop: '4px', color: 'var(--text-primary)' }}>
                          Board Reviewer
                        </div>
                        {inspectDetail.board_notes && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                            "{inspectDetail.board_notes}"
                          </div>
                        )}
                      </div>

                      {/* Stage 2: Training Admin */}
                      <div
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          border: inspectDetail.status === 'TRAINING_REVIEW' ? '2px solid #0284c7' : '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>STAGE 2</span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: inspectDetail.training_decision === 'APPROVE' ? '#16a34a' : 'var(--text-muted)',
                            }}
                          >
                            {inspectDetail.training_decision === 'APPROVE' ? 'Approved' : inspectDetail.status === 'TRAINING_REVIEW' ? 'In Audit' : 'Pending'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', marginTop: '4px', color: 'var(--text-primary)' }}>
                          Training Admin
                        </div>
                        {inspectDetail.training_notes && (
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                            "{inspectDetail.training_notes}"
                          </div>
                        )}
                      </div>

                      {/* Stage 3: System Certification */}
                      <div
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          border: inspectDetail.status === 'SYSTEM_REVIEW' ? '2px solid #7c3aed' : '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>STAGE 3</span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: inspectDetail.certificate_number ? '#16a34a' : 'var(--text-muted)',
                            }}
                          >
                            {inspectDetail.certificate_number ? 'Certified' : 'Pending'}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', marginTop: '4px', color: 'var(--text-primary)' }}>
                          System Admin
                        </div>
                        {inspectDetail.certificate_number ? (
                          <div style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
                            Cert: {inspectDetail.certificate_number}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Awaiting issuance
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modal Navigation Tabs (Questions vs Proctoring) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => setModalTab('QUESTIONS')}
                      style={{
                        padding: '8px 16px',
                        background: 'none',
                        border: 'none',
                        borderBottom: modalTab === 'QUESTIONS' ? '2px solid #0055A5' : '2px solid transparent',
                        color: modalTab === 'QUESTIONS' ? '#0055A5' : 'var(--text-secondary)',
                        fontWeight: modalTab === 'QUESTIONS' ? 700 : 500,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                      }}
                    >
                      Question Breakdown ({questionsList.length})
                    </button>
                    <button
                      onClick={() => setModalTab('PROCTORING')}
                      style={{
                        padding: '8px 16px',
                        background: 'none',
                        border: 'none',
                        borderBottom: modalTab === 'PROCTORING' ? '2px solid #0055A5' : '2px solid transparent',
                        color: modalTab === 'PROCTORING' ? '#0055A5' : 'var(--text-secondary)',
                        fontWeight: modalTab === 'PROCTORING' ? 700 : 500,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Proctoring Telemetry</span>
                      {(inspectDetail.violation_count ?? 0) > 0 && (
                        <span
                          style={{
                            background: '#dc2626',
                            color: '#ffffff',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {inspectDetail.violation_count}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Tab 1: Question Breakdown Table */}
                  {modalTab === 'QUESTIONS' && (
                    <div
                      style={{
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        maxHeight: '340px',
                        overflowY: 'auto',
                      }}
                    >
                      {questionsList.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                          <thead>
                            <tr
                              style={{
                                background: 'var(--bg-surface-elevated)',
                                borderBottom: '1px solid var(--border-subtle)',
                                color: 'var(--text-secondary)',
                                textAlign: 'left',
                              }}
                            >
                              <th style={{ padding: '8px 12px', width: '36px' }}>#</th>
                              <th style={{ padding: '8px 12px' }}>Question</th>
                              <th style={{ padding: '8px 12px', width: '90px' }}>Selected</th>
                              <th style={{ padding: '8px 12px', width: '90px' }}>Correct Key</th>
                              <th style={{ padding: '8px 12px', textAlign: 'right', width: '100px' }}>Result</th>
                            </tr>
                          </thead>
                          <tbody>
                            {questionsList.map((q: any) => {
                              const isCorrect = q.is_correct ?? (q.selected_option && q.selected_option === q.correct_option);
                              return (
                                <tr key={q.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {q.sequence_number}
                                  </td>
                                  <td style={{ padding: '10px 12px' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                      {q.question_text}
                                    </div>
                                    {q.question_text_kinyarwanda && (
                                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        {q.question_text_kinyarwanda}
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: '10px 12px', fontWeight: 700, color: isCorrect ? '#16a34a' : '#dc2626' }}>
                                    Option {q.selected_option || '—'}
                                  </td>
                                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    Option {q.correct_option}
                                  </td>
                                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                    <span
                                      style={{
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        background: isCorrect ? 'rgba(22, 163, 74, 0.08)' : 'rgba(220, 38, 38, 0.08)',
                                        color: isCorrect ? '#16a34a' : '#dc2626',
                                      }}
                                    >
                                      {isCorrect ? 'Correct' : 'Incorrect'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No question responses recorded for this session.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Proctoring Telemetry */}
                  {modalTab === 'PROCTORING' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div
                        style={{
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-md)',
                          background: inspectDetail.violation_count === 0 ? 'rgba(22, 163, 74, 0.06)' : 'rgba(220, 38, 38, 0.06)',
                          border: `1px solid ${inspectDetail.violation_count === 0 ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        {inspectDetail.violation_count === 0 ? (
                          <ShieldCheck size={24} color="#16a34a" />
                        ) : (
                          <AlertTriangle size={24} color="#dc2626" />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: inspectDetail.violation_count === 0 ? '#16a34a' : '#dc2626' }}>
                            {inspectDetail.violation_count === 0
                              ? 'Clean Proctoring Session — 0 Violations Recorded'
                              : `${inspectDetail.violation_count} Proctoring Flags Triggered`}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {inspectDetail.violation_count === 0
                              ? 'Candidate completed exam within continuous fullscreen lock and valid single face detection.'
                              : 'Review flagged timestamps and snapshots before certifying.'}
                          </div>
                        </div>
                      </div>

                      {/* Proctoring Events Timeline */}
                      <div
                        style={{
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          maxHeight: '260px',
                          overflowY: 'auto',
                        }}
                      >
                        {proctoringEvents.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                                <th style={{ padding: '8px 12px' }}>Time</th>
                                <th style={{ padding: '8px 12px' }}>Event Type</th>
                                <th style={{ padding: '8px 12px' }}>Severity</th>
                                <th style={{ padding: '8px 12px' }}>Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {proctoringEvents.map((evt) => (
                                <tr key={evt.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                                    {evt.created_at ? new Date(evt.created_at).toLocaleTimeString() : '—'}
                                  </td>
                                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                                    {evt.event_type}
                                  </td>
                                  <td style={{ padding: '10px 12px' }}>
                                    <span
                                      style={{
                                        padding: '2px 7px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        background: evt.is_violation ? 'rgba(220, 38, 38, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                                        color: evt.is_violation ? '#dc2626' : '#d97706',
                                      }}
                                    >
                                      {evt.is_violation ? 'VIOLATION' : 'WARNING'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                                    {JSON.stringify(evt.metadata || {})}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No individual proctoring anomaly events logged in the audit stream.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── 6. Stage 1 Adjudication Action Panel ───────────────── */}
                  <div
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px 20px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {inspectDetail.status === 'BOARD_REVIEW' || inspectDetail.status === 'SUBMITTED' || inspectDetail.status === 'FLAGGED' ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <ShieldAlert size={18} color="#0055A5" />
                          <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            Stage 1: Board Review Adjudication
                          </span>
                        </div>
                        <p style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                          Provide your official evaluation findings. An audit comment is mandatory to certify and advance authority to Stage 2 Training Admin.
                        </p>

                        <textarea
                          rows={3}
                          placeholder="Enter mandatory reviewer evaluation notes, proctoring observations, or justification..."
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            fontSize: '0.86rem',
                            outline: 'none',
                            resize: 'vertical',
                            marginBottom: '12px',
                          }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          <button
                            type="button"
                            disabled={isSubmittingAction}
                            onClick={() => handleAdjudicate('REJECT')}
                            className="btn btn-secondary btn-md"
                            style={{
                              color: '#dc2626',
                              borderColor: '#dc2626',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.84rem',
                            }}
                          >
                            <XCircle size={16} />
                            <span>Reject / Disqualify</span>
                          </button>

                          <button
                            type="button"
                            disabled={isSubmittingAction || !actionNotes.trim()}
                            onClick={() => handleAdjudicate('APPROVE')}
                            className="btn btn-primary btn-md"
                            style={{
                              background: '#16a34a',
                              borderColor: '#16a34a',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.84rem',
                              opacity: !actionNotes.trim() ? 0.6 : 1,
                            }}
                          >
                            <CheckCircle2 size={16} />
                            <span>Approve & Advance to Training Admin</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={20} color="#16a34a" />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Stage 1 Evaluation Complete
                          </div>
                          <div style={{ fontSize: '0.80rem', color: 'var(--text-secondary)' }}>
                            This exam session has already completed Stage 1 Board Review (Current State: <strong>{inspectDetail.status}</strong>).
                            {inspectDetail.board_notes && ` Comments: "${inspectDetail.board_notes}"`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardReviewerDashboard;
