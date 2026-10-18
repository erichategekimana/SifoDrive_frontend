import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CalendarX, Plus, Video } from 'lucide-react';
import { LiveClassService } from '../../../../../core/services/LiveClassService';
import { AdminService, type LiveClassScheduleItem } from '../../../../../core/services/AdminService';
import type { LiveClass } from '../../../../../core/models/LiveClass';
import { useToast } from '../../../../../context/ToastContext';
import { useAuth } from '../../../../../context/AuthContext';
import { LiveClassCard } from './LiveClassCard';
import { ScheduleCard } from './ScheduleCard';
import { EditClassScheduleModal } from './EditClassScheduleModal';
import { AddRecordingModal } from './AddRecordingModal';

export interface CourseLiveClassesTabProps {
  isTutor: boolean;
  cohortId?: string | null;
}

export const CourseLiveClassesTab: React.FC<CourseLiveClassesTabProps> = ({ isTutor, cohortId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTrainingAdmin = Boolean(user?.isAnyAdmin());
  const { success: toastSuccess, error: toastError } = useToast();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [schedules, setSchedules] = useState<LiveClassScheduleItem[]>([]);
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

  // Add Recording Modal state (tutor / admin)
  const [showAddRecordingModal, setShowAddRecordingModal] = useState(false);

  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, scheduleList] = await Promise.all([
        LiveClassService.getInstance().getClasses(
          isTutor && cohortId ? { cohort: cohortId } : undefined
        ),
        LiveClassService.getInstance().getSchedules(
          isTutor && cohortId ? { cohort: cohortId } : undefined
        ),
      ]);
      setClasses(list);
      setSchedules(scheduleList);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [isTutor, cohortId]);

  useEffect(() => {
    void load();
  }, [load]);

  const deleteScheduleOffering = async (scheduleId: string) => {
    if (!window.confirm('Delete this class schedule and all its sessions?')) return;
    try {
      await AdminService.getInstance().deleteLiveClassSchedule(scheduleId);
      toastSuccess('Schedule and all associated sessions deleted.');
      await load();
    } catch {
      toastError('Could not delete schedule.');
    }
  };

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

  const handleSaveAddRecording = async (payload: {
    date: string;
    googleLink: string;
  }) => {
    setSaving(true);
    try {
      // Find if an awaiting session on that date exists
      const matchedSession = awaitingRecording.find(
        (s) => s.scheduledDate === payload.date
      );

      if (matchedSession) {
        await LiveClassService.getInstance().postRecording(
          matchedSession.id,
          payload.googleLink
        );
      } else {
        await LiveClassService.getInstance().addRecording({
          date: payload.date,
          googleLink: payload.googleLink,
          cohortId: cohortId || undefined,
        });
      }
      toastSuccess('Class recording published successfully.');
      setShowAddRecordingModal(false);
      await load();
    } catch (err: any) {
      console.error('Failed to publish recording:', err);
      toastError(err?.message || 'Could not save the recording. Please try again.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
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

        {(isTutor || isTrainingAdmin) && (
          <button
            onClick={() => setShowAddRecordingModal(true)}
            className="canvas-btn canvas-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              backgroundColor: '#0055A5',
              color: '#FFFFFF',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Video size={15} />
            <span>Add Recording</span>
          </button>
        )}
      </div>

      {/* Upcoming Schedules */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sectionTitle('Scheduled Classes & Series', 'Google Meet links and timetable.')}
        {schedules.length === 0 ? (
          upcoming.length === 0 ? (
            empty('No upcoming live classes have been scheduled yet.')
          ) : (
            upcoming.map((c) => (
              <LiveClassCard
                key={c.id}
                liveClass={c}
                isTutor={isTutor}
                isTrainingAdmin={isTrainingAdmin}
                isEditing={editingId === c.id}
                recordingUrl={recordingUrl}
                setRecordingUrl={setRecordingUrl}
                saving={saving}
                onOpenRecordingEditor={openRecordingEditor}
                onCancelRecordingEditor={() => setEditingId(null)}
                onSaveRecording={saveRecording}
                onOpenScheduleEditor={openScheduleEditor}
                onDeleteScheduleClass={deleteScheduleClass}
              />
            ))
          )
        ) : (
          schedules.map((sch) => (
            <ScheduleCard
              key={sch.id}
              schedule={sch}
              classes={classes}
              isTutor={isTutor}
              isTrainingAdmin={isTrainingAdmin}
              onNavigateCalendar={() => navigate('/calendar')}
              onDeleteSchedule={deleteScheduleOffering}
            />
          ))
        )}
      </section>

      {/* Recent recordings */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          {sectionTitle('Recent Recordings', 'Previous sessions posted by the tutor.')}
          {(isTutor || isTrainingAdmin) && (
            <button
              onClick={() => setShowAddRecordingModal(true)}
              className="canvas-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: '#F0FDF4',
                color: '#166534',
                border: '1px solid #BBF7D0',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>Add Recording</span>
            </button>
          )}
        </div>
        {recordings.length === 0
          ? empty('No recordings have been posted yet.')
          : recordings.map((c) => (
              <LiveClassCard
                key={c.id}
                liveClass={c}
                isTutor={isTutor}
                isTrainingAdmin={isTrainingAdmin}
                isEditing={editingId === c.id}
                recordingUrl={recordingUrl}
                setRecordingUrl={setRecordingUrl}
                saving={saving}
                onOpenRecordingEditor={openRecordingEditor}
                onCancelRecordingEditor={() => setEditingId(null)}
                onSaveRecording={saveRecording}
                onOpenScheduleEditor={openScheduleEditor}
                onDeleteScheduleClass={deleteScheduleClass}
              />
            ))}
      </section>

      {/* Schedule Edit Modal for Training Admin */}
      <EditClassScheduleModal
        editingScheduleClass={editingScheduleClass}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDate={editDate}
        setEditDate={setEditDate}
        editStartTime={editStartTime}
        setEditStartTime={setEditStartTime}
        editEndTime={editEndTime}
        setEditEndTime={setEditEndTime}
        editMeetUrl={editMeetUrl}
        setEditMeetUrl={setEditMeetUrl}
        saving={saving}
        onClose={() => setEditingScheduleClass(null)}
        onSave={saveScheduleEdit}
        onDelete={deleteScheduleClass}
      />

      {/* Add Recording Modal for Tutor / Training Admin */}
      <AddRecordingModal
        isOpen={showAddRecordingModal}
        onClose={() => setShowAddRecordingModal(false)}
        onSave={handleSaveAddRecording}
        saving={saving}
      />
    </div>
  );
};

export default CourseLiveClassesTab;
