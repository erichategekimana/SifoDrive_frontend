import React, { useState, useEffect } from 'react';
import {
  Plus,
  Play,
  Square,
  Ban,
  RefreshCw,
  X,
  Users,
  ExternalLink,
} from 'lucide-react';
import {
  AdminService,
  type CohortItem,
  type LiveClassAdminItem,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

export const AdminLiveClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<LiveClassAdminItem[]>([]);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isCohortModalOpen, setIsCohortModalOpen] = useState<boolean>(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);

  // Cohort Form State
  const [cohortName, setCohortName] = useState<string>('');
  const [cohortStartDate, setCohortStartDate] = useState<string>('');

  // Class Form State
  const [classTitle, setClassTitle] = useState<string>('');
  const [classCohortId, setClassCohortId] = useState<string>('');
  const [classScheduledAt, setClassScheduledAt] = useState<string>('');
  const [classDuration, setClassDuration] = useState<number>(60);
  const [classMeetLink, setClassMeetLink] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [classesRes, cohortsRes] = await Promise.allSettled([
        adminService.getLiveClasses(),
        adminService.getCohorts(),
      ]);

      if (classesRes.status === 'fulfilled') setClasses(classesRes.value);
      if (cohortsRes.status === 'fulfilled') setCohorts(cohortsRes.value);
    } catch (err) {
      console.error('Failed loading live classes and cohorts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortName.trim() || !cohortStartDate) {
      warning('Name and Start Date are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createCohort({
        name: cohortName.trim(),
        start_date: cohortStartDate,
      });
      success(`Created cohort ${cohortName}.`);
      setIsCohortModalOpen(false);
      setCohortName('');
      setCohortStartDate('');
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Could not create cohort.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTitle.trim() || !classScheduledAt) {
      warning('Title and Schedule Time are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createLiveClass({
        title: classTitle.trim(),
        cohort_id: classCohortId || undefined,
        scheduled_at: classScheduledAt,
        duration_minutes: Number(classDuration) || 60,
        meeting_link: classMeetLink.trim() || undefined,
      });

      success(`Scheduled live class ${classTitle}.`);
      setIsClassModalOpen(false);
      setClassTitle('');
      setClassScheduledAt('');
      setClassMeetLink('');
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Could not schedule class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClassAction = async (classId: string, action: 'START' | 'END' | 'CANCEL') => {
    try {
      if (action === 'START') await adminService.startLiveClass(classId);
      if (action === 'END') await adminService.endLiveClass(classId);
      if (action === 'CANCEL') await adminService.cancelLiveClass(classId, 'Cancelled by administrator');

      success(`Class successfully ${action.toLowerCase()}ed.`);
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Operation failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Live Classes & Cohort Dispatch
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Schedule Google Meet theory instruction sessions, assign student cohorts, and manage class status.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCohortModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={15} />
            <span>New Cohort</span>
          </button>
          <button
            onClick={() => setIsClassModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            <span>Schedule Class</span>
          </button>
        </div>
      </div>

      {/* Cohorts Overview Strip */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Active Student Cohorts ({cohorts.length})
          </h3>
        </div>

        {cohorts.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No cohorts registered yet. Create a cohort to group students for structured theory instruction.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
            {cohorts.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                  {c.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '6px' }}>
                  <Users size={12} />
                  <span>{c.student_count ?? 0} Enrolled Learners</span>
                </div>
                {c.start_date && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '4px' }}>
                    Starts: {new Date(c.start_date).toLocaleDateString('en-RW')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Classes Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Scheduled Sessions
          </h3>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Spinner message="Loading live classes from backend..." />
          </div>
        ) : classes.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No live classes scheduled. Click "Schedule Class" to create a session.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Session Title</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Scheduled Date & Time</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Duration</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Google Meet Link</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cls.title}
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {cls.cohort_name || 'Open Batch'}
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)' }}>
                      {new Date(cls.scheduled_at).toLocaleString('en-RW', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {cls.duration_minutes} mins
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <Badge
                        variant={
                          cls.status === 'IN_PROGRESS'
                            ? 'warning'
                            : cls.status === 'COMPLETED'
                            ? 'success'
                            : cls.status === 'CANCELLED'
                            ? 'danger'
                            : 'neutral'
                        }
                      >
                        {cls.status}
                      </Badge>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {cls.meeting_link ? (
                        <a
                          href={cls.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--primary-light)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                          }}
                        >
                          <span>Join Meet</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {cls.status === 'SCHEDULED' && (
                          <button
                            onClick={() => handleClassAction(cls.id, 'START')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '3px 8px', color: 'var(--success)' }}
                            title="Start session"
                          >
                            <Play size={12} />
                          </button>
                        )}
                        {cls.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleClassAction(cls.id, 'END')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '3px 8px', color: 'var(--accent-500)' }}
                            title="End session"
                          >
                            <Square size={12} />
                          </button>
                        )}
                        {cls.status !== 'CANCELLED' && cls.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleClassAction(cls.id, 'CANCEL')}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '3px 8px', color: 'var(--danger)' }}
                            title="Cancel session"
                          >
                            <Ban size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Cohort Modal */}
      {isCohortModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>New Student Cohort</h3>
              <button onClick={() => setIsCohortModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCohort} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Cohort Name (e.g. Cohort September 2026 A) *
                </label>
                <input
                  type="text"
                  required
                  value={cohortName}
                  onChange={(e) => setCohortName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={cohortStartDate}
                  onChange={(e) => setCohortStartDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsCohortModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
                  {isSubmitting ? 'Creating...' : 'Create Cohort'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Live Class Modal */}
      {isClassModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Schedule Live Theory Session</h3>
              <button onClick={() => setIsClassModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Class Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priority Rules & Roundabouts Mastery"
                  value={classTitle}
                  onChange={(e) => setClassTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Target Cohort (Optional)
                </label>
                <select
                  value={classCohortId}
                  onChange={(e) => setClassCohortId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                >
                  <option value="">-- All Students Batch --</option>
                  {cohorts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={classScheduledAt}
                    onChange={(e) => setClassScheduledAt(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={classDuration}
                    onChange={(e) => setClassDuration(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Google Meet Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abc-123"
                  value={classMeetLink}
                  onChange={(e) => setClassMeetLink(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
                  {isSubmitting ? 'Scheduling...' : 'Schedule Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
