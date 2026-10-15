import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Radio,
  Shield,
  ArrowLeft,
  RefreshCw,
  Search,
  Trash2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  HelpCircle,
  Send,
  FileText,
  ShieldAlert,
  Layers,
  Pin,
  Wrench,
  Megaphone,
} from 'lucide-react';
import {
  SupportTicketService,
  type SupportAnnouncementDTO,
} from '../../core/services/SupportTicketService';
import { useAuth } from '../../context/AuthContext';

export const BroadcastStudioPage: React.FC = () => {
  const supportService = SupportTicketService.getInstance();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSystemAdmin = Boolean(user?.isSystemAdmin?.() || user?.role === 'SYSTEM_ADMIN');

  // Broadcast List State
  const [announcements, setAnnouncements] = useState<SupportAnnouncementDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Studio Active Tab
  const [studioTab, setStudioTab] = useState<'composer' | 'manage'>('composer');

  // Composer Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'PLATFORM_UPDATE' | 'HELP_SUPPORT' | 'SYSTEM_ANNOUNCEMENT' | 'MAINTENANCE'>('PLATFORM_UPDATE');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Load announcements
  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const list = await supportService.getAnnouncements();
      setAnnouncements(list);
    } catch (err) {
      console.error('Failed to load broadcasts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSystemAdmin) {
      loadAnnouncements();
    }
  }, [isSystemAdmin]);

  // Handle Publish
  const handlePublishBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setPublishError('Please enter both broadcast headline and message content.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    try {
      const created = await supportService.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        category,
        is_pinned: isPinned,
        target_type: 'PLATFORM_WIDE',
      });

      setAnnouncements([created, ...announcements]);
      setPublishSuccess(true);
      setTitle('');
      setContent('');
      setIsPinned(false);

      setTimeout(() => {
        setPublishSuccess(false);
        setStudioTab('manage');
      }, 1600);
    } catch (err: any) {
      setPublishError(err?.message || 'Failed to publish bulletin to Support tab.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle Delete
  const handleDeleteBroadcast = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this bulletin? It will immediately disappear from all users\' Support tab.')) {
      return;
    }
    try {
      await supportService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete bulletin.');
    }
  };

  // Quick Template Fillers
  const applyTemplate = (type: 'UPDATE' | 'MAINTENANCE' | 'SUPPORT') => {
    if (type === 'UPDATE') {
      setCategory('PLATFORM_UPDATE');
      setTitle('Platform Update: New Examination & Calendar Features');
      setContent(
        `🚀 What's New in this Release:\n• Full Screen Calendar View with dynamic schedule filtering\n• Dedicated Course Discussion & Study Group workspaces\n• Instant examination evaluation feedback and review logs\n\n💡 Tip: Refresh your browser if any new visual controls do not immediately appear.`
      );
      setIsPinned(true);
    } else if (type === 'MAINTENANCE') {
      setCategory('MAINTENANCE');
      setTitle('Scheduled Infrastructure Optimization Window');
      setContent(
        `⚠️ Planned Maintenance Notice:\n• Date & Time: Saturday 22:00 UTC - 23:30 UTC\n• Scope: Database index optimization and cache synchronization\n• Expected Impact: Brief 2-3 minute pause in live exam submissions\n\nAll courses and study materials will remain accessible during this window.`
      );
      setIsPinned(true);
    } else {
      setCategory('HELP_SUPPORT');
      setTitle('Support Desk Guidelines & Resolution Times');
      setContent(
        `ℹ️ Academy Support Desk Advisory:\n• Urgent technical issues are escalated to Training Administrators within 2 hours.\n• Curriculum and module questions are routed directly to certified cohort instructors.\n• You can rate ticket resolutions to ensure high quality support standards.`
      );
      setIsPinned(false);
    }
  };

  // Category Badge Styles
  const getCategoryMeta = (cat: string) => {
    switch (cat) {
      case 'PLATFORM_UPDATE':
        return {
          label: 'Platform Update',
          icon: <Sparkles size={13} />,
          badgeBg: '#EDE9FE',
          badgeColor: '#6D28D9',
          border: '#DDD6FE',
          gradient: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
        };
      case 'MAINTENANCE':
        return {
          label: 'Maintenance Notice',
          icon: <Wrench size={13} />,
          badgeBg: '#FEF3C7',
          badgeColor: '#B45309',
          border: '#FDE68A',
          gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        };
      case 'HELP_SUPPORT':
        return {
          label: 'Help & Support',
          icon: <HelpCircle size={13} />,
          badgeBg: '#DBEAFE',
          badgeColor: '#1D4ED8',
          border: '#BFDBFE',
          gradient: 'linear-gradient(135deg, #2563EB 0%, #0284C7 100%)',
        };
      case 'SYSTEM_ANNOUNCEMENT':
      default:
        return {
          label: 'Official Announcement',
          icon: <Megaphone size={13} />,
          badgeBg: '#D1FAE5',
          badgeColor: '#047857',
          border: '#A7F3D0',
          gradient: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
        };
    }
  };

  // Non-System Admin Security Block
  if (!isSystemAdmin) {
    return (
      <div style={{ maxWidth: '640px', margin: '80px auto', padding: '0 20px', textAlign: 'center' }}>
        <div
          className="glass-panel"
          style={{
            padding: '40px 32px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            System Administrator Access Required
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
            The <strong>Broadcast Studio</strong> is exclusively reserved for System Administrators.
            Training Administrators and other roles are strictly prohibited from creating platform-wide bulletins or system updates.
          </p>
          <button
            onClick={() => navigate('/admin/tickets')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Tickets & Inquiries Desk</span>
          </button>
        </div>
      </div>
    );
  }

  // Filtered announcements
  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || ann.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // KPI Calculations
  const totalCount = announcements.length;
  const pinnedCount = announcements.filter((a) => a.is_pinned).length;
  const updatesCount = announcements.filter((a) => a.category === 'PLATFORM_UPDATE').length;
  const supportCount = announcements.filter((a) => a.category === 'HELP_SUPPORT').length;
  const maintenanceCount = announcements.filter((a) => a.category === 'MAINTENANCE').length;

  const currentCategoryMeta = getCategoryMeta(category);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Header & Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate('/admin/tickets')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
            title="Return to Tickets & Inquiries Desk"
          >
            <ArrowLeft size={15} />
            <span>Tickets Desk</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
                Broadcast Studio
              </h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  padding: '3px 9px',
                  borderRadius: '20px',
                  backgroundColor: '#7C3AED',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
                }}
              >
                <Radio size={11} className="pulse-icon" />
                <span>ON AIR • SUPER ADMIN ONLY</span>
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
              Broadcast help support advisories, official announcements, and platform updates directly into the Support tab for all academy users.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadAnnouncements}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh announcements list"
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>Sync Feeds</span>
          </button>

          <Link
            to="/help"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Preview how users see the Support tab"
          >
            <Eye size={14} />
            <span>Open User Support Tab</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* KPI Metrics Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
        }}
      >
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #7C3AED' }}>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL BROADCASTS</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>{totalCount}</div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>PLATFORM UPDATES</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#8B5CF6', marginTop: '2px' }}>{updatesCount}</div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #0284C7' }}>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>SUPPORT MESSAGES</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0284C7', marginTop: '2px' }}>{supportCount}</div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>PINNED TO TOP</div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>{pinnedCount}</div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 600 }}>TARGET AUDIENCE</div>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>100% PLATFORM-WIDE</div>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
        <button
          onClick={() => setStudioTab('composer')}
          style={{
            padding: '8px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: studioTab === 'composer' ? '#7C3AED' : 'transparent',
            color: studioTab === 'composer' ? '#FFFFFF' : 'var(--text-secondary)',
            boxShadow: studioTab === 'composer' ? '0 2px 6px rgba(124, 58, 237, 0.25)' : 'none',
          }}
        >
          <Radio size={15} />
          <span>Broadcast Composer & Live Preview</span>
        </button>

        <button
          onClick={() => setStudioTab('manage')}
          style={{
            padding: '8px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: studioTab === 'manage' ? 'var(--primary)' : 'transparent',
            color: studioTab === 'manage' ? '#FFFFFF' : 'var(--text-secondary)',
          }}
        >
          <Layers size={15} />
          <span>Active Bulletins Feed & Archive ({announcements.length})</span>
        </button>
      </div>

      {/* TAB 1: COMPOSER STUDIO WORKSPACE */}
      {studioTab === 'composer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: '22px', alignItems: 'start' }}>
          {/* Left Column: Composer Controls */}
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
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={18} color="#7C3AED" />
                  Broadcast Composer
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Platform Scope: <strong style={{ color: '#059669' }}>ALL USERS</strong>
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Design and launch notifications for immediate broadcast to students, tutors, and staff in the Support tab.
              </p>
            </div>

            {/* Quick Templates Ribbon */}
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Quick Starter Presets
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => applyTemplate('UPDATE')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Sparkles size={12} color="#7C3AED" />
                  <span>Platform Update</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('MAINTENANCE')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Wrench size={12} color="#D97706" />
                  <span>Maintenance Alert</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('SUPPORT')}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <HelpCircle size={12} color="#0284C7" />
                  <span>Support Advisory</span>
                </button>
              </div>
            </div>

            <form onSubmit={handlePublishBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Category Selector Chips */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Notice Category / Channel
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'PLATFORM_UPDATE', label: 'Platform Update', icon: <Sparkles size={14} />, desc: 'New feature releases & improvements' },
                    { id: 'HELP_SUPPORT', label: 'Help & Support', icon: <HelpCircle size={14} />, desc: 'Guidance, FAQs & support desk notice' },
                    { id: 'SYSTEM_ANNOUNCEMENT', label: 'Official Announcement', icon: <Megaphone size={14} />, desc: 'General academy policies & alerts' },
                    { id: 'MAINTENANCE', label: 'System Maintenance', icon: <Wrench size={14} />, desc: 'Scheduled downtime & upgrades' },
                  ].map((catItem) => {
                    const isSelected = category === catItem.id;
                    return (
                      <div
                        key={catItem.id}
                        onClick={() => setCategory(catItem.id as any)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${isSelected ? '#7C3AED' : 'var(--border-subtle)'}`,
                          backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-base)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '0.8rem', color: isSelected ? '#7C3AED' : 'var(--text-primary)' }}>
                          {catItem.icon}
                          <span>{catItem.label}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {catItem.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Headline / Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Platform Update: Version 2.4 Calendar & Evaluation Tools"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Pinned Priority Checkbox */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: isPinned ? '#FFFBEB' : 'var(--bg-base)',
                  border: `1px solid ${isPinned ? '#FDE68A' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
                onClick={() => setIsPinned(!isPinned)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Pin size={16} color={isPinned ? '#D97706' : '#6B7280'} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isPinned ? '#B45309' : 'var(--text-primary)' }}>
                      Pin to Top of Support Tab
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Highlights notice at the top with prominent priority badge for all users.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7C3AED' }}
                />
              </div>

              {/* Content Body Textarea */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Detailed Message Content <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Enter detailed notice content, bullet points, recommendations, or instructions..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '0.84rem',
                    lineHeight: 1.5,
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-base)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {publishError && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: 'var(--radius-md)',
                    color: '#DC2626',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{publishError}</span>
                </div>
              )}

              {publishSuccess && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: 'var(--radius-md)',
                    color: '#059669',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Broadcast published successfully to Support tab!</span>
                </div>
              )}

              {/* Submit & Reset Buttons */}
              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#7C3AED',
                    borderColor: '#6D28D9',
                    padding: '10px 16px',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  <Send size={15} />
                  <span>{isPublishing ? 'Publishing Broadcast...' : 'Broadcast to All Users'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setContent('');
                    setIsPinned(false);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '10px 16px' }}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Interactive Support Tab Simulator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={16} color="#7C3AED" />
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Real-Time Support Tab Simulation
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                  Live Preview
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                This is exactly how students, tutors, agents, and staff will see this announcement in the right-hand column of their <strong>Support & Inquiries</strong> tab.
              </p>

              {/* Simulated Card Frame */}
              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Header of Simulated Bulletins Card */}
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Shield size={15} color="#0055A5" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0055A5' }}>
                    Official Academy Bulletins & Updates
                  </span>
                </div>

                {/* Simulated Notice Item */}
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: isPinned ? '#FFFDF0' : '#FFFFFF',
                    borderLeft: isPinned ? '4px solid #F59E0B' : '4px solid transparent',
                  }}
                >
                  {/* Category Pill & Pinned Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: currentCategoryMeta.badgeBg,
                          color: currentCategoryMeta.badgeColor,
                          border: `1px solid ${currentCategoryMeta.border}`,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {currentCategoryMeta.label}
                      </span>
                      {isPinned && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Pin size={10} />
                          <span>Important</span>
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>Just Now</span>
                  </div>

                  {/* Simulated Headline */}
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1F2937', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                    {title.trim() || 'Headline will appear here...'}
                  </h4>

                  {/* Simulated Author Subtitle */}
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', marginBottom: '8px' }}>
                    Posted by Super Admin • {user?.fullName || 'Academy Directorate'}
                  </div>

                  {/* Simulated Content Body */}
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: '#4B5563',
                      lineHeight: 1.45,
                      margin: 0,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {content.trim() || 'Detailed broadcast message content and guidance will appear here formatted with line breaks and highlights.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Broadcast Protocol Card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: '18px',
              }}
            >
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} color="#7C3AED" />
                Broadcast Delivery Policy
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <li><strong>Instant Propagation:</strong> Bulletins appear without delay in the Support tab.</li>
                <li><strong>Role Security:</strong> Training Admins cannot broadcast or remove bulletins.</li>
                <li><strong>Pinned Position:</strong> Pinned bulletins always stay at the top of user feeds.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE BULLETINS FEED & ARCHIVE */}
      {studioTab === 'manage' && (
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
              onClick={() => setStudioTab('composer')}
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
                onClick={() => setStudioTab('composer')}
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
                          onClick={() => {
                            setTitle(ann.title);
                            setContent(ann.content);
                            setCategory((ann.category as any) || 'PLATFORM_UPDATE');
                            setIsPinned(Boolean(ann.is_pinned));
                            setStudioTab('composer');
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Load into composer to create update"
                        >
                          <FileText size={12} />
                          <span>Clone to Composer</span>
                        </button>

                        <button
                          onClick={() => handleDeleteBroadcast(ann.id)}
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
      )}
    </div>
  );
};
