import React from 'react';
import {
  Radio,
  Sparkles,
  Wrench,
  HelpCircle,
  Megaphone,
  Pin,
  Send,
  AlertCircle,
  CheckCircle2,
  Eye,
  Shield,
} from 'lucide-react';
import { getCategoryMeta } from './BroadcastCategoryMeta';

interface BroadcastComposerProps {
  title: string;
  setTitle: (val: string) => void;
  category: 'PLATFORM_UPDATE' | 'HELP_SUPPORT' | 'SYSTEM_ANNOUNCEMENT' | 'MAINTENANCE';
  setCategory: (val: 'PLATFORM_UPDATE' | 'HELP_SUPPORT' | 'SYSTEM_ANNOUNCEMENT' | 'MAINTENANCE') => void;
  content: string;
  setContent: (val: string) => void;
  isPinned: boolean;
  setIsPinned: (val: boolean) => void;
  isPublishing: boolean;
  publishError: string | null;
  publishSuccess: boolean;
  onPublish: (e: React.FormEvent) => void;
  onClear: () => void;
  onApplyTemplate: (type: 'UPDATE' | 'MAINTENANCE' | 'SUPPORT') => void;
  userFullName?: string;
}

export const BroadcastComposer: React.FC<BroadcastComposerProps> = ({
  title,
  setTitle,
  category,
  setCategory,
  content,
  setContent,
  isPinned,
  setIsPinned,
  isPublishing,
  publishError,
  publishSuccess,
  onPublish,
  onClear,
  onApplyTemplate,
  userFullName,
}) => {
  const currentCategoryMeta = getCategoryMeta(category);

  return (
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
              onClick={() => onApplyTemplate('UPDATE')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Sparkles size={12} color="#7C3AED" />
              <span>Platform Update</span>
            </button>
            <button
              type="button"
              onClick={() => onApplyTemplate('MAINTENANCE')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Wrench size={12} color="#D97706" />
              <span>Maintenance Alert</span>
            </button>
            <button
              type="button"
              onClick={() => onApplyTemplate('SUPPORT')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.72rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <HelpCircle size={12} color="#0284C7" />
              <span>Support Advisory</span>
            </button>
          </div>
        </div>

        <form onSubmit={onPublish} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              onClick={onClear}
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
                Announcements
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
                Posted by Super Admin • {userFullName || 'Academy Directorate'}
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
  );
};
