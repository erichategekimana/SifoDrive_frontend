import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bell,
  Search,
  ArrowLeft,
  Pin,
  Calendar,
  Users,
  BookOpen,
  Filter,
} from 'lucide-react';
import { SupportTicketService, type SupportAnnouncementDTO } from '../../core/services/SupportTicketService';
import { Spinner } from '../../components/common/Spinner';

export const AnnouncementsView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const highlightedId = searchParams.get('id');

  const [announcements, setAnnouncements] = useState<SupportAnnouncementDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(highlightedId);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const data = await SupportTicketService.getInstance().getAnnouncements();
        setAnnouncements(data || []);
      } catch (err) {
        console.error('Failed to load announcements from database:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (highlightedId) {
      setExpandedId(highlightedId);
      const element = document.getElementById(`announcement-${highlightedId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedId, announcements]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    announcements.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements];

    if (selectedCategory !== 'ALL') {
      result = result.filter((a) => a.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.content?.toLowerCase().includes(q) ||
          a.author?.toLowerCase().includes(q) ||
          a.author_name?.toLowerCase().includes(q) ||
          a.cohort_name?.toLowerCase().includes(q) ||
          a.course_title?.toLowerCase().includes(q)
      );
    }

    // Sort pinned items first, then by date/created_at descending
    result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  }, [announcements, selectedCategory, searchTerm]);

  const formatDate = (dateStr?: string, createdStr?: string) => {
    if (dateStr) return dateStr;
    if (createdStr) {
      try {
        return new Date(createdStr).toLocaleDateString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return createdStr;
      }
    }
    return '';
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '40px auto', display: 'flex', justifyContent: 'center' }}>
        <Spinner message="Loading school and cohort announcements..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#0055A5',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '8px 0 4px 0', color: 'var(--text-primary)' }}>
            Announcements & Bulletins
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Official notices, cohort updates, and theory exam briefings from your facilitators and school administration.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 85, 165, 0.1)',
              color: '#0055A5',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Bell size={15} />
            <span>{announcements.length} Total Notices</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by title, instructor, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
            }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.86rem',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAnnouncements.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border-subtle)',
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <Bell size={36} style={{ margin: '0 auto 12px auto', color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
              No Announcements Found
            </h3>
            <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-muted)' }}>
              {searchTerm || selectedCategory !== 'ALL'
                ? 'Try adjusting your search criteria or filter to see more bulletins.'
                : 'There are no announcements posted in the database at this time.'}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isExpanded = expandedId === ann.id;
            const authorDisplay = ann.author_name || ann.author || 'School Administration';

            return (
              <div
                id={`announcement-${ann.id}`}
                key={ann.id}
                style={{
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: `1px solid ${ann.is_pinned ? 'rgba(0, 85, 165, 0.4)' : 'var(--border-subtle)'}`,
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: ann.is_pinned ? '0 2px 8px rgba(0, 85, 165, 0.08)' : 'none',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                {/* Announcement Top Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: '#0055A5',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {(ann as any).author_photo ? (
                        <img
                          src={(ann as any).author_photo}
                          alt={authorDisplay}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        authorDisplay.substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {authorDisplay}
                        </span>
                        {ann.author_role && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: '#0055A5',
                              background: 'rgba(0, 85, 165, 0.08)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            {ann.author_role}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <Calendar size={13} />
                        <span>{formatDate(ann.date, ann.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges: Pinned, Cohort, Category */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {ann.is_pinned && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#B45309',
                          background: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        <Pin size={12} />
                        <span>Pinned</span>
                      </span>
                    )}

                    {ann.target_type === 'SINGLE_COHORT' && ann.cohort_name ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#0055A5',
                          background: 'rgba(0, 85, 165, 0.1)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        <Users size={12} />
                        <span>{ann.cohort_name}</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#15803D',
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        <span>All Students</span>
                      </span>
                    )}

                    {ann.course_title && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#7C3AED',
                          background: 'rgba(124, 58, 237, 0.08)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        <BookOpen size={12} />
                        <span>{ann.course_title}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Announcement Title */}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '4px 0 0 0', color: 'var(--text-primary)' }}>
                  {ann.title}
                </h3>

                {/* Announcement Content */}
                <div
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {isExpanded || !ann.content || ann.content.length <= 260
                    ? ann.content
                    : `${ann.content.slice(0, 260)}...`}
                </div>

                {/* Toggle Show More / Less */}
                {ann.content && ann.content.length > 260 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : ann.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0055A5',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {isExpanded ? 'Show Less' : 'Read Full Announcement →'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
