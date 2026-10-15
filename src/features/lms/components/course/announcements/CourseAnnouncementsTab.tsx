import React from 'react';
import { Plus, Bell, Loader2, Trash2 } from 'lucide-react';
import type { SupportAnnouncementDTO } from '../../../../../core/services/SupportTicketService';

interface CourseAnnouncementsTabProps {
  isTutor: boolean;
  loadingAnnouncements: boolean;
  announcements: SupportAnnouncementDTO[];
  onOpenPostModal: () => void;
  onDeleteAnnouncement: (annId: string) => void;
}

export const CourseAnnouncementsTab: React.FC<CourseAnnouncementsTabProps> = ({
  isTutor,
  loadingAnnouncements,
  announcements,
  onOpenPostModal,
  onDeleteAnnouncement,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2D3B45', margin: 0 }}>
            Course Announcements
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#6B7280', margin: '3px 0 0 0' }}>
            Official notices, schedule updates, and exam briefings from your instructors.
          </p>
        </div>

        {isTutor && (
          <button
            onClick={onOpenPostModal}
            className="canvas-btn canvas-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <Plus size={15} />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {loadingAnnouncements ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: '#64748B', gap: '8px', alignItems: 'center' }}>
          <Loader2 size={20} className="animate-spin" />
          <span style={{ fontSize: '0.86rem' }}>Loading course announcements...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div
          className="canvas-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px dashed #CBD5E1',
            borderRadius: '6px',
          }}
        >
          <Bell size={40} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: 0 }}>
            No Announcements Yet
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748B', maxWidth: '420px', margin: '6px auto 0 auto', lineHeight: 1.5 }}>
            Official notices, schedule changes, and cohort exam briefings will appear here when posted by instructors.
          </p>
          {isTutor && (
            <button
              onClick={onOpenPostModal}
              className="canvas-btn canvas-btn-primary"
              style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
            >
              <Plus size={14} />
              <span>Post the First Announcement</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="canvas-card"
              style={{
                padding: '20px 24px',
                backgroundColor: '#FFFFFF',
                borderLeft: '4px solid #0055A5',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                    {ann.title}
                  </h4>
                  {ann.target_type === 'SINGLE_COHORT' ? (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#0055A5',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {ann.cohort_name || 'Cohort'}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#15803D',
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      all
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                  {ann.date || (ann.created_at ? new Date(ann.created_at).toLocaleDateString() : '')}
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.6, margin: '0 0 14px 0', whiteSpace: 'pre-wrap' }}>
                {ann.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Posted by: <strong style={{ color: '#1E293B' }}>{ann.author_name || ann.author}</strong>
                  {ann.author_role ? ` • ${ann.author_role}` : ''}
                </div>

                {isTutor && (
                  <button
                    type="button"
                    onClick={() => onDeleteAnnouncement(ann.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                    title="Delete announcement"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseAnnouncementsTab;
