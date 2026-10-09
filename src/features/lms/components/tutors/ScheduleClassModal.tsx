import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Video, X } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import type { CohortItem, AdminUserItem } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';

interface ScheduleClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohorts: CohortItem[];
  tutors: AdminUserItem[];
  onSuccess: () => void;
}

export const ScheduleClassModal: React.FC<ScheduleClassModalProps> = ({
  isOpen,
  onClose,
  cohorts,
  tutors,
  onSuccess,
}) => {
  const [classTitle, setClassTitle] = useState<string>('');
  const [classCohortId, setClassCohortId] = useState<string>('');
  const [classTutorId, setClassTutorId] = useState<string>('');
  const [classScheduledAt, setClassScheduledAt] = useState<string>('');
  const [classDuration, setClassDuration] = useState<number>(60);
  const [classMeetingLink, setClassMeetingLink] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classTitle.trim() || !classScheduledAt) {
      warning('Title and scheduled time are required.');
      return;
    }
    const meetLink = classMeetingLink.trim();
    if (!/^https?:\/\//i.test(meetLink)) {
      warning('A Google Meet link is required.');
      return;
    }
    const [datePart, timePart = '00:00'] = classScheduledAt.split('T');
    const [sh, sm] = timePart.split(':').map(Number);
    const endTotal = sh * 60 + sm + (Number(classDuration) || 60);
    if (endTotal >= 24 * 60) {
      warning('A class cannot run past midnight. Shorten the duration or start earlier.');
      return;
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    setIsSubmitting(true);
    try {
      await adminService.createLiveClass({
        title: classTitle.trim(),
        cohort: classCohortId || undefined,
        tutor: classTutorId || undefined,
        scheduled_date: datePart,
        start_time: `${pad(sh)}:${pad(sm)}`,
        end_time: `${pad(Math.floor(endTotal / 60))}:${pad(endTotal % 60)}`,
        google_meet_url: meetLink,
        is_published: true,
      });
      success(`Scheduled live class "${classTitle}".`);
      setClassTitle('');
      setClassCohortId('');
      setClassTutorId('');
      setClassScheduledAt('');
      setClassMeetingLink('');
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to schedule class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Video size={22} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              Schedule Live Class
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Class Title *
            </label>
            <input
              type="text"
              required
              placeholder="Priority Rules & Defensive Driving Q&A"
              value={classTitle}
              onChange={(e) => setClassTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Target Cohort
              </label>
              <select
                value={classCohortId}
                onChange={(e) => setClassCohortId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              >
                <option value="">Open Platform (All Cohorts)</option>
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Assigned Tutor
              </label>
              <select
                value={classTutorId}
                onChange={(e) => setClassTutorId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              >
                <option value="">-- Choose Tutor --</option>
                {tutors.map((tut) => (
                  <option key={tut.id} value={tut.id}>
                    {tut.full_name || tut.phone_number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Scheduled Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={classScheduledAt}
                onChange={(e) => setClassScheduledAt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Duration (min)
              </label>
              <input
                type="number"
                min={15}
                max={240}
                value={classDuration}
                onChange={(e) => setClassDuration(parseInt(e.target.value) || 60)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Google Meet / Meeting Link
            </label>
            <input
              type="url"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={classMeetingLink}
              onChange={(e) => setClassMeetingLink(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Scheduling...' : 'Schedule Class'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
