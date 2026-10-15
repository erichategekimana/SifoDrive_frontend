import React from 'react';
import { Search, Radio, Pin, FileText, Trash2 } from 'lucide-react';
import type { SupportAnnouncementDTO } from '../../../core/services/SupportTicketService';
import { getCategoryMeta } from './BroadcastCategoryMeta';

interface BroadcastManageListProps {
  announcements: SupportAnnouncementDTO[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  updatesCount: number;
  supportCount: number;
  maintenanceCount: number;
  onComposeNew: () => void;
  onCloneToComposer: (ann: SupportAnnouncementDTO) => void;
  onDeleteBroadcast: (id: string) => void;
}

export const BroadcastManageList: React.FC<BroadcastManageListProps> = ({
  announcements,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  updatesCount,
  supportCount,
  maintenanceCount,
  onComposeNew,
  onCloneToComposer,
  onDeleteBroadcast,
}) => {
  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || ann.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Search & Channel Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search broadcasts by title or content..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: '0.82rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-base)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Categories ({announcements.length})</option>
            <option value="PLATFORM_UPDATE">Platform Updates ({updatesCount})</option>
            <option value="HELP_SUPPORT">Help & Support ({supportCount})</option>
            <option value="SYSTEM_ANNOUNCEMENT">Announcements</option>
            <option value="MAINTENANCE">Maintenance ({maintenanceCount})</option>
          </select>
        </div>

        <button
          onClick={onComposeNew}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#7C3AED', borderColor: '#6D28D9' }}
        >
          <Radio size={14} />
          <span>Compose New Broadcast</span>
        </button>
      </div>

      {/* Bulletins List */}
      {filteredAnnouncements.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          <Radio size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px auto', display: 'block', opacity: 0.5 }} />
          <div>No broadcasts match the current filters.</div>
          <button
            onClick={onComposeNew}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '12px' }}
          >
            Create your first broadcast
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredAnnouncements.map((ann) => {
            const meta = getCategoryMeta(ann.category);
            return (
              <div
                key={ann.id}
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  borderLeft: ann.is_pinned ? '4px solid #F59E0B' : '4px solid #7C3AED',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: meta.badgeBg,
                        color: meta.badgeColor,
                        border: `1px solid ${meta.border}`,
                        textTransform: 'uppercase',
                      }}
                    >
                      {meta.label}
                    </span>

                    {ann.is_pinned && (
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Pin size={11} />
                        <span>Pinned to Top</span>
                      </span>
                    )}

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Target: <strong style={{ color: '#059669' }}>PLATFORM WIDE</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => onCloneToComposer(ann)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Load into composer to create update"
                    >
                      <FileText size={12} />
                      <span>Clone to Composer</span>
                    </button>

                    <button
                      onClick={() => onDeleteBroadcast(ann.id)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        color: '#DC2626',
                        borderColor: '#FECACA',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Unpublish from Support tab immediately"
                    >
                      <Trash2 size={12} />
                      <span>Unpublish</span>
                    </button>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {ann.title}
                </h4>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Published by {ann.author_name || ann.author} • {ann.date}
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                  {ann.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
