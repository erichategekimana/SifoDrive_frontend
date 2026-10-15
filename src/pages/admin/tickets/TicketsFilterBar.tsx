import React from 'react';
import { Search } from 'lucide-react';

interface TicketsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  statusFilter: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
  onStatusFilterChange: (status: 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED') => void;
}

export const TicketsFilterBar: React.FC<TicketsFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Bar */}
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ticket subject, sender name, phone number, or ID..."
            className="canvas-input"
            style={{ width: '100%', paddingLeft: '36px', fontSize: '0.84rem' }}
          />
        </div>

        {/* Sender Role Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="canvas-input"
            style={{ fontSize: '0.82rem', padding: '6px 10px' }}
          >
            <option value="ALL">All Sender Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TUTOR">Tutors</option>
            <option value="TRAINING_ADMIN">Training Admins</option>
            <option value="BOARD_REVIEWER">Board Reviewers</option>
            <option value="AGENT">Agents</option>
            <option value="ENTERPRISE_ADMIN">Enterprise Admins</option>
            <option value="SYSTEM_ADMIN">Super Admins</option>
          </select>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="canvas-input"
            style={{ fontSize: '0.82rem', padding: '6px 10px' }}
          >
            <option value="ALL">All Categories</option>
            <option value="CONTENT_INQUIRY">Content / Lesson Inquiry</option>
            <option value="TECHNICAL_ISSUE">Technical Issue</option>
            <option value="EXAM_DISPUTE">Exam Dispute</option>
            <option value="ACCOUNT_BILLING">Account & Payment</option>
            <option value="ADMINISTRATIVE">Administrative & Operations</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => onStatusFilterChange(st)}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: statusFilter === st ? '1px solid #0284c7' : '1px solid var(--border-subtle)',
              backgroundColor: statusFilter === st ? '#0284c7' : 'var(--bg-surface)',
              color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
};
