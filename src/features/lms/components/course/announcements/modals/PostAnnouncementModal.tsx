import React from 'react';
import { Loader2 } from 'lucide-react';
import type { CohortSelectorItem } from '../../../../../../core/services/TutorLmsService';

interface PostAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  announcementTitle: string;
  setAnnouncementTitle: (val: string) => void;
  announcementContent: string;
  setAnnouncementContent: (val: string) => void;
  announcementTargetType: 'SINGLE_COHORT' | 'ALL_ASSIGNED_COHORTS';
  setAnnouncementTargetType: (val: 'SINGLE_COHORT' | 'ALL_ASSIGNED_COHORTS') => void;
  announcementCohortId: string;
  setAnnouncementCohortId: (val: string) => void;
  activeCohortId: string | null;
  tutorCohorts: CohortSelectorItem[];
}

export const PostAnnouncementModal: React.FC<PostAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  announcementTitle,
  setAnnouncementTitle,
  announcementContent,
  setAnnouncementContent,
  announcementTargetType,
  setAnnouncementTargetType,
  announcementCohortId,
  setAnnouncementCohortId,
  activeCohortId,
  tutorCohorts,
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
      onClick={() => !submitting && onClose()}
    >
      <div
        className="canvas-card"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '28px',
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              Post Course Announcement
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
              Send timely notices and briefings directly to your students' course feeds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Announcement Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule Change: Friday Q&A Review Session"
              value={announcementTitle}
              onChange={(e) => setAnnouncementTitle(e.target.value)}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                fontSize: '0.86rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              Audience & Visibility *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: announcementTargetType === 'ALL_ASSIGNED_COHORTS' ? '1.5px solid #0055A5' : '1px solid #E2E8F0',
                  backgroundColor: announcementTargetType === 'ALL_ASSIGNED_COHORTS' ? '#F0F7FF' : '#FAFAFA',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="announcementTarget"
                  checked={announcementTargetType === 'ALL_ASSIGNED_COHORTS'}
                  onChange={() => setAnnouncementTargetType('ALL_ASSIGNED_COHORTS')}
                  disabled={submitting}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                    All Cohorts Assigned to Me
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Broadcast to learners across all {tutorCohorts.length > 0 ? `${tutorCohorts.length} cohorts` : 'cohorts'} assigned to you for this course.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: announcementTargetType === 'SINGLE_COHORT' ? '1.5px solid #0055A5' : '1px solid #E2E8F0',
                  backgroundColor: announcementTargetType === 'SINGLE_COHORT' ? '#F0F7FF' : '#FAFAFA',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="announcementTarget"
                  checked={announcementTargetType === 'SINGLE_COHORT'}
                  onChange={() => setAnnouncementTargetType('SINGLE_COHORT')}
                  disabled={submitting}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                    One Specific Cohort
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Visible exclusively to students in the selected learning group.
                  </div>
                </div>
              </label>
            </div>

            {announcementTargetType === 'SINGLE_COHORT' && (
              <div style={{ marginTop: '10px', paddingLeft: '4px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Select Target Cohort *
                </label>
                <select
                  value={announcementCohortId || activeCohortId || (tutorCohorts[0]?.id ?? '')}
                  onChange={(e) => setAnnouncementCohortId(e.target.value)}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {tutorCohorts.map((cohort) => (
                    <option key={cohort.id} value={cohort.id}>
                      {cohort.name} ({cohort.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
              Content *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide instructions, timetable adjustments, or exam preparation guidance..."
              value={announcementContent}
              onChange={(e) => setAnnouncementContent(e.target.value)}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                fontSize: '0.86rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="canvas-btn"
              style={{ fontSize: '0.84rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="canvas-btn canvas-btn-primary"
              style={{ fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Announcement</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostAnnouncementModal;
