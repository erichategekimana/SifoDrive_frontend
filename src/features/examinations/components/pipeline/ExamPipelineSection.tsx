import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  AdminService,
  type ExamSessionItem,
  type PaginatedResult,
} from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';
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

  // Multi-select state for batch publishing
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [isPublishingBatch, setIsPublishingBatch] = useState<boolean>(false);

  // Inspection modal state
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
      showToast('Exam published successfully to candidate portal.', 'success');
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
      showToast('Select a specific cohort first.', 'error');
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
      showToast(res.message || 'Cohort published successfully.', 'success');
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

  // Helper to determine role-specific stage context
  const getStageRoleContext = (status: string) => {
    if (status === 'SUBMITTED' || status === 'BOARD_REVIEW') {
      if (isBoardReviewer) {
        return { note: 'Action required', canAct: true, actionLabel: 'Review' };
      }
      if (isTrainingAdmin) {
        return { note: 'Read-only (Stage 1)', canAct: false, actionLabel: 'Inspect' };
      }
      return { note: 'Stage 1 in progress', canAct: false, actionLabel: 'Inspect' };
    }

    if (status === 'TRAINING_REVIEW') {
      if (isBoardReviewer) {
        return { note: 'Stage 1 finalized (Locked)', canAct: false, actionLabel: 'Inspect' };
      }
      if (isTrainingAdmin) {
        return { note: 'Action required', canAct: true, actionLabel: 'Audit' };
      }
      return { note: 'Stage 2 in progress', canAct: false, actionLabel: 'Inspect' };
    }

    if (status === 'SYSTEM_REVIEW') {
      if (isBoardReviewer) {
        return { note: 'Locked', canAct: false, actionLabel: 'Inspect' };
      }
      if (isTrainingAdmin) {
        return { note: 'Stage 2 finalized (Locked)', canAct: false, actionLabel: 'Inspect' };
      }
      return { note: 'Action required', canAct: true, actionLabel: 'Approve' };
    }

    if (status === 'APPROVED') {
      if (isSystemAdmin) {
        return { note: 'Ready to publish', canAct: true, actionLabel: 'Publish' };
      }
      return { note: 'Awaiting publication', canAct: false, actionLabel: 'Inspect' };
    }

    if (status === 'PUBLISHED') {
      return { note: 'Released', canAct: false, actionLabel: 'Inspect' };
    }

    if (status === 'REJECTED') {
      return { note: 'Rejected', canAct: false, actionLabel: 'Inspect' };
    }

    return { note: status, canAct: false, actionLabel: 'Inspect' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Metric Cards - Strict Monochrome */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '10px',
        }}
      >
        {[
          { key: 'ALL', label: 'All Sessions', sub: 'Total submitted' },
          { key: 'BOARD_REVIEW', label: 'Stage 1: Board Review', sub: 'Pending review' },
          { key: 'TRAINING_REVIEW', label: 'Stage 2: Training Audit', sub: 'Pending audit' },
          { key: 'SYSTEM_REVIEW', label: 'Stage 3: System Approval', sub: 'Pending approval' },
          {
            key: 'APPROVED',
            label: 'Approved',
            sub: 'Certified',
            filterFn: (s: any) => s.status === 'APPROVED' && !s.is_published,
          },
          {
            key: 'PUBLISHED',
            label: 'Published',
            sub: 'Candidate portal',
            filterFn: (s: any) => s.is_published,
          },
        ].map((stage) => {
          const isActive = stageFilter === stage.key;
          const count = stage.key === 'ALL'
            ? sessionsData.count || sessionsData.results.length
            : stage.filterFn
            ? sessionsData.results.filter(stage.filterFn).length
            : sessionsData.results.filter((s) => s.status === stage.key).length;

          return (
            <div
              key={stage.key}
              onClick={() => setStageFilter(isActive && stage.key !== 'ALL' ? 'ALL' : stage.key)}
              style={{
                padding: '12px 14px',
                borderRadius: '6px',
                border: isActive ? '1px solid #ffffff' : '1px solid #27272a',
                background: isActive ? '#27272a' : '#121212',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: isActive ? '#ffffff' : '#a1a1aa',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {stage.label}
              </div>
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginTop: '4px',
                }}
              >
                {count}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '2px' }}>
                {stage.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar & Controls */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#121212',
          border: '1px solid #27272a',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 10px',
              minWidth: '220px',
            }}
          >
            <Search size={14} color="var(--text-muted)" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search candidate or phone..."
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

          {/* Cohort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort:</span>
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '0.78rem',
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
          </div>

          {/* Stage Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '0.78rem',
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
          </div>

          {/* Track Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Track:</span>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                outline: 'none',
              }}
            >
              <option value="ALL">All Tracks</option>
              <option value="B2C">Student</option>
              <option value="B2B">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Role Pill & Batch Publish */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            Role:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {isBoardReviewer
                ? 'Board Reviewer'
                : isTrainingAdmin
                ? 'Training Admin'
                : 'System Admin'}
            </strong>
          </div>

          {isSystemAdmin && selectedSessionIds.length > 0 && (
            <button
              onClick={handleBatchPublish}
              disabled={isPublishingBatch}
              className="btn btn-primary btn-sm"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
            >
              Publish Selected ({selectedSessionIds.length})
            </button>
          )}

          {isSystemAdmin && (
            <button
              onClick={handleCohortPublish}
              disabled={cohortFilter === 'ALL' || isPublishingBatch}
              className="btn btn-secondary btn-sm"
              style={{ padding: '5px 12px', fontSize: '0.78rem' }}
              title={
                cohortFilter === 'ALL'
                  ? 'Select a cohort first'
                  : 'Publish all approved exams in this cohort'
              }
            >
              Publish Cohort
            </button>
          )}
        </div>
      </div>

      {/* Sessions Table */}
      <div
        style={{
          overflow: 'hidden',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        {isSessionsLoading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Spinner size={32} />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Loading examination sessions...
            </p>
          </div>
        ) : sessionsData.results.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>No examination sessions found</p>
            <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Adjust search query or stage filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-subtle)' }}>
                  {isSystemAdmin && (
                    <th style={{ padding: '10px 14px', width: '36px' }}>
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
                        {selectedSessionIds.length > 0 ? (
                          <CheckSquare size={16} color="var(--primary)" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                  )}
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Candidate
                  </th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Track
                  </th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Score
                  </th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Pipeline Stage
                  </th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Certificate
                  </th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessionsData.results.map((session) => {
                  const isSelected = selectedSessionIds.includes(session.id);
                  const roleContext = getStageRoleContext(session.status);

                  return (
                    <tr
                      key={session.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                      }}
                    >
                      {/* Checkbox - System Admin only */}
                      {isSystemAdmin && (
                        <td style={{ padding: '10px 14px' }}>
                          <button
                            onClick={() => toggleSelectSession(session.id)}
                            disabled={!session.can_publish || session.is_published}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: session.can_publish && !session.is_published ? 'var(--text-muted)' : 'rgba(255,255,255,0.1)',
                              cursor: session.can_publish && !session.is_published ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0,
                            }}
                          >
                            {isSelected ? (
                              <CheckSquare size={16} color="var(--primary)" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Candidate */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {session.student_name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {session.student_phone} &bull; {session.cohort_name || 'Individual'}
                        </div>
                      </td>

                      {/* Track */}
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {session.track_type === 'GUEST' ? 'Guest' : session.track_type === 'ENTERPRISE' ? 'Enterprise' : 'Student'}
                        </span>
                      </td>

                      {/* Score */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {session.score ?? '—'}/{session.total_questions}
                          </span>
                          {session.passed !== null && (
                            <Badge variant={session.passed ? 'success' : 'danger'}>
                              {session.passed ? 'Pass' : 'Fail'}
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Review Stage */}
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div>{getExamStatusBadge(session.status)}</div>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: roleContext.canAct ? 'var(--primary-light, #38bdf8)' : 'var(--text-muted)',
                              fontWeight: roleContext.canAct ? 600 : 400,
                            }}
                          >
                            {roleContext.note}
                          </div>
                        </div>
                      </td>

                      {/* Certificate */}
                      <td style={{ padding: '10px 14px' }}>
                        {session.certificate_number ? (
                          <span
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              fontFamily: 'monospace',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {session.certificate_number}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {session.status === 'APPROVED' && isSystemAdmin && !session.is_published && (
                            <button
                              onClick={() => handleSinglePublish(session.id)}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                            >
                              Publish
                            </button>
                          )}

                          <button
                            onClick={() => handleInspect(session)}
                            className={roleContext.canAct ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                            style={{ padding: '4px 10px', fontSize: '0.74rem' }}
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
    </div>
  );
};
