import React from 'react';
import {
  Video,
  ExternalLink,
  PlayCircle,
  Link2,
  Edit2,
  Trash2,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import type { LiveClass } from '../../../../../core/models/LiveClass';

interface LiveClassCardProps {
  liveClass: LiveClass;
  isTutor: boolean;
  isTrainingAdmin: boolean;
  isEditing: boolean;
  recordingUrl: string;
  setRecordingUrl: (val: string) => void;
  saving: boolean;
  onOpenRecordingEditor: (c: LiveClass) => void;
  onCancelRecordingEditor: () => void;
  onSaveRecording: (c: LiveClass) => void;
  onOpenScheduleEditor: (c: LiveClass) => void;
  onDeleteScheduleClass: (classId: string) => void;
}

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

const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const LiveClassCard: React.FC<LiveClassCardProps> = ({
  liveClass: c,
  isTutor,
  isTrainingAdmin,
  isEditing,
  recordingUrl,
  setRecordingUrl,
  saving,
  onOpenRecordingEditor,
  onCancelRecordingEditor,
  onSaveRecording,
  onOpenScheduleEditor,
  onDeleteScheduleClass,
}) => {
  const live = c.isLiveNow();
  const hasRecording = c.hasRecording();

  const meta = (
    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
      {formatDate(c.scheduledDate)} • {c.getFormattedTimeRange()}
      {c.cohortCode ? ` • ${c.cohortCode}` : ''} • Instructor: <strong>{c.tutorName}</strong>
    </div>
  );

  return (
    <div className="canvas-card" style={cardStyle}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={live ? badgeStyle('#FEE2E2', '#B91C1C') : badgeStyle('#EFF6FF', '#0055A5')}>
            {c.status === 'RESCHEDULED' ? 'RESCHEDULED' : c.getStatusBadge().label}
          </span>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>{c.title}</h4>
        </div>
        {c.topic && <div style={{ fontSize: '0.8rem', color: '#475569' }}>{c.topic}</div>}
        {meta}
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
          <input
            type="url"
            autoFocus
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
            placeholder="Paste recording link (Google Drive / YouTube unlisted)"
            aria-label="Recording link"
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '8px 10px',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              fontSize: '0.84rem',
            }}
          />
          <button
            className="canvas-btn canvas-btn-primary"
            disabled={saving}
            onClick={() => onSaveRecording(c)}
            style={{ ...linkBtnStyle, cursor: 'pointer' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>Publish</span>
          </button>
          <button
            className="canvas-btn"
            disabled={saving}
            onClick={onCancelRecordingEditor}
            style={{ ...linkBtnStyle, cursor: 'pointer' }}
          >
            <X size={14} />
            <span>Cancel</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Join Google Meet Link (if not recorded) */}
          {!hasRecording && (
            <>
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
            </>
          )}

          {/* Watch Recording Link */}
          {hasRecording && (
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
          )}

          {/* Add / Edit Recording button for tutor/admin */}
          {(isTutor || isTrainingAdmin) && (c.isPast || c.status === 'COMPLETED') && (
            <button
              className="canvas-btn"
              onClick={() => onOpenRecordingEditor(c)}
              style={{ ...linkBtnStyle, cursor: 'pointer' }}
            >
              <Link2 size={14} />
              <span>{hasRecording ? 'Edit Link' : 'Add Recording'}</span>
            </button>
          )}

          {/* Training Admin Controls */}
          {isTrainingAdmin && (
            <>
              <button
                className="canvas-btn"
                onClick={() => onOpenScheduleEditor(c)}
                style={{ ...linkBtnStyle, cursor: 'pointer' }}
                title="Edit Schedule"
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
              <button
                className="canvas-btn"
                onClick={() => onDeleteScheduleClass(c.id)}
                style={{ ...linkBtnStyle, cursor: 'pointer', color: '#DC2626' }}
                title="Delete Schedule"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveClassCard;
