import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LifeBuoy,
  Plus,
  RefreshCw,
  Search,
  Forward,
  MessageSquare,
  Send,
  Check,
  X,
  Sparkles,
  Megaphone,
  Trash2,
  Radio,
} from 'lucide-react';
import {
  SupportTicketService,
  type HelpTicketDTO,
  type AssignableUserDTO,
  type SupportAnnouncementDTO,
} from '../../core/services/SupportTicketService';
import { useTranslation } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';

export const AdminTicketsPage: React.FC = () => {
  const supportService = SupportTicketService.getInstance();
  const { user } = useAuth();
  const { language } = useTranslation();
  const navigate = useNavigate();

  const isSystemAdmin = Boolean(user?.isSystemAdmin?.() || user?.role === 'SYSTEM_ADMIN');

  const [tickets, setTickets] = useState<HelpTicketDTO[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUserDTO[]>([]);
  const [announcements, setAnnouncements] = useState<SupportAnnouncementDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<HelpTicketDTO | null>(null);

  // Active view tab: 'tickets' vs 'bulletins' (Bulletins tab only available for System Admin)
  const [activeTab, setActiveTab] = useState<'tickets' | 'bulletins'>('tickets');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // New Ticket Form
  const [newRecipient, setNewRecipient] = useState<'TUTOR' | 'TECH_SUPPORT' | 'TRAINING_ADMIN'>('TRAINING_ADMIN');
  const [newCategory, setNewCategory] = useState<'CONTENT_INQUIRY' | 'TECHNICAL_ISSUE' | 'EXAM_DISPUTE' | 'ACCOUNT_BILLING' | 'ADMINISTRATIVE' | 'OTHER'>('ADMINISTRATIVE');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [newTicketError, setNewTicketError] = useState<string | null>(null);
  const [newTicketSuccess, setNewTicketSuccess] = useState(false);

  // Forward Modal State
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [forwardNotes, setForwardNotes] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardError, setForwardError] = useState<string | null>(null);

  // Status Update Modal State
  const [targetStatus, setTargetStatus] = useState<HelpTicketDTO['status']>('RESOLVED');
  const [responseReply, setResponseReply] = useState('');
  const [statusInternalNotes, setStatusInternalNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tList, uList, aList] = await Promise.all([
        supportService.getTickets(),
        supportService.getAssignableUsers(),
        supportService.getAnnouncements(),
      ]);
      setTickets(tList);
      setAssignableUsers(uList);
      setAnnouncements(aList);

      if (selectedTicket) {
        const found = tList.find((t) => t.id === selectedTicket.id);
        if (found) setSelectedTicket(found);
      }
    } catch (err) {
      console.error('Error fetching tickets for admin desk:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      setTargetStatus(selectedTicket.status);
      setResponseReply(selectedTicket.response || '');
      setStatusInternalNotes(selectedTicket.internal_notes || '');
      setSelectedAssignee(selectedTicket.assigned_to || (assignableUsers[0]?.id ?? ''));
      setForwardNotes('');
    }
  }, [selectedTicket?.id]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) {
      setNewTicketError('Please provide both subject and detailed message.');
      return;
    }

    setIsSubmittingNew(true);
    setNewTicketError(null);
    try {
      const created = await supportService.createTicket({
        recipient_role: newRecipient,
        category: newCategory,
        priority: newPriority,
        subject: newSubject.trim(),
        message: newMessage.trim(),
      });

      setTickets([created, ...tickets]);
      setSelectedTicket(created);
      setNewTicketSuccess(true);
      setNewSubject('');
      setNewMessage('');
      setTimeout(() => {
        setNewTicketSuccess(false);
        setShowNewTicketModal(false);
      }, 1500);
    } catch (err: any) {
      setNewTicketError(err?.message || 'Failed to submit ticket.');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to remove this bulletin from the Support tab?')) return;
    try {
      await supportService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete announcement.');
    }
  };

  const handleForwardTicket = async () => {
    if (!selectedTicket || !selectedAssignee) {
      setForwardError('Please select a staff member or tutor to forward to.');
      return;
    }

    setIsForwarding(true);
    setForwardError(null);
    try {
      const updated = await supportService.forwardTicket(selectedTicket.id, {
        assigned_to: selectedAssignee,
        internal_notes: forwardNotes.trim() || undefined,
      });

      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setShowForwardModal(false);
      setForwardNotes('');
    } catch (err: any) {
      setForwardError(err?.message || 'Failed to forward ticket.');
    } finally {
      setIsForwarding(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket) return;

    setIsUpdatingStatus(true);
    setStatusError(null);
    try {
      const updated = await supportService.updateTicketStatus(selectedTicket.id, {
        status: targetStatus,
        response: responseReply.trim() || undefined,
        internal_notes: statusInternalNotes.trim() || undefined,
      });

      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setShowStatusModal(false);
    } catch (err: any) {
      setStatusError(err?.message || 'Failed to update ticket status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Sender Role Badge Formatter
  const getRoleBadge = (role?: string) => {
    const r = role ? role.toUpperCase() : 'STUDENT';
    let bgColor = '#DBEAFE';
    let textColor = '#1E40AF';
    let label = 'Student';

    switch (r) {
      case 'TUTOR':
        bgColor = '#D1FAE5';
        textColor = '#065F46';
        label = 'Tutor / Instructor';
        break;
      case 'TRAINING_ADMIN':
        bgColor = '#E0F2FE';
        textColor = '#0369A1';
        label = 'Training Admin';
        break;
      case 'BOARD_REVIEWER':
        bgColor = '#CCFBF1';
        textColor = '#115E59';
        label = 'Board Reviewer';
        break;
      case 'AGENT':
        bgColor = '#FFEDD5';
        textColor = '#9A3412';
        label = 'Agent / Field';
        break;
      case 'ENTERPRISE_ADMIN':
        bgColor = '#DCFCE7';
        textColor = '#166534';
        label = 'Enterprise Admin';
        break;
      case 'SYSTEM_ADMIN':
        bgColor = '#FEE2E2';
        textColor = '#991B1B';
        label = 'Super Admin';
        break;
      default:
        bgColor = '#DBEAFE';
        textColor = '#1E40AF';
        label = 'Student';
    }

    return (
      <span
        style={{
          display: 'inline-block',
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: bgColor,
          color: textColor,
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </span>
    );
  };

  const getStatusBadge = (status: HelpTicketDTO['status']) => {
    switch (status) {
      case 'OPEN':
        return <span className="canvas-badge canvas-badge-open">Open</span>;
      case 'IN_PROGRESS':
        return <span className="canvas-badge canvas-badge-progress">In Progress</span>;
      case 'RESOLVED':
        return <span className="canvas-badge canvas-badge-resolved">Resolved</span>;
      case 'CLOSED':
        return <span className="canvas-badge canvas-badge-closed">Closed</span>;
      case 'REOPENED':
        return <span className="canvas-badge canvas-badge-reopened">Reopened</span>;
      default:
        return <span className="canvas-badge">{status}</span>;
    }
  };

  const getPriorityBadge = (prio: HelpTicketDTO['priority']) => {
    switch (prio) {
      case 'URGENT':
        return <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 6px', borderRadius: '3px' }}>URGENT</span>;
      case 'HIGH':
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '3px' }}>HIGH</span>;
      case 'MEDIUM':
        return <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#2563EB', backgroundColor: '#DBEAFE', padding: '2px 6px', borderRadius: '3px' }}>MEDIUM</span>;
      default:
        return <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#6B7280', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '3px' }}>LOW</span>;
    }
  };

  const getAnnouncementCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'PLATFORM_UPDATE':
        return <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '2px 6px', borderRadius: '3px' }}>Platform Update</span>;
      case 'HELP_SUPPORT':
        return <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '3px' }}>Help & Support Message</span>;
      case 'MAINTENANCE':
        return <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#FFE4E6', color: '#E11D48', padding: '2px 6px', borderRadius: '3px' }}>Maintenance Notice</span>;
      default:
        return <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '3px' }}>System Announcement</span>;
    }
  };

  // Filtering
  const filteredTickets = tickets.filter((tkt) => {
    if (statusFilter !== 'ALL' && tkt.status !== statusFilter) return false;
    if (roleFilter !== 'ALL' && (tkt.user_role || 'STUDENT') !== roleFilter) return false;
    if (categoryFilter !== 'ALL' && tkt.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = tkt.subject.toLowerCase().includes(q);
      const matchMsg = tkt.message.toLowerCase().includes(q);
      const matchUser = (tkt.user_name || '').toLowerCase().includes(q);
      const matchPhone = (tkt.user_phone || '').includes(q);
      const matchId = tkt.id.toLowerCase().includes(q);
      return matchSub || matchMsg || matchUser || matchPhone || matchId;
    }
    return true;
  });

  // KPI Metrics
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const reopenedCount = tickets.filter((t) => t.status === 'REOPENED').length;
  const feedbackLikesCount = tickets.filter((t) => t.feedback_rating === 'LIKE').length;
  const feedbackTotalCount = tickets.filter((t) => Boolean(t.feedback_submitted_at)).length;
  const satisfactionRate = feedbackTotalCount > 0 ? Math.round((feedbackLikesCount / feedbackTotalCount) * 100) : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
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
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Tickets & Inquiries Desk
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: isSystemAdmin ? '#EF4444' : '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              {isSystemAdmin ? 'SUPER ADMIN CONSOLE' : 'TRAINING ADMIN CONSOLE'}
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
            {isSystemAdmin
              ? 'Manage inquiries, forward to tutors/specialists, track resolutions, and broadcast platform updates & help support messages to all users.'
              : 'Process inquiries from students and all platform roles. Forward to instructors, update statuses, and monitor resolution feedback.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh tickets"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          {/* EXCLUSIVE FEATURE FOR SYSTEM ADMIN ONLY: Navigate to Broadcast Studio */}
          {isSystemAdmin && (
            <button
              onClick={() => navigate('/admin/broadcast-studio')}
              className="btn btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#7C3AED',
                color: '#FFFFFF',
                border: '1px solid #6D28D9',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
              }}
              title="Open Broadcast Studio to manage platform updates, help messages, and announcements"
            >
              <Radio size={15} />
              <span>Broadcast Studio</span>
            </button>
          )}

          <button
            onClick={() => setShowNewTicketModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>New Ticket / Inquiry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '14px',
        }}
      >
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL COLLECTED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{totalCount}</div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OPEN & IN PROGRESS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>{openCount}</div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RESOLVED / CLOSED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{resolvedCount}</div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>REOPENED / UNSOLVED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>{reopenedCount}</div>
        </div>
        <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SATISFACTION RATE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
            {satisfactionRate}% <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>({feedbackLikesCount} 👍)</span>
          </div>
        </div>
      </div>

      {/* Switcher for System Admin: View Tickets Desk vs Platform Bulletins */}
      {isSystemAdmin && (
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'tickets' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'tickets' ? '#FFFFFF' : 'var(--text-secondary)',
            }}
          >
            All User Tickets & Inquiries ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('bulletins')}
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeTab === 'bulletins' ? '#7C3AED' : 'transparent',
              color: activeTab === 'bulletins' ? '#FFFFFF' : 'var(--text-secondary)',
            }}
          >
            <Radio size={14} />
            <span>Support Bulletins & Platform Updates ({announcements.length})</span>
          </button>
        </div>
      )}

      {/* TAB 1: TICKETS DESK */}
      {activeTab === 'tickets' && (
        <>
          {/* Filter and Search Controls */}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  onChange={(e) => setRoleFilter(e.target.value)}
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
                  onChange={(e) => setCategoryFilter(e.target.value)}
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
                  onClick={() => setStatusFilter(st)}
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

          {/* Main Grid: Table & Selected Details */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1.4fr 1fr' : '1fr', gap: '20px' }}>
            {/* Tickets List Table */}
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '12px 18px',
                  borderBottom: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Collected Tickets & Inquiries ({filteredTickets.length})
                </span>
              </div>

              {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Fetching tickets...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No tickets found matching the specified filters.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="canvas-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Ticket & Subject</th>
                        <th>Sender & Role</th>
                        <th>Routing / Assignee</th>
                        <th>Status</th>
                        <th>Satisfaction</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((tkt) => {
                        const isSelected = selectedTicket?.id === tkt.id;
                        return (
                          <tr
                            key={tkt.id}
                            onClick={() => setSelectedTicket(isSelected ? null : tkt)}
                            style={{
                              cursor: 'pointer',
                              backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.08)' : undefined,
                            }}
                          >
                            <td>
                              <div style={{ fontWeight: 600, color: '#0284c7', fontSize: '0.86rem' }}>
                                {tkt.subject}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{tkt.category}</span>
                                <span>•</span>
                                {getPriorityBadge(tkt.priority)}
                              </div>
                            </td>

                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {tkt.user_name || 'Anonymous User'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {getRoleBadge(tkt.user_role)}
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    {tkt.user_phone || ''}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                {tkt.assigned_to_name ? (
                                  <span style={{ color: '#059669', fontWeight: 600 }}>{tkt.assigned_to_name}</span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned (Desk)</span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                Team: {tkt.recipient_role === 'TUTOR' ? 'Tutors' : tkt.recipient_role === 'TECH_SUPPORT' ? 'Technical Support' : 'Training Admin'}
                              </div>
                            </td>

                            <td>{getStatusBadge(tkt.status)}</td>

                            <td>
                              {tkt.feedback_submitted_at ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {tkt.feedback_rating === 'LIKE' ? (
                                    <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700, backgroundColor: '#D1FAE5', padding: '1px 5px', borderRadius: '3px' }}>
                                      👍 Liked
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 700, backgroundColor: '#FEE2E2', padding: '1px 5px', borderRadius: '3px' }}>
                                      👎 Disliked
                                    </span>
                                  )}
                                  {tkt.feedback_resolution === 'SOLVED' ? (
                                    <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>✓ Solved</span>
                                  ) : (
                                    <span style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 600 }}>✗ Unsolved</span>
                                  )}
                                </div>
                              ) : tkt.status === 'RESOLVED' || tkt.status === 'CLOSED' ? (
                                <span style={{ fontSize: '0.7rem', color: '#D97706', fontStyle: 'italic' }}>
                                  Awaiting Feedback
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>-</span>
                              )}
                            </td>

                            <td style={{ fontSize: '0.73rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {new Date(tkt.created_at).toLocaleDateString(language === 'rw' ? 'rw-RW' : 'en-US')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Selected Ticket Action & Inspection Drawer */}
            {selectedTicket && (
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7' }}>
                        TICKET #{selectedTicket.id.slice(0, 8).toUpperCase()}
                      </span>
                      {getPriorityBadge(selectedTicket.priority)}
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>
                      {selectedTicket.subject}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Sender Detail Block */}
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Sender Information
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedTicket.user_name || 'Anonymous User'}
                    </span>
                    {getRoleBadge(selectedTicket.user_role)}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {selectedTicket.user_phone && <span>📞 {selectedTicket.user_phone}</span>}
                    {selectedTicket.user_email && <span>✉️ {selectedTicket.user_email}</span>}
                    <span>📅 {new Date(selectedTicket.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Quick Actions Bar */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowForwardModal(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Forward size={14} />
                    <span>Forward Ticket</span>
                  </button>
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={14} />
                    <span>Update & Reply</span>
                  </button>
                </div>

                {/* Routing & Assignment Information */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>Assigned: <strong>{selectedTicket.assigned_to_name || 'Desk Queue (Unassigned)'}</strong></div>
                  {selectedTicket.forwarded_by_name && (
                    <div style={{ marginTop: '2px' }}>
                      Forwarded by <strong>{selectedTicket.forwarded_by_name}</strong> on {selectedTicket.forwarded_at ? new Date(selectedTicket.forwarded_at).toLocaleDateString() : ''}
                    </div>
                  )}
                </div>

                {/* Internal Staff Notes */}
                {selectedTicket.internal_notes && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', marginBottom: '2px' }}>
                      🔒 Internal Notes
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#92400E' }}>{selectedTicket.internal_notes}</div>
                  </div>
                )}

                {/* Message Body */}
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Inquiry Details:
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0, padding: '12px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', whiteSpace: 'pre-line' }}>
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Response from Academy */}
                {selectedTicket.response && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', display: 'block', marginBottom: '4px' }}>
                      Staff Resolution Response:
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#065F46', lineHeight: 1.5, margin: 0, padding: '12px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0', whiteSpace: 'pre-line' }}>
                      {selectedTicket.response}
                    </p>
                  </div>
                )}

                {/* Feedback Summary */}
                {selectedTicket.feedback_submitted_at && (
                  <div style={{ padding: '12px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Sparkles size={14} />
                      Sender Satisfaction Feedback
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {selectedTicket.feedback_rating === 'LIKE' ? (
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '3px' }}>
                          👍 Liked (Helpful)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '3px' }}>
                          👎 Disliked (Unhelpful)
                        </span>
                      )}

                      {selectedTicket.feedback_resolution === 'SOLVED' ? (
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857' }}>✓ Issue Solved</span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626' }}>✗ Unsolved / Reopened</span>
                      )}
                    </div>
                    {selectedTicket.feedback_notes && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic' }}>
                        "{selectedTicket.feedback_notes}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: SYSTEM ADMIN SUPPORT BULLETINS & PLATFORM UPDATES (Only visible to System Admin) */}
      {isSystemAdmin && activeTab === 'bulletins' && (
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
              onClick={() => navigate('/admin/broadcast-studio')}
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
              No platform bulletins currently published. Click "Create New Bulletin / Update" to broadcast to all users.
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
                        onClick={() => handleDeleteAnnouncement(ann.id)}
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
      )}

      {/* MODAL 1: Create New Ticket / Inquiry */}
      {showNewTicketModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LifeBuoy size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Submit Ticket / Inquiry
                </h3>
              </div>
              <button
                onClick={() => setShowNewTicketModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {newTicketSuccess && (
              <div style={{ padding: '10px 14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '4px', fontSize: '0.84rem', marginBottom: '14px' }}>
                ✓ Ticket submitted successfully and collected in the desk!
              </div>
            )}

            {newTicketError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '4px', fontSize: '0.84rem', marginBottom: '14px' }}>
                {newTicketError}
              </div>
            )}

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Direct Inquiry To:
                  </label>
                  <select
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value as any)}
                    className="canvas-input"
                    style={{ width: '100%', fontSize: '0.84rem' }}
                  >
                    <option value="TRAINING_ADMIN">Training Admin / Operations</option>
                    <option value="TUTOR">Tutor / Instructor Team</option>
                    <option value="TECH_SUPPORT">Technical Platform Team</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Category:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="canvas-input"
                    style={{ width: '100%', fontSize: '0.84rem' }}
                  >
                    <option value="ADMINISTRATIVE">Administrative & Operations</option>
                    <option value="CONTENT_INQUIRY">Course & Lesson Inquiry</option>
                    <option value="TECHNICAL_ISSUE">Technical Issue</option>
                    <option value="EXAM_DISPUTE">Examination Dispute</option>
                    <option value="ACCOUNT_BILLING">Account & Billing</option>
                    <option value="OTHER">Other Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Priority Level:
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.84rem' }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent (Immediate Attention)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Subject / Summary:
                </label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g., Question about schedule adjustment for Cohort B..."
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.84rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Inquiry Details:
                </label>
                <textarea
                  rows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Provide all context and details..."
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.84rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={13} />
                  <span>{isSubmittingNew ? 'Submitting...' : 'Send Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Forward Ticket */}
      {showForwardModal && selectedTicket && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Forward Ticket #{selectedTicket.id.slice(0, 8)}
              </h3>
              <button onClick={() => setShowForwardModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {forwardError && (
              <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '12px' }}>
                {forwardError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Assignee (Tutor / Staff Member):
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.84rem' }}
                >
                  <option value="">-- Choose User --</option>
                  {assignableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role}) • {u.phone_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Handover / Internal Notes:
                </label>
                <textarea
                  rows={3}
                  value={forwardNotes}
                  onChange={(e) => setForwardNotes(e.target.value)}
                  placeholder="Instructions for the assignee..."
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.84rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowForwardModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleForwardTicket}
                  disabled={isForwarding || !selectedAssignee}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Forward size={14} />
                  <span>{isForwarding ? 'Forwarding...' : 'Forward Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Update Status & Reply */}
      {showStatusModal && selectedTicket && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Update Ticket Status & Reply
              </h3>
              <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {statusError && (
              <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '4px', fontSize: '0.8rem', marginBottom: '12px' }}>
                {statusError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Status:
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.84rem' }}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                  <option value="REOPENED">Reopened</option>
                </select>
                {(targetStatus === 'RESOLVED' || targetStatus === 'CLOSED') && (
                  <p style={{ fontSize: '0.74rem', color: '#059669', backgroundColor: '#ECFDF5', padding: '6px 10px', borderRadius: '4px', margin: '6px 0 0 0' }}>
                    💡 Marking this ticket as Resolved or Closed triggers an automatic feedback prompt (Like/Dislike, Solved/Unsolved) for the sender.
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Resolution Reply (Visible to Sender):
                </label>
                <textarea
                  rows={4}
                  value={responseReply}
                  onChange={(e) => setResponseReply(e.target.value)}
                  placeholder="Official reply explaining the resolution or answer..."
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.84rem', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Internal Staff Notes:
                </label>
                <input
                  type="text"
                  value={statusInternalNotes}
                  onChange={(e) => setStatusInternalNotes(e.target.value)}
                  placeholder="Private internal notes..."
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowStatusModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={14} />
                  <span>{isUpdatingStatus ? 'Updating...' : 'Save & Update'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
