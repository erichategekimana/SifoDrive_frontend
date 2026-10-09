import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Video, ExternalLink, PlayCircle, Loader2, CalendarX, Link2, Check, X, Edit2, Trash2 } from 'lucide-react';
import { LiveClassService } from '../../../../core/services/LiveClassService';
import type { LiveClass } from '../../../../core/models/LiveClass';
import { useToast } from '../../../../context/ToastContext';
import { useAuth } from '../../../../context/AuthContext';

interface CourseLiveClassesTabProps {
  isTutor: boolean;
  /** Tutor's currently selected cohort; students are scoped to their cohorts server-side. */
  cohortId?: string | null;
}

const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const cardStyle: React.CSSProperties = {
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '14px',
  backgroundColor: '#FFFFFF',
};

const badgeStyle = (bg: string, fg: string): React.CSSProperties => ({
  fontSize: '0.68rem',
  fontWeight: 700,
  backgroundColor: bg,
  color: fg,
  padding: '2px 8px',
  borderRadius: '2px',
});

const linkBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  fontSize: '0.82rem',
  textDecoration: 'none',
};

export const CourseLiveClassesTab: React.FC<CourseLiveClassesTabProps> = ({ isTutor, cohortId }) => {
  const { user } = useAuth();
  const isTrainingAdmin = Boolean(user?.isAnyAdmin());
  const { success: toastSuccess, error: toastError } = useToast();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Recording editor state (tutor)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState('');

  // Class schedule editor state (training admin)
  const [editingScheduleClass, setEditingScheduleClass] = useState<LiveClass | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editMeetUrl, setEditMeetUrl] = useState('');

  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await LiveClassService.getInstance().getClasses(
      isTutor && cohortId ? { cohort: cohortId } : undefined
    );
    setClasses(list);
    setLoading(false);
  }, [isTutor, cohortId]);

  useEffect(() => {
    void load();
  }, [load]);

  const { upcoming, awaitingRecording, recordings } = useMemo(() => {
    const active = classes.filter((c) => c.status !== 'CANCELLED');
    const sortAsc = (a: LiveClass, b: LiveClass) =>
      `${a.scheduledDate}${a.startTime}`.localeCompare(`${b.scheduledDate}${b.startTime}`);
    return {
      upcoming: active
        .filter((c) => c.status === 'IN_PROGRESS' || (c.status !== 'COMPLETED' && !c.isPast))
        .sort(sortAsc),
      awaitingRecording: active
        .filter((c) => c.status !== 'IN_PROGRESS' && (c.status === 'COMPLETED' || c.isPast) && !c.hasRecording())
        .sort((a, b) => sortAsc(b, a)),
      recordings: active.filter((c) => c.hasRecording()).sort((a, b) => sortAsc(b, a)),
    };
  }, [classes]);

  const openRecordingEditor = (c: LiveClass) => {
    setEditingId(c.id);
    setRecordingUrl(c.recordingUrl);
  };

  const saveRecording = async (c: LiveClass) => {
    const url = recordingUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      toastError('Enter a valid recording link starting with http:// or https://');
      return;
    }
    setSaving(true);
    try {
      await LiveClassService.getInstance().postRecording(c.id, url);
      toastSuccess('Recording published for students.');
      setEditingId(null);
      setRecordingUrl('');
      await load();
    } catch {
      toastError('Could not save the recording. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openScheduleEditor = (c: LiveClass) => {
    setEditingScheduleClass(c);
    setEditTitle(c.title);
    setEditDate(c.scheduledDate);
    setEditStartTime(c.startTime?.slice(0, 5) || '14:00');
    setEditEndTime(c.endTime?.slice(0, 5) || '15:30');
    setEditMeetUrl(c.googleMeetUrl || '');
  };

  const saveScheduleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheduleClass) return;
    if (!editTitle.trim()) {
      toastError('Title is required.');
      return;
    }
    if (!/^https?:\/\//i.test(editMeetUrl.trim())) {
      toastError('A valid Google Meet link is required.');
      return;
    }
    if (editStartTime >= editEndTime) {
      toastError('Start time must be before end time.');
      return;
    }
    setSaving(true);
    try {
      await LiveClassService.getInstance().updateClass(editingScheduleClass.id, {
        title: editTitle.trim(),
        scheduled_date: editDate,
        start_time: editStartTime,
        end_time: editEndTime,
        google_meet_url: editMeetUrl.trim(),
      });
      toastSuccess('Live class schedule updated.');
      setEditingScheduleClass(null);
      await load();
    } catch {
      toastError('Failed to update live class schedule.');
    } finally {
      setSaving(false);
    }
  };

  const deleteScheduleClass = async (classId: string) => {
    if (!window.confirm('Are you sure you want to delete this live class schedule?')) return;
    setSaving(true);
    try {
      await LiveClassService.getInstance().deleteClass(classId);
      toastSuccess('Live class schedule deleted.');
      if (editingScheduleClass?.id === classId) {
        setEditingScheduleClass(null);
      }
      await load();
    } catch {
      toastError('Failed to delete live class.');
    } finally {
      setSaving(false);
    }
  };

  const renderRecordingEditor = (c: LiveClass) => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
      <input
        type="url"
        autoFocus
        value={recordingUrl}
        onChange={(e) => setRecordingUrl(e.target.value)}
        placeholder="Paste recording link (Google Drive / YouTube unlisted)"
        aria-label="Recording link"
        style={{ flex: 1, minWidth: '220px', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.84rem' }}
      />
      <button
        className="canvas-btn canvas-btn-primary"
        disabled={saving}
        onClick={() => void saveRecording(c)}
        style={{ ...linkBtnStyle, cursor: 'pointer' }}
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        <span>Publish</span>
      </button>
      <button
        className="canvas-btn"
        disabled={saving}
        onClick={() => setEditingId(null)}
        style={{ ...linkBtnStyle, cursor: 'pointer' }}
      >
        <X size={14} />
        <span>Cancel</span>
      </button>
    </div>
  );

  const renderScheduleEditor = () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => !saving && setEditingScheduleClass(null)}
    >
      <div
        className="canvas-card"
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1E293B' }}>
            Edit Live Class Schedule
          </h3>
          <button
            onClick={() => setEditingScheduleClass(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={saveScheduleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Class Title *
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Scheduled Date *
            </label>
            <input
              type="date"
              required
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Start Time *
              </label>
              <input
                type="time"
                required
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                End Time *
              </label>
              <input
                type="time"
                required
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Google Meet URL *
            </label>
            <input
              type="url"
              required
              value={editMeetUrl}
              onChange={(e) => setEditMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/xxx-yyyy-zzz"
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.85rem' }}
            />
            <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginTop: '3px' }}>
              Training admin creates the Meet link and gives host rights to the tutor.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
            <button
              type="button"
              disabled={saving}
              onClick={() => editingScheduleClass && deleteScheduleClass(editingScheduleClass.id)}
              className="canvas-btn"
              style={{ color: '#DC2626', borderColor: 'rgba(220, 38, 38, 0.3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditingScheduleClass(null)}
                className="canvas-btn"
                style={{ cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="canvas-btn canvas-btn-primary"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  const meta = (c: LiveClass) => (
    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
      {formatDate(c.scheduledDate)} • {c.getFormattedTimeRange()}
      {c.cohortCode ? ` • ${c.cohortCode}` : ''} • Instructor: <strong>{c.tutorName}</strong>
    </div>
  );

  const sectionTitle = (title: string, subtitle: string) => (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0 0' }}>{subtitle}</p>
    </div>
  );

  const empty = (text: string) => (
    <div
      className="canvas-card"
      style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '0.86rem', backgroundColor: '#FFFFFF' }}
    >
      <CalendarX size={22} style={{ marginBottom: '6px', opacity: 0.6 }} />
      <div>{text}</div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', padding: '24px' }}>
        <Loader2 size={18} className="animate-spin" /> Loading live classes…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>Live Classes</h2>
        <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '3px 0 0 0' }}>
          {isTrainingAdmin
            ? 'Manage session timetables, Google Meet links, tutor assignments, and class recordings.'
            : isTutor
            ? 'Sessions scheduled by your Training Admin. You host each session on Google Meet and publish the recording afterwards.'
            : 'Join your cohort’s scheduled Google Meet sessions and rewatch recent recordings.'}
        </p>
      </div>

      {/* Upcoming */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sectionTitle('Upcoming Classes', 'Google Meet links for your scheduled sessions.')}
        {upcoming.length === 0
          ? empty('No upcoming live classes have been scheduled yet.')
          : upcoming.map((c) => {
              const live = c.isLiveNow();
              return (
                <div key={c.id} className="canvas-card" style={cardStyle}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={live ? badgeStyle('#FEE2E2', '#B91C1C') : badgeStyle('#EFF6FF', '#0055A5')}>
                        {c.status === 'RESCHEDULED' ? 'RESCHEDULED' : c.getStatusBadge().label}
                      </span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>{c.title}</h4>
                    </div>
                    {c.topic && <div style={{ fontSize: '0.8rem', color: '#475569' }}>{c.topic}</div>}
                    {meta(c)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {c.googleMeetUrl ? (
                      <a
                        href={c.googleMeetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="canvas-btn canvas-btn-primary"
                        style={linkBtnStyle}
                      >
                        <Video size={15} />
                        <span>{isTutor || isTrainingAdmin ? 'Host / Join Meet' : 'Join Google Meet'}</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Meet link not provided yet</span>
                    )}

                    {isTrainingAdmin && (
                      <>
                        <button
                          className="canvas-btn"
                          onClick={() => openScheduleEditor(c)}
                          style={{ ...linkBtnStyle, cursor: 'pointer' }}
                          title="Edit Schedule"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="canvas-btn"
                          onClick={() => deleteScheduleClass(c.id)}
                          style={{ ...linkBtnStyle, cursor: 'pointer', color: '#DC2626' }}
                          title="Delete Schedule"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
      </section>

      {/* Tutor: past sessions still missing a recording */}
      {(isTutor || isTrainingAdmin) && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sectionTitle('Awaiting Recording', 'Finished sessions without a recording. Add the link so students can watch.')}
          {awaitingRecording.length === 0
            ? empty('All finished sessions have recordings.')
            : awaitingRecording.map((c) => (
                <div key={c.id} className="canvas-card" style={cardStyle}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 4px 0' }}>{c.title}</h4>
                    {meta(c)}
                  </div>
                  {editingId === c.id ? (
                    renderRecordingEditor(c)
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="canvas-btn canvas-btn-primary"
                        onClick={() => openRecordingEditor(c)}
                        style={{ ...linkBtnStyle, cursor: 'pointer' }}
                      >
                        <Link2 size={14} />
                        <span>Add Recording</span>
                      </button>
                      {isTrainingAdmin && (
                        <button
                          className="canvas-btn"
                          onClick={() => deleteScheduleClass(c.id)}
                          style={{ ...linkBtnStyle, cursor: 'pointer', color: '#DC2626' }}
                          title="Delete Schedule"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
        </section>
      )}

      {/* Recent recordings */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sectionTitle('Recent Recordings', 'Previous sessions posted by the tutor.')}
        {recordings.length === 0
          ? empty('No recordings have been posted yet.')
          : recordings.map((c) => (
              <div key={c.id} className="canvas-card" style={cardStyle}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 4px 0' }}>{c.title}</h4>
                  {meta(c)}
                </div>
                {(isTutor || isTrainingAdmin) && editingId === c.id ? (
                  renderRecordingEditor(c)
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <a
                      href={c.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="canvas-btn canvas-btn-primary"
                      style={linkBtnStyle}
                    >
                      <PlayCircle size={15} />
                      <span>Watch Recording</span>
                      <ExternalLink size={12} />
                    </a>
                    {(isTutor || isTrainingAdmin) && (
                      <button className="canvas-btn" onClick={() => openRecordingEditor(c)} style={{ ...linkBtnStyle, cursor: 'pointer' }}>
                        <Link2 size={14} />
                        <span>Edit Link</span>
                      </button>
                    )}
                    {isTrainingAdmin && (
                      <button
                        className="canvas-btn"
                        onClick={() => deleteScheduleClass(c.id)}
                        style={{ ...linkBtnStyle, cursor: 'pointer', color: '#DC2626' }}
                        title="Delete Schedule"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
      </section>

      {/* Schedule Edit Modal for Training Admin */}
      {editingScheduleClass && renderScheduleEditor()}
    </div>
  );
};
