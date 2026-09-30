import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckSquare,
  Square,
  Layers,
  ClipboardCheck,
  ShieldCheck,
  Award,
  CheckCircle2,
} from 'lucide-react';
import {
  AdminService,
  type ExamSessionItem,
  type PaginatedResult,
} from '../../../../core/services/AdminService';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';
import { getExamStatusBadge } from '../../utils/examBadges';
import { InspectSessionModal } from './InspectSessionModal';

interface ExamPipelineSectionProps {
  isSystemAdmin: boolean;
  isTrainingAdmin: boolean;
  isBoardReviewer: boolean;
}

export const ExamPipelineSection: React.FC<ExamPipelineSectionProps> = ({
  isSystemAdmin,
  isTrainingAdmin,
  isBoardReviewer,
}) => {
  const { showToast } = useToast();
  const adminService = AdminService.getInstance();

  const [sessionsData, setSessionsData] = useState<PaginatedResult<ExamSessionItem>>({ count: 0, results: [] });
  const [isSessionsLoading, setIsSessionsLoading] = useState<boolean>(true);
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [cohortFilter, setCohortFilter] = useState<string>('ALL');
  const [trackFilter, setTrackFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cohortsList, setCohortsList] = useState<{ id: string; name: string }[]>([]);

  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [isPublishingBatch, setIsPublishingBatch] = useState<boolean>(false);

  const [inspectModalOpen, setInspectModalOpen] = useState<boolean>(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setIsSessionsLoading(true);
      const params: Record<string, any> = {};
      if (stageFilter !== 'ALL') params.stage = stageFilter;
      if (cohortFilter !== 'ALL') params.cohort = cohortFilter;
      if (trackFilter !== 'ALL') params.track = trackFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await adminService.getExamSessions(params);
      setSessionsData(data);
    } catch (err: any) {
      showToast(err?.message || 'Failed to load exam sessions', 'error');
    } finally {
      setIsSessionsLoading(false);
    }
  }, [stageFilter, cohortFilter, trackFilter, searchQuery]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    adminService
      .getCohorts()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res.results || [];
        setCohortsList(list.map((c: any) => ({ id: c.id, name: c.name })));
      })
      .catch(() => {});
  }, []);

  const toggleSelectSession = (id: string) => {
    setSelectedSessionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const publishableIds = sessionsData.results
      .filter((s) => s.can_publish && !s.is_published)
      .map((s) => s.id);

    if (selectedSessionIds.length === publishableIds.length) {
      setSelectedSessionIds([]);
    } else {
      setSelectedSessionIds(publishableIds);
    }
  };

  const handleSinglePublish = async (sessionId: string) => {
    try {
      await adminService.publishExams({ publish_type: 'SINGLE', session_id: sessionId });
      showToast('Exam published to candidate portal.', 'success');
      fetchSessions();
    } catch (err: any) {
      showToast('Publish failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleBatchPublish = async () => {
    if (selectedSessionIds.length === 0) return;
    try {
      setIsPublishingBatch(true);
      const res = await adminService.publishExams({
        publish_type: 'BATCH',
        session_ids: selectedSessionIds,
      });
      showToast(res.message || `Published ${res.published_count} exams.`, 'success');
      setSelectedSessionIds([]);
      fetchSessions();
    } catch (err: any) {
      showToast('Batch publish failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setIsPublishingBatch(false);
    }
  };

  const handleCohortPublish = async () => {
    if (cohortFilter === 'ALL') {
      showToast('Select a cohort first.', 'error');
      return;
    }
    const cohortObj = cohortsList.find((c) => c.id === cohortFilter);
    const confirmed = window.confirm(
      `Publish all approved exams for "${cohortObj?.name || 'cohort'}"?`
    );
    if (!confirmed) return;

    try {
      setIsPublishingBatch(true);
      const res = await adminService.publishExams({
        publish_type: 'COHORT',
        cohort_id: cohortFilter,
      });
      showToast(res.message || 'Cohort published.', 'success');
      fetchSessions();
    } catch (err: any) {
      showToast('Cohort publish failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setIsPublishingBatch(false);
    }
  };

  const handleInspect = (session: ExamSessionItem) => {
    setSelectedSessionId(session.id);
    setInspectModalOpen(true);
  };

  const getStageRoleContext = (status: string) => {
    if (status === 'SUBMITTED' || status === 'BOARD_REVIEW') {
      if (isBoardReviewer) {
        return { note: 'Board Review (Active)', canAct: true, actionLabel: 'Review' };
      }
      return { note: 'Read-only (Board Review)', canAct: false, actionLabel: 'Inspect' };
    }

    if (status === 'TRAINING_REVIEW') {
      if (isBoardReviewer) {
        return { note: 'Locked (Stage 1 Done)', canAct: false, actionLabel: 'Inspect' };
      }
      if (isTrainingAdmin) {
        return { note: 'Training Audit (Active)', canAct: true, actionLabel: 'Audit' };
      }
      return { note: 'Read-only (Training Audit)', canAct: false, actionLabel: 'Inspect' };
    }

    if (status === 'SYSTEM_REVIEW') {
      if (isSystemAdmin) {
        return { note: 'System Approval (Active)', canAct: true, actionLabel: 'Approve' };
      }
      return { note: 'Locked (Stage 2 Done)', canAct: false, actionLabel: 'Inspect' };
    }

    if (status === 'APPROVED') {
      if (isSystemAdmin) {
        return { note: 'Ready to publish', canAct: true, actionLabel: 'Inspect' };
      }
      return { note: 'Awaiting publication', canAct: false, actionLabel: 'Inspect' };
    }

    if (status === 'PUBLISHED') {
      return { note: 'Published', canAct: false, actionLabel: 'Inspect' };
    }

    if (status === 'REJECTED') {
      return { note: 'Rejected', canAct: false, actionLabel: 'Inspect' };
    }

    return { note: status, canAct: false, actionLabel: 'Inspect' };
  };

  return (
    <>
      {/* 5 Core KPI Cards - Styled identically to Command Center (SystemAdminView) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        {[
          {
            key: 'ALL',
            label: 'Total Sessions',
            sub: 'All submitted exams',
            icon: <Layers size={16} style={{ color: 'var(--text-muted)' }} />,
          },
          {
            key: 'BOARD_REVIEW',
            label: 'Stage 1: Board',
            sub: 'Board reviewer queue',
            icon: <ClipboardCheck size={16} style={{ color: 'var(--text-muted)' }} />,
          },
          {
            key: 'TRAINING_REVIEW',
            label: 'Stage 2: Training',
            sub: 'Training admin audit',
            icon: <ShieldCheck size={16} style={{ color: 'var(--text-muted)' }} />,
          },
          {
            key: 'SYSTEM_REVIEW',
            label: 'Stage 3: System',
            sub: 'System admin approval',
            icon: <Award size={16} style={{ color: 'var(--text-muted)' }} />,
          },
          {
            key: 'PUBLISHED',
            label: 'Published',
            sub: 'Completed & certified',
            icon: <CheckCircle2 size={16} style={{ color: 'var(--text-muted)' }} />,
            filterFn: (s: any) => s.is_published || s.status === 'APPROVED',
          },
        ].map((stage) => {
          const isActive = stageFilter === stage.key;
          const count =
            stage.key === 'ALL'
              ? sessionsData.count || sessionsData.results.length
              : stage.filterFn
              ? sessionsData.results.filter(stage.filterFn).length
              : sessionsData.results.filter((s) => s.status === stage.key).length;

          return (
            <div
              key={stage.key}
              onClick={() => setStageFilter(isActive && stage.key !== 'ALL' ? 'ALL' : stage.key)}
              style={{
                background: 'var(--bg-surface)',
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                border: isActive ? '1px solid var(--text-muted)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stage.label}
                </span>
                {stage.icon}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {count}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {stage.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Examination Queue Card - Styled identically to Command Center table sections */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '22px 24px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Examination Queue
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
              Submitted candidate exams and stage governance.
            </p>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '5px 10px',
                minWidth: '200px',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-muted)', marginRight: '6px' }} />
              <input
                type="text"
                placeholder="Search candidate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '5px 10px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="ALL">All Stages</option>
              <option value="BOARD_REVIEW">Stage 1: Board Review</option>
              <option value="TRAINING_REVIEW">Stage 2: Training Audit</option>
              <option value="SYSTEM_REVIEW">Stage 3: System Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '5px 10px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="ALL">All Cohorts</option>
              {cohortsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '5px 10px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="ALL">All Tracks</option>
              <option value="B2C">Student</option>
              <option value="B2B">Enterprise</option>
            </select>

            {isSystemAdmin && selectedSessionIds.length > 0 && (
              <button
                onClick={handleBatchPublish}
                disabled={isPublishingBatch}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '5px 10px' }}
              >
                Publish Selected ({selectedSessionIds.length})
              </button>
            )}

            {isSystemAdmin && cohortFilter !== 'ALL' && (
              <button
                onClick={handleCohortPublish}
                disabled={isPublishingBatch}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', padding: '5px 10px' }}
              >
                Publish Cohort
              </button>
            )}
          </div>
        </div>

        {isSessionsLoading ? (
          <div style={{ padding: '48px 16px', textAlign: 'center' }}>
            <Spinner size={28} />
          </div>
        ) : sessionsData.results.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No examination sessions in queue.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  {isSystemAdmin && (
                    <th style={{ padding: '10px 12px', width: '32px' }}>
                      <button
                        onClick={toggleSelectAll}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0,
                        }}
                      >
                        {selectedSessionIds.length > 0 ? <CheckSquare size={15} /> : <Square size={15} />}
                      </button>
                    </th>
                  )}
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Candidate</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Track</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Score</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Stage</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Access</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Certificate</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessionsData.results.map((session) => {
                  const isSelected = selectedSessionIds.includes(session.id);
                  const roleContext = getStageRoleContext(session.status);

                  return (
                    <tr key={session.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {isSystemAdmin && (
                        <td style={{ padding: '10px 12px' }}>
                          <button
                            onClick={() => toggleSelectSession(session.id)}
                            disabled={!session.can_publish || session.is_published}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: session.can_publish && !session.is_published ? 'var(--text-muted)' : 'var(--border-subtle)',
                              cursor: session.can_publish && !session.is_published ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0,
                            }}
                          >
                            {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                          </button>
                        </td>
                      )}

                      {/* Candidate */}
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div>{session.student_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          {session.student_phone} &bull; {session.cohort_name || 'Individual'}
                        </div>
                      </td>

                      {/* Track */}
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                        {session.track_type === 'GUEST'
                          ? 'Guest'
                          : session.track_type === 'ENTERPRISE'
                          ? 'Enterprise'
                          : 'Student'}
                      </td>

                      {/* Score */}
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {session.score ?? '—'}/{session.total_questions}
                        {session.passed !== null && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>
                            ({session.passed ? 'Pass' : 'Fail'})
                          </span>
                        )}
                      </td>

                      {/* Stage Badge (the single status badge per row, matching Command Center) */}
                      <td style={{ padding: '10px 12px' }}>
                        {getExamStatusBadge(session.status)}
                      </td>

                      {/* Role Access */}
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {roleContext.note}
                      </td>

                      {/* Certificate */}
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                        {session.certificate_number || (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {session.status === 'APPROVED' && isSystemAdmin && !session.is_published && (
                            <button
                              onClick={() => handleSinglePublish(session.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                            >
                              Publish
                            </button>
                          )}

                          <button
                            onClick={() => handleInspect(session)}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 10px',
                              fontWeight: roleContext.canAct ? 600 : 500,
                              color: roleContext.canAct ? 'var(--text-primary)' : 'var(--text-secondary)',
                              borderColor: roleContext.canAct ? 'var(--text-muted)' : 'var(--border-subtle)',
                            }}
                          >
                            {roleContext.actionLabel}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InspectSessionModal
        isOpen={inspectModalOpen}
        sessionId={selectedSessionId}
        onClose={() => {
          setInspectModalOpen(false);
          setSelectedSessionId(null);
        }}
        onActionCompleted={fetchSessions}
        isBoardReviewer={isBoardReviewer}
        isTrainingAdmin={isTrainingAdmin}
        isSystemAdmin={isSystemAdmin}
      />
    </>
  );
};

