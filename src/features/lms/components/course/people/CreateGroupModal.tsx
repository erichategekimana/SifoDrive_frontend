import React from 'react';
import { Info, Loader2 } from 'lucide-react';

interface CreateGroupModalProps {
  isOpen: boolean;
  isCurrentUserTutor: boolean;
  courseTitle: string;
  newGroupName: string;
  setNewGroupName: (val: string) => void;
  newGroupDesc: string;
  setNewGroupDesc: (val: string) => void;
  newGroupCategory: string;
  setNewGroupCategory: (val: string) => void;
  isCreatingGroup: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  isCurrentUserTutor,
  courseTitle,
  newGroupName,
  setNewGroupName,
  newGroupDesc,
  setNewGroupDesc,
  newGroupCategory,
  setNewGroupCategory,
  isCreatingGroup,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="canvas-card"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '28px',
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              {isCurrentUserTutor ? 'Create Official Course Group' : 'Create Student Study Group'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Course: {courseTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Group Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Roundabout & Overtaking Practice Group"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              disabled={isCreatingGroup}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #CBD5E1',
                borderRadius: '2px',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Study Focus & Description
            </label>
            <textarea
              rows={3}
              placeholder="What topics or quiz questions will members focus on?"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              disabled={isCreatingGroup}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #CBD5E1',
                borderRadius: '2px',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Study Focus Area
            </label>
            <select
              value={newGroupCategory}
              onChange={(e) => setNewGroupCategory(e.target.value)}
              disabled={isCreatingGroup}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #CBD5E1',
                borderRadius: '2px',
                fontSize: '0.85rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="General Road Rules & Highway Code">General Road Rules & Highway Code</option>
              <option value="Road Signs & Markings">Road Signs & Ground Markings</option>
              <option value="Intersections & Priorities">Intersections & Priorities (Article 34)</option>
              <option value="National Mock Exam Prep">National Mock Exam Preparation</option>
            </select>
          </div>

          <div
            style={{
              backgroundColor: '#F8FAFC',
              padding: '10px 12px',
              borderRadius: '2px',
              fontSize: '0.76rem',
              color: '#475569',
              border: '1px solid #E2E8F0',
            }}
          >
            <Info size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
            All enrolled students in this course will be able to view and join this group to study and chat together.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isCreatingGroup}
              className="canvas-btn"
              style={{ fontSize: '0.82rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingGroup || !newGroupName.trim()}
              className="canvas-btn canvas-btn-primary"
              style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isCreatingGroup && <Loader2 size={13} className="animate-spin" />}
              <span>{isCreatingGroup ? 'Creating...' : 'Create Group'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
