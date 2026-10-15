import React from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
import type { LiveClass } from '../../../../../core/models/LiveClass';

interface EditClassScheduleModalProps {
  editingScheduleClass: LiveClass | null;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDate: string;
  setEditDate: (val: string) => void;
  editStartTime: string;
  setEditStartTime: (val: string) => void;
  editEndTime: string;
  setEditEndTime: (val: string) => void;
  editMeetUrl: string;
  setEditMeetUrl: (val: string) => void;
  saving: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onDelete: (classId: string) => void;
}

export const EditClassScheduleModal: React.FC<EditClassScheduleModalProps> = ({
  editingScheduleClass,
  editTitle,
  setEditTitle,
  editDate,
  setEditDate,
  editStartTime,
  setEditStartTime,
  editEndTime,
  setEditEndTime,
  editMeetUrl,
  setEditMeetUrl,
  saving,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!editingScheduleClass) return null;

  return (
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
      onClick={() => !saving && onClose()}
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
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              onClick={() => onDelete(editingScheduleClass.id)}
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
                onClick={onClose}
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
};

export default EditClassScheduleModal;
