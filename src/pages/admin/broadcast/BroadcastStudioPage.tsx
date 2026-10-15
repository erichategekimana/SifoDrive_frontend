import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import {
  SupportTicketService,
  type SupportAnnouncementDTO,
} from '../../../core/services/SupportTicketService';
import { useAuth } from '../../../context/AuthContext';
import { BroadcastHeader } from './BroadcastHeader';
import { BroadcastKpiRibbon } from './BroadcastKpiRibbon';
import { BroadcastTabsNav } from './BroadcastTabsNav';
import { BroadcastComposer } from './BroadcastComposer';
import { BroadcastManageList } from './BroadcastManageList';

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

  // KPI Calculations
  const totalCount = announcements.length;
  const pinnedCount = announcements.filter((a) => a.is_pinned).length;
  const updatesCount = announcements.filter((a) => a.category === 'PLATFORM_UPDATE').length;
  const supportCount = announcements.filter((a) => a.category === 'HELP_SUPPORT').length;
  const maintenanceCount = announcements.filter((a) => a.category === 'MAINTENANCE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1440px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Header & Breadcrumb */}
      <BroadcastHeader
        onBackToTickets={() => navigate('/admin/tickets')}
        onRefresh={loadAnnouncements}
        isLoading={isLoading}
      />

      {/* KPI Metrics Ribbon */}
      <BroadcastKpiRibbon
        totalCount={totalCount}
        updatesCount={updatesCount}
        supportCount={supportCount}
        pinnedCount={pinnedCount}
      />

      {/* Studio Navigation Tabs */}
      <BroadcastTabsNav
        studioTab={studioTab}
        onTabChange={setStudioTab}
        announcementsCount={announcements.length}
      />

      {/* TAB 1: COMPOSER STUDIO WORKSPACE */}
      {studioTab === 'composer' && (
        <BroadcastComposer
          title={title}
          setTitle={setTitle}
          category={category}
          setCategory={setCategory}
          content={content}
          setContent={setContent}
          isPinned={isPinned}
          setIsPinned={setIsPinned}
          isPublishing={isPublishing}
          publishError={publishError}
          publishSuccess={publishSuccess}
          onPublish={handlePublishBroadcast}
          onClear={() => {
            setTitle('');
            setContent('');
            setIsPinned(false);
          }}
          onApplyTemplate={applyTemplate}
          userFullName={user?.fullName}
        />
      )}

      {/* TAB 2: ACTIVE BULLETINS FEED & ARCHIVE */}
      {studioTab === 'manage' && (
        <BroadcastManageList
          announcements={announcements}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          updatesCount={updatesCount}
          supportCount={supportCount}
          maintenanceCount={maintenanceCount}
          onComposeNew={() => setStudioTab('composer')}
          onCloneToComposer={(ann) => {
            setTitle(ann.title);
            setContent(ann.content);
            setCategory((ann.category as any) || 'PLATFORM_UPDATE');
            setIsPinned(Boolean(ann.is_pinned));
            setStudioTab('composer');
          }}
          onDeleteBroadcast={handleDeleteBroadcast}
        />
      )}
    </div>
  );
};

export default BroadcastStudioPage;
