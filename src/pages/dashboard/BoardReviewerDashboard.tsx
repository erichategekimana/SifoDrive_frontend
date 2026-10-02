import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import {
  ReviewerService,
  type ReviewerStatsDTO,
  type ReviewerQueueItemDTO,
} from '../../core/services/ReviewerService';
import { Spinner } from '../../components/common/Spinner';

export const BoardReviewerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [stats, setStats] = useState<ReviewerStatsDTO | null>(null);
  const [queue, setQueue] = useState<ReviewerQueueItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ReviewerQueueItemDTO | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isAdjudicating, setIsAdjudicating] = useState(false);

  useEffect(() => {
    const loadReviewerData = async () => {
      try {
        const [statsData, queueData] = await Promise.all([
          ReviewerService.getInstance().getStats(),
          ReviewerService.getInstance().getQueue(),
        ]);
        setStats(statsData);
        setQueue(queueData);
      } catch (err) {
        console.error('Failed to load reviewer console:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadReviewerData();
  }, []);

  const handleDecision = async (action: 'APPROVE' | 'DISQUALIFY') => {
    if (!selectedSession) return;
    setIsAdjudicating(true);
    try {
      await ReviewerService.getInstance().certifySession(selectedSession.session_id, action, remarks);
      alert(
        action === 'APPROVE'
          ? t('dashboard.reviewer.approvedSuccess')
          : t('dashboard.reviewer.disqualifiedSuccess')
      );
      // Remove from active queue
      setQueue((prev) => prev.filter((item) => item.session_id !== selectedSession.session_id));
      setSelectedSession(null);
      setRemarks('');
      // Refresh stats
      const updatedStats = await ReviewerService.getInstance().getStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(err.message || 'Adjudication failed');
    } finally {
      setIsAdjudicating(false);
    }
  };

  if (isLoading) {
    return <Spinner message={t('dashboard.reviewer.loadingConsole')} />;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(209, 56, 56, 0.08) 0%, rgba(0, 51, 102, 0.1) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: '#d13838',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {stats?.reviewer_code || 'SIFO-REV-001'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {stats?.accreditation_authority || t('dashboard.reviewer.defaultAuthority')}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0' }}>
            {user?.fullName} — {t('dashboard.reviewer.examinerTitle')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {t('dashboard.reviewer.queueSubtitle', {
              count: queue.length,
              total: stats?.total_certifications_approved || 0,
            })}
          </p>
        </div>
      </div>

      {/* 4 Stat Overview Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.reviewer.flaggedQueueTitle')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d13838', marginTop: '4px' }}>
            {queue.length}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.reviewer.certifiedScoresTitle')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#058728', marginTop: '4px' }}>
            {stats?.total_certifications_approved || 0}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.reviewer.violationsConfirmedTitle')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d13838', marginTop: '4px' }}>
            {stats?.total_violations_confirmed || 0}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.reviewer.totalAuditsTitle')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {stats?.total_reviews_completed || 0}
          </div>
        </div>
      </div>

      {/* Flagged Exam Sessions Queue Table */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <ShieldAlert size={20} color="#d13838" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            {t('dashboard.reviewer.adjudicationQueueTitle')}
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.reviewer.candidate')}</th>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.reviewer.examTitle')}</th>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.reviewer.score')}</th>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.reviewer.violationReason')}</th>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.reviewer.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {queue.length > 0 ? (
                queue.map((item) => (
                  <tr key={item.session_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700 }}>{item.candidate_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {item.candidate_phone} • {item.student_id || t('dashboard.reviewer.b2cCandidate')}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{item.exam_title}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: item.score_percentage >= 80 ? '#058728' : '#d13838' }}>
                      {item.score_percentage}%
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          background: 'rgba(209, 56, 56, 0.1)',
                          color: '#d13838',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        ⚠️ {item.flagged_reason}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button
                        onClick={() => setSelectedSession(item)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0055A5', borderColor: '#0055A5' }}
                      >
                        <Eye size={14} />
                        <span>{t('dashboard.reviewer.inspect')}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('dashboard.reviewer.noPendingExams')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proctoring Inspection Modal */}
      {selectedSession && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '680px',
              width: '100%',
              padding: '28px',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                {t('dashboard.reviewer.modalTitle')}
              </h3>
              <button
                onClick={() => setSelectedSession(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--bg-surface-elevated)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedSession.candidate_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {selectedSession.exam_title} • {t('dashboard.reviewer.scoreLabel', { score: selectedSession.score_percentage })}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#d13838', fontWeight: 700, marginTop: '8px' }}>
                🚨 {selectedSession.flagged_reason}
              </div>
            </div>

            {/* Webcam Snapshots Mock Gallery */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                <Camera size={14} style={{ display: 'inline', marginRight: '6px' }} />
                {t('dashboard.reviewer.webcamSnapshotsLabel')}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ height: '100px', background: '#202124', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa0a6', fontSize: '0.75rem' }}>
                  {t('dashboard.reviewer.snapshotNormal', { time: '00:04:12' })}
                </div>
                <div style={{ height: '100px', background: '#3c1010', border: '1px solid #d13838', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', fontSize: '0.75rem', textAlign: 'center', padding: '4px' }}>
                  {t('dashboard.reviewer.snapshotFaceMissing', { time: '00:12:45' })}
                </div>
                <div style={{ height: '100px', background: '#202124', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa0a6', fontSize: '0.75rem' }}>
                  {t('dashboard.reviewer.snapshotNormal', { time: '00:18:30' })}
                </div>
              </div>
            </div>

            {/* Examiner Remarks */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                {t('dashboard.reviewer.remarksLabel')}
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={t('dashboard.reviewer.remarksPlaceholder')}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Decision Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                disabled={isAdjudicating}
                onClick={() => handleDecision('DISQUALIFY')}
                className="btn btn-secondary btn-md"
                style={{ color: '#d13838', borderColor: '#d13838' }}
              >
                <XCircle size={16} />
                <span>{t('dashboard.reviewer.disqualifyBtn')}</span>
              </button>

              <button
                type="button"
                disabled={isAdjudicating}
                onClick={() => handleDecision('APPROVE')}
                className="btn btn-primary btn-md"
                style={{ background: '#058728', borderColor: '#058728' }}
              >
                <CheckCircle2 size={16} />
                <span>{t('dashboard.reviewer.certifyBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
