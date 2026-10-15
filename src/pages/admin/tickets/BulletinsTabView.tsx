import React from 'react';
import { Megaphone, Radio, Trash2 } from 'lucide-react';
import type { SupportAnnouncementDTO } from '../../../core/services/SupportTicketService';
import { getAnnouncementCategoryBadge } from './TicketBadges';

interface BulletinsTabViewProps {
  announcements: SupportAnnouncementDTO[];
  onOpenBroadcastStudio: () => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const BulletinsTabView: React.FC<BulletinsTabViewProps> = ({
  announcements,
  onOpenBroadcastStudio,
  onDeleteAnnouncement,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(124, 58, 237, 0.05)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={20} color="#7C3AED" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Active Support Bulletins & Platform Updates
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            These bulletins are broadcasted directly to the <strong>'Support'</strong> tab for all students, tutors, training admins, agents, and reviewers across the platform.
          </p>
        </div>

        <button
          onClick={onOpenBroadcastStudio}
          className="btn btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#7C3AED',
            color: '#FFFFFF',
          }}
        >
          <Radio size={15} />
          <span>Open Broadcast Studio</span>
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No platform bulletins currently published. Click "Open Broadcast Studio" to broadcast to all users.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="glass-panel"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: ann.is_pinned ? '4px solid #7C3AED' : '4px solid #0284c7',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {getAnnouncementCategoryBadge(ann.category)}
                    {ann.is_pinned && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#FEF3C7', color: '#B45309', padding: '1px 6px', borderRadius: '3px' }}>
                        PINNED
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteAnnouncement(ann.id)}
                    className="btn btn-sm"
                    style={{ padding: '4px 8px', color: '#EF4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                    title="Remove bulletin from Support tab"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                  {ann.title}
                </h4>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                  {ann.content}
                </p>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>Author: {ann.author_name || 'System Admin'}</span>
                <span>{ann.date || (ann.created_at ? new Date(ann.created_at).toLocaleDateString() : '')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
