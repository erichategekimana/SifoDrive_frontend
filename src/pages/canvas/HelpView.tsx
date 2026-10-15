import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  CheckCircle2,
  XCircle,
  Shield,
  Plus,
  RefreshCw,
  Forward,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Check,
  HelpCircle,
  Sparkles,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  SupportTicketService,
  type HelpTicketDTO,
  type SupportAnnouncementDTO,
  type AssignableUserDTO,
} from '../../core/services/SupportTicketService';
import { useTranslation } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';

export const HelpView: React.FC = () => {
  const supportService = SupportTicketService.getInstance();
  const { t, language } = useTranslation();
  const { user } = useAuth();

  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN' || user?.role === 'SYSTEM_ADMIN';
  const isSystemAdmin = Boolean(user?.isSystemAdmin?.() || user?.role === 'SYSTEM_ADMIN');

  const [tickets, setTickets] = useState<HelpTicketDTO[]>([]);
  const [announcements, setAnnouncements] = useState<SupportAnnouncementDTO[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpTicketDTO | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED'>('ALL');

  // New Ticket Form State
  const [recipientRole, setRecipientRole] = useState<'TUTOR' | 'TECH_SUPPORT' | 'TRAINING_ADMIN'>('TUTOR');
  const [category, setCategory] = useState<'CONTENT_INQUIRY' | 'TECHNICAL_ISSUE' | 'EXAM_DISPUTE' | 'ACCOUNT_BILLING' | 'ADMINISTRATIVE' | 'OTHER'>('CONTENT_INQUIRY');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Admin Forward Modal State
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [forwardNotes, setForwardNotes] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardError, setForwardError] = useState<string | null>(null);

  // Admin Status Update Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState<HelpTicketDTO['status']>('RESOLVED');
  const [responseReply, setResponseReply] = useState('');
  const [statusInternalNotes, setStatusInternalNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Student Feedback State
  const [feedbackRating, setFeedbackRating] = useState<'LIKE' | 'DISLIKE'>('LIKE');
  const [feedbackResolution, setFeedbackResolution] = useState<'SOLVED' | 'UNSOLVED'>('SOLVED');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [showFeedbackEditor, setShowFeedbackEditor] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const promises: [Promise<HelpTicketDTO[]>, Promise<SupportAnnouncementDTO[]>, Promise<AssignableUserDTO[]> | null] = [
        supportService.getTickets(),
        supportService.getAnnouncements(),
        isTrainingAdmin ? supportService.getAssignableUsers() : null,
      ];

      const [tList, aList, uList] = await Promise.all([
        promises[0],
        promises[1],
        promises[2] ? promises[2] : Promise.resolve([]),
      ]);

      setTickets(tList);
      setAnnouncements(aList);
      if (uList && uList.length > 0) {
        setAssignableUsers(uList);
      }

      // Sync selectedTicket if already open
      if (selectedTicket) {
        const updated = tList.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (e) {
      console.error('Error fetching support data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isTrainingAdmin]);

  // When selectedTicket changes, initialize modal and feedback states
  useEffect(() => {
    if (selectedTicket) {
      setTargetStatus(selectedTicket.status);
      setResponseReply(selectedTicket.response || '');
      setStatusInternalNotes(selectedTicket.internal_notes || '');
      setSelectedAssignee(selectedTicket.assigned_to || (assignableUsers[0]?.id ?? ''));
      setForwardNotes('');
      setFeedbackRating(selectedTicket.feedback_rating || 'LIKE');
      setFeedbackResolution(selectedTicket.feedback_resolution || 'SOLVED');
      setFeedbackNotes(selectedTicket.feedback_notes || '');
      setShowFeedbackEditor(!selectedTicket.feedback_submitted_at);
      setFeedbackSuccess(false);
      setFeedbackError(null);
    }
  }, [selectedTicket?.id]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setFormError(t('canvasHelp.formErrorRequired') || 'Please provide both subject and detailed message.');
      return;
    }

    try {
      const newTkt = await supportService.createTicket({
        recipient_role: recipientRole,
        category,
        priority,
        subject: subject.trim(),
        message: message.trim(),
      });

      setTickets([newTkt, ...tickets]);
      setSelectedTicket(newTkt);
      setFormSuccess(true);
      setSubject('');
      setMessage('');
      setFormError(null);
      setTimeout(() => {
        setFormSuccess(false);
        setShowNewTicketForm(false);
      }, 2500);
    } catch (err: any) {
      setFormError(err.message || t('canvasHelp.formErrorGeneric') || 'Failed to submit ticket.');
    }
  };

  const handleForwardTicket = async () => {
    if (!selectedTicket || !selectedAssignee) {
      setForwardError('Please select a recipient user to forward to.');
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
      setForwardError(err?.message || 'Failed to forward ticket. Please try again.');
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

  const handleSubmitFeedback = async () => {
    if (!selectedTicket) return;

    setIsSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      const updated = await supportService.submitFeedback(selectedTicket.id, {
        rating: feedbackRating,
        resolution: feedbackResolution,
        notes: feedbackNotes.trim() || undefined,
      });

      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setFeedbackSuccess(true);
      setShowFeedbackEditor(false);
    } catch (err: any) {
      setFeedbackError(err?.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getStatusBadge = (status: HelpTicketDTO['status']) => {
    switch (status) {
      case 'OPEN':
        return <span className="canvas-badge canvas-badge-open">{t('canvasHelp.statusOpen') || 'Open'}</span>;
      case 'IN_PROGRESS':
        return <span className="canvas-badge canvas-badge-progress">{t('canvasHelp.statusInProgress') || 'In Progress'}</span>;
      case 'RESOLVED':
        return <span className="canvas-badge canvas-badge-resolved">{t('canvasHelp.statusResolved') || 'Resolved'}</span>;
      case 'CLOSED':
        return <span className="canvas-badge canvas-badge-closed">{t('canvasHelp.statusClosed') || 'Closed'}</span>;
      case 'REOPENED':
        return <span className="canvas-badge canvas-badge-reopened">{t('canvasHelp.statusReopened') || 'Reopened'}</span>;
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

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm(t('canvasHelp.confirmDeleteAnnouncement') || 'Are you sure you want to remove this bulletin from the Support tab?')) {
      return;
    }
    try {
      await supportService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to remove bulletin');
    }
  };

  const getAnnouncementBadge = (cat?: string) => {
    switch (cat) {
      case 'PLATFORM_UPDATE':
        return {
          label: 'Platform Update',
          bg: '#EDE9FE',
          color: '#6D28D9',
          border: '#DDD6FE',
        };
      case 'HELP_SUPPORT':
        return {
          label: 'Help & Support',
          bg: '#DBEAFE',
          color: '#1D4ED8',
          border: '#BFDBFE',
        };
      case 'MAINTENANCE':
        return {
          label: 'Maintenance',
          bg: '#FEF3C7',
          color: '#B45309',
          border: '#FDE68A',
        };
      case 'SYSTEM_ANNOUNCEMENT':
        return {
          label: 'System Notice',
          bg: '#D1FAE5',
          color: '#047857',
          border: '#A7F3D0',
        };
      default:
        return {
          label: cat ? cat.replace(/_/g, ' ') : 'Notice',
          bg: '#F3F4F6',
          color: '#4B5563',
          border: '#E5E7EB',
        };
    }
  };

  const filteredTickets = tickets.filter((tkt) => {
    if (statusFilter === 'ALL') return true;
    return tkt.status === statusFilter;
  });

  // Calculate stats for admin dashboard view
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const reopenedCount = tickets.filter((t) => t.status === 'REOPENED').length;
  const feedbackLikesCount = tickets.filter((t) => t.feedback_rating === 'LIKE').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Top Header / Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0055A5', margin: 0 }}>
              {isTrainingAdmin ? (t('canvasHelp.adminDesk') || 'Training Admin Support Desk') : (t('canvasHelp.title') || 'Support & Help Desk')}
            </h1>
            {isTrainingAdmin && (
              <span style={{ fontSize: '0.72rem', backgroundColor: '#0055A5', color: '#FFF', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                ADMIN CONSOLE
              </span>
            )}
          </div>
          <p style={{ color: '#666666', fontSize: '0.9rem', marginTop: '4px' }}>
            {isTrainingAdmin
              ? 'Centralized student inquiries desk. Review, forward to tutors/instructors, update resolution statuses, and track satisfaction feedback.'
              : (t('canvasHelp.subtitle') || 'Need help with course content, schedules, or technical issues? Submit a ticket and track resolutions below.')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadData}
            className="canvas-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh ticket data"
          >
            <RefreshCw size={15} />
            <span>{t('canvasHelp.refresh') || 'Refresh'}</span>
          </button>

          {/* Student ticket creator button */}
          <button
            onClick={() => setShowNewTicketForm(!showNewTicketForm)}
            className="canvas-btn canvas-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>{showNewTicketForm ? (t('canvasHelp.closeForm') || 'Close Form') : (t('canvasHelp.newTicket') || 'New Ticket')}</span>
          </button>
        </div>
      </div>

      {/* Admin KPI Summary Bar */}
      {isTrainingAdmin && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ padding: '12px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', borderLeft: '4px solid #0055A5' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>COLLECTED TICKETS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{totalCount}</div>
          </div>
          <div style={{ padding: '12px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>OPEN & IN PROGRESS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706', marginTop: '2px' }}>{openCount}</div>
          </div>
          <div style={{ padding: '12px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', borderLeft: '4px solid #10B981' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>RESOLVED / CLOSED</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{resolvedCount}</div>
          </div>
          <div style={{ padding: '12px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', borderLeft: '4px solid #EF4444' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>REOPENED / UNSOLVED</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>{reopenedCount}</div>
          </div>
          <div style={{ padding: '12px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '4px', borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>POSITIVE FEEDBACK</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>
              {feedbackLikesCount} 👍
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Form (Expandable for students / staff) */}
      {showNewTicketForm && (
        <div className="canvas-card" style={{ marginBottom: '24px', borderLeft: '4px solid #0055A5' }}>
          <div className="canvas-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.05rem', margin: 0, color: '#0055A5' }}>
              {t('canvasHelp.submitHeader') || 'Submit a New Support Ticket'}
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
              Tickets will be reviewed and routed by Training Admin
            </span>
          </div>

          {formSuccess && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#F0FFF4',
                border: '1px solid #C6F6D5',
                color: '#22543D',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
              }}
            >
              <CheckCircle2 size={16} color="#058728" />
              <span>{t('canvasHelp.successMsg') || 'Ticket submitted successfully! Training Admin has received your inquiry.'}</span>
            </div>
          )}

          {formError && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#FFF5F5',
                border: '1px solid #FED7D7',
                color: '#9B2C2C',
                marginBottom: '16px',
                fontSize: '0.85rem',
              }}
            >
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2D3B45', marginBottom: '6px' }}>
                  {t('canvasHelp.recipient') || 'Intended Recipient'}
                </label>
                <select
                  value={recipientRole}
                  onChange={(e) => setRecipientRole(e.target.value as any)}
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="TUTOR">{t('canvasHelp.tutorRecipient') || 'Course Tutor / Instructor'}</option>
                  <option value="TECH_SUPPORT">{t('canvasHelp.techRecipient') || 'Technical / Platform Support'}</option>
                  <option value="TRAINING_ADMIN">Training Admin / Operations</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2D3B45', marginBottom: '6px' }}>
                  {t('canvasHelp.category') || 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="CONTENT_INQUIRY">{t('canvasHelp.catContent') || 'Lesson & Content Inquiry'}</option>
                  <option value="TECHNICAL_ISSUE">{t('canvasHelp.catTech') || 'System & App Glitch'}</option>
                  <option value="EXAM_DISPUTE">{t('canvasHelp.catExam') || 'Quiz / Examination Dispute'}</option>
                  <option value="ACCOUNT_BILLING">{t('canvasHelp.catBilling') || 'Tuition & Payment'}</option>
                  <option value="ADMINISTRATIVE">Administrative & Operations</option>
                  <option value="OTHER">{t('canvasHelp.catOther') || 'Other Inquiries'}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2D3B45', marginBottom: '6px' }}>
                  {t('canvasHelp.priority') || 'Priority Level'}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="LOW">{t('canvasHelp.prioLow') || 'Low'}</option>
                  <option value="MEDIUM">{t('canvasHelp.prioMedium') || 'Medium'}</option>
                  <option value="HIGH">{t('canvasHelp.prioHigh') || 'High'}</option>
                  <option value="URGENT">{t('canvasHelp.prioUrgent') || 'Urgent'}</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2D3B45', marginBottom: '6px' }}>
                {t('canvasHelp.subject') || 'Subject / Title'}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('canvasHelp.subjectPlaceholder') || 'e.g., Question about Module 3 quiz question #4...'}
                className="canvas-input"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2D3B45', marginBottom: '6px' }}>
                {t('canvasHelp.details') || 'Inquiry Details'}
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('canvasHelp.detailsPlaceholder') || 'Describe your situation with specific details so we can assist promptly...'}
                className="canvas-input"
                style={{ width: '100%', fontSize: '0.85rem', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowNewTicketForm(false)}
                className="canvas-btn"
              >
                {t('canvasHelp.cancel') || 'Cancel'}
              </button>
              <button type="submit" className="canvas-btn canvas-btn-primary">
                <Send size={14} />
                <span>{t('canvasHelp.submit') || 'Submit Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content Workspace: 2-Column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '24px' }}>
        {/* Left Column: Tickets List & Filtering */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="canvas-card" style={{ padding: 0 }}>
            {/* Table Header & Status Filter Pills */}
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #EAEAEA',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0055A5', margin: 0 }}>
                  {isTrainingAdmin ? (t('canvasHelp.allCollectedTickets') || 'Collected Student Tickets') : (t('canvasHelp.myTickets') || 'My Support Tickets')}
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, backgroundColor: '#E2E8F0', padding: '1px 7px', borderRadius: '10px' }}>
                  {filteredTickets.length}
                </span>
              </div>

              {/* Status Filters */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: '3px',
                      border: statusFilter === st ? '1px solid #0055A5' : '1px solid #D1D5DB',
                      backgroundColor: statusFilter === st ? '#0055A5' : '#FFFFFF',
                      color: statusFilter === st ? '#FFFFFF' : '#4B5563',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {st === 'ALL' ? 'All' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#666666', fontSize: '0.85rem' }}>
                {t('canvasHelp.loading') || 'Fetching tickets...'}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#888888', fontSize: '0.85rem' }}>
                {t('canvasHelp.noTickets') || 'No support tickets found under this status filter.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="canvas-table">
                  <thead>
                    <tr>
                      <th>{t('canvasHelp.thSubject') || 'Subject & Details'}</th>
                      {isTrainingAdmin && <th>{t('canvasHelp.student') || 'Student'}</th>}
                      <th>{t('canvasHelp.assignedTo') || 'Routing / Assignee'}</th>
                      <th>{t('canvasHelp.thStatus') || 'Status'}</th>
                      <th>Feedback</th>
                      <th>{t('canvasHelp.thDate') || 'Date'}</th>
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
                            backgroundColor: isSelected ? '#F0F7FA' : undefined,
                          }}
                        >
                          <td>
                            <div style={{ fontWeight: 600, color: '#0055A5', fontSize: '0.86rem' }}>{tkt.subject}</div>
                            <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{tkt.category}</span>
                              <span>•</span>
                              {getPriorityBadge(tkt.priority)}
                            </div>
                          </td>

                          {isTrainingAdmin && (
                            <td>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111827' }}>
                                {tkt.user_name || 'Student'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                                {tkt.user_phone || ''}
                              </div>
                            </td>
                          )}

                          <td>
                            <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#374151' }}>
                              {tkt.assigned_to_name ? (
                                <span style={{ color: '#047857', fontWeight: 600 }}>{tkt.assigned_to_name}</span>
                              ) : (
                                <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Pending Assignee</span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>
                              Role: {tkt.recipient_role === 'TUTOR' ? 'Tutor' : 'Tech Support'}
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
                              <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>-</span>
                            )}
                          </td>

                          <td style={{ fontSize: '0.73rem', color: '#6B7280', whiteSpace: 'nowrap' }}>
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

          {/* Selected Ticket Expanded Detail Card */}
          {selectedTicket && (
            <div className="canvas-card" style={{ borderLeft: '4px solid #0055A5' }}>
              {/* Header Info & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0055A5', letterSpacing: '0.04em' }}>
                      TICKET #{selectedTicket.id.slice(0, 8).toUpperCase()} • {selectedTicket.recipient_role}
                    </span>
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1F2937', margin: '4px 0' }}>
                    {selectedTicket.subject}
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: '#6B7280', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>Student: <strong>{selectedTicket.user_name || 'Student'}</strong> ({selectedTicket.user_phone || 'N/A'})</span>
                    <span>Category: <strong>{selectedTicket.category}</strong></span>
                    <span>Created: <strong>{new Date(selectedTicket.created_at).toLocaleString()}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusBadge(selectedTicket.status)}

                  {/* Training Admin Action Buttons */}
                  {isTrainingAdmin && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setShowForwardModal(true)}
                        className="canvas-btn"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', padding: '6px 10px', backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' }}
                        title="Forward this ticket to a tutor or instructor"
                      >
                        <Forward size={14} />
                        <span>{t('canvasHelp.forwardTicket') || 'Forward'}</span>
                      </button>

                      <button
                        onClick={() => setShowStatusModal(true)}
                        className="canvas-btn canvas-btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', padding: '6px 10px' }}
                        title="Update status and send response to student"
                      >
                        <MessageSquare size={14} />
                        <span>Update Status & Reply</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Routing & Assignment Info Banner */}
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '3px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div>
                  <span style={{ color: '#6B7280' }}>Assigned To: </span>
                  <strong style={{ color: selectedTicket.assigned_to_name ? '#047857' : '#9CA3AF' }}>
                    {selectedTicket.assigned_to_name || 'Not yet assigned (Training Admin Desk)'}
                  </strong>
                </div>
                {selectedTicket.forwarded_by_name && (
                  <div>
                    <span style={{ color: '#6B7280' }}>Forwarded By: </span>
                    <strong style={{ color: '#1D4ED8' }}>{selectedTicket.forwarded_by_name}</strong>
                    {selectedTicket.forwarded_at && (
                      <span style={{ color: '#9CA3AF', marginLeft: '4px' }}>
                        ({new Date(selectedTicket.forwarded_at).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Internal Notes (Admin / Staff Only) */}
              {isTrainingAdmin && selectedTicket.internal_notes && (
                <div style={{ padding: '10px 14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '3px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
                    🔒 Internal Staff Notes
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#92400E', margin: 0, lineHeight: 1.4 }}>
                    {selectedTicket.internal_notes}
                  </p>
                </div>
              )}

              {/* Original Inquiry Message */}
              <div style={{ padding: '14px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '3px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4B5563', display: 'block', marginBottom: '6px' }}>
                  {t('canvasHelp.yourRequest') || 'Inquiry Details from Student:'}
                </span>
                <p style={{ fontSize: '0.86rem', color: '#1F2937', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                  {selectedTicket.message}
                </p>
              </div>

              {/* Academy Staff Response */}
              {selectedTicket.response ? (
                <div style={{ padding: '14px', backgroundColor: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: '3px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <CheckCircle2 size={16} color="#058728" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22543D' }}>
                      {t('canvasHelp.responseFrom', { name: selectedTicket.assigned_to_name || 'Training Administration' }) || `Response from ${selectedTicket.assigned_to_name || 'Academy Staff'}:`}
                    </span>
                    {selectedTicket.resolved_at && (
                      <span style={{ fontSize: '0.72rem', color: '#047857', marginLeft: 'auto' }}>
                        {new Date(selectedTicket.resolved_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#166534', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                    {selectedTicket.response}
                  </p>
                </div>
              ) : (
                <div style={{ padding: '12px', backgroundColor: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: '3px', marginBottom: '16px', textAlign: 'center', color: '#6B7280', fontSize: '0.82rem' }}>
                  {t('canvasHelp.pendingReview') || 'This ticket is currently queued with staff. A response will appear here once handled.'}
                </div>
              )}

              {/* AUTOMATIC FEEDBACK TRIGGER SECTION (For Student or Displaying to Admin) */}
              {(selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED' || selectedTicket.response || selectedTicket.feedback_submitted_at) && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '16px',
                    borderRadius: '4px',
                    backgroundColor: selectedTicket.feedback_submitted_at ? '#F8FAFC' : '#EFF6FF',
                    border: selectedTicket.feedback_submitted_at ? '1px solid #E2E8F0' : '2px solid #3B82F6',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="#2563EB" />
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E3A8A', margin: 0 }}>
                        {t('canvasHelp.feedbackTitle') || 'Resolution Feedback & Student Satisfaction'}
                      </h4>
                    </div>

                    {selectedTicket.feedback_submitted_at && !showFeedbackEditor && !isTrainingAdmin && (
                      <button
                        onClick={() => setShowFeedbackEditor(true)}
                        className="canvas-btn"
                        style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      >
                        Edit Feedback
                      </button>
                    )}
                  </div>

                  {feedbackSuccess && (
                    <div style={{ padding: '10px 14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '3px', fontSize: '0.82rem', marginBottom: '12px' }}>
                      ✓ {t('canvasHelp.feedbackSubmitted') || 'Thank you! Your feedback has been recorded and submitted to Training Admin.'}
                    </div>
                  )}

                  {/* Display submitted feedback details */}
                  {selectedTicket.feedback_submitted_at && !showFeedbackEditor ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>Resolution:</span>
                          {selectedTicket.feedback_resolution === 'SOLVED' ? (
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '3px' }}>
                              ✓ Solved
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '3px' }}>
                              ✗ Unsolved / Reopened
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>Satisfaction:</span>
                          {selectedTicket.feedback_rating === 'LIKE' ? (
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1D4ED8', backgroundColor: '#DBEAFE', padding: '2px 8px', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ThumbsUp size={12} /> Like (Helpful)
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ThumbsDown size={12} /> Dislike (Unhelpful)
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginLeft: 'auto' }}>
                          Submitted on {new Date(selectedTicket.feedback_submitted_at).toLocaleString()}
                        </div>
                      </div>

                      {selectedTicket.feedback_notes && (
                        <div style={{ fontSize: '0.82rem', color: '#4B5563', backgroundColor: '#FFFFFF', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '3px', marginTop: '4px' }}>
                          <strong>Notes:</strong> {selectedTicket.feedback_notes}
                        </div>
                      )}
                    </div>
                  ) : !isTrainingAdmin ? (
                    /* Interactive Feedback Form Triggered for the Student */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <p style={{ fontSize: '0.83rem', color: '#1E40AF', margin: 0, lineHeight: 1.4 }}>
                        {t('canvasHelp.feedbackPrompt') || 'The support team has addressed your ticket. Please let us know if your inquiry is resolved:'}
                      </p>

                      {feedbackError && (
                        <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '3px', fontSize: '0.8rem' }}>
                          {feedbackError}
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* 1. Solved vs Unsolved */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                            1. Did this resolve your issue?
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setFeedbackResolution('SOLVED')}
                              style={{
                                flex: 1,
                                padding: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                borderRadius: '3px',
                                border: feedbackResolution === 'SOLVED' ? '2px solid #059669' : '1px solid #D1D5DB',
                                backgroundColor: feedbackResolution === 'SOLVED' ? '#ECFDF5' : '#FFFFFF',
                                color: feedbackResolution === 'SOLVED' ? '#047857' : '#4B5563',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <CheckCircle2 size={16} />
                              <span>{t('canvasHelp.solved') || 'Solved'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setFeedbackResolution('UNSOLVED')}
                              style={{
                                flex: 1,
                                padding: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                borderRadius: '3px',
                                border: feedbackResolution === 'UNSOLVED' ? '2px solid #DC2626' : '1px solid #D1D5DB',
                                backgroundColor: feedbackResolution === 'UNSOLVED' ? '#FEF2F2' : '#FFFFFF',
                                color: feedbackResolution === 'UNSOLVED' ? '#B91C1C' : '#4B5563',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <XCircle size={16} />
                              <span>{t('canvasHelp.unsolved') || 'Unsolved'}</span>
                            </button>
                          </div>
                        </div>

                        {/* 2. Like vs Dislike */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                            2. Rate your support experience:
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setFeedbackRating('LIKE')}
                              style={{
                                flex: 1,
                                padding: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                borderRadius: '3px',
                                border: feedbackRating === 'LIKE' ? '2px solid #2563EB' : '1px solid #D1D5DB',
                                backgroundColor: feedbackRating === 'LIKE' ? '#EFF6FF' : '#FFFFFF',
                                color: feedbackRating === 'LIKE' ? '#1D4ED8' : '#4B5563',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <ThumbsUp size={15} />
                              <span>{t('canvasHelp.like') || 'Like 👍'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setFeedbackRating('DISLIKE')}
                              style={{
                                flex: 1,
                                padding: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                borderRadius: '3px',
                                border: feedbackRating === 'DISLIKE' ? '2px solid #DC2626' : '1px solid #D1D5DB',
                                backgroundColor: feedbackRating === 'DISLIKE' ? '#FEF2F2' : '#FFFFFF',
                                color: feedbackRating === 'DISLIKE' ? '#B91C1C' : '#4B5563',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <ThumbsDown size={15} />
                              <span>{t('canvasHelp.dislike') || 'Dislike 👎'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                          Optional Feedback Notes:
                        </label>
                        <input
                          type="text"
                          value={feedbackNotes}
                          onChange={(e) => setFeedbackNotes(e.target.value)}
                          placeholder={t('canvasHelp.feedbackNotesPlaceholder') || 'Tell us what was great or what still needs attention...'}
                          className="canvas-input"
                          style={{ width: '100%', fontSize: '0.82rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {selectedTicket.feedback_submitted_at && (
                          <button
                            type="button"
                            onClick={() => setShowFeedbackEditor(false)}
                            className="canvas-btn"
                            style={{ fontSize: '0.78rem' }}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSubmitFeedback}
                          disabled={isSubmittingFeedback}
                          className="canvas-btn canvas-btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
                        >
                          <Send size={13} />
                          <span>{isSubmittingFeedback ? 'Submitting...' : (t('canvasHelp.submitFeedback') || 'Submit Feedback')}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Training Admin View of pending feedback */
                    <div style={{ fontSize: '0.82rem', color: '#6B7280', fontStyle: 'italic' }}>
                      ⏳ This ticket is currently waiting for the student to confirm resolution and provide feedback.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Training Admin & Support Bulletins */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Help Guidelines */}
          <div className="canvas-card" style={{ padding: 0 }}>
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #EAEAEA',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="#0055A5" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0055A5' }}>
                  {t('canvasHelp.systemBulletins') || 'Official Academy Bulletins & Updates'}
                </span>
              </div>
              {isSystemAdmin && (
                <Link
                  to="/admin/tickets"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                  }}
                  title="Broadcast or manage bulletins in Super Admin console"
                >
                  <span>Broadcast Console</span>
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {announcements.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.82rem' }}>
                  No announcements or platform updates at this time.
                </div>
              ) : (
                announcements.map((ann) => {
                  const badge = getAnnouncementBadge(ann.category);
                  return (
                    <div
                      key={ann.id}
                      style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid #F0F0F0',
                        backgroundColor: ann.is_pinned ? '#FFFDF0' : '#FFFFFF',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              letterSpacing: '0.02em',
                            }}
                          >
                            {badge.label}
                          </span>
                          {ann.is_pinned && (
                            <span className="canvas-badge canvas-badge-progress" style={{ fontSize: '0.62rem' }}>
                              {t('canvasHelp.pinnedBadge') || 'Important'}
                            </span>
                          )}
                        </div>
                        {isSystemAdmin && (
                          <button
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#9CA3AF',
                              cursor: 'pointer',
                              padding: '2px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Delete bulletin (System Admin only)"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1F2937', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                        {ann.title}
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: '#6B7280', marginBottom: '6px' }}>
                        {t('canvasHelp.postedBy', { author: ann.author_name || ann.author, date: ann.date }) || `Posted by ${ann.author_name || ann.author} • ${ann.date}`}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.4, margin: 0, whiteSpace: 'pre-line' }}>
                        {ann.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick FAQ & Response Policy */}
          <div className="canvas-card" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1F2937', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={15} color="#0055A5" />
              Support Protocol & SLAs
            </h4>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.6 }}>
              <li><strong>Urgent inquiries:</strong> Escalated to Training Admin & responded within 2 hours.</li>
              <li><strong>Module content:</strong> Forwarded directly to certified cohort tutors.</li>
              <li><strong>Feedback Loop:</strong> Resolving a ticket prompts the student to rate service. Unsolved ratings automatically reopen the ticket.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL 1: Admin Forward Ticket */}
      {showForwardModal && selectedTicket && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="canvas-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0055A5' }}>
                {t('canvasHelp.forwardModalTitle') || 'Forward Ticket to Staff / Tutor'}
              </h3>
              <button
                onClick={() => setShowForwardModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.83rem', color: '#4B5563', marginTop: 0, marginBottom: '16px' }}>
              Forwarding ticket <strong>#{selectedTicket.id.slice(0, 8)}</strong> from student <strong>{selectedTicket.user_name || selectedTicket.user_phone}</strong>:
            </p>

            {forwardError && (
              <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '3px', fontSize: '0.8rem', marginBottom: '12px' }}>
                {forwardError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  {t('canvasHelp.forwardSelectUser') || 'Select Assignee (Tutor / Specialist)'}:
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Internal Instructions / Handover Notes:
                </label>
                <textarea
                  rows={3}
                  value={forwardNotes}
                  onChange={(e) => setForwardNotes(e.target.value)}
                  placeholder={t('canvasHelp.internalNotesPlaceholder') || 'e.g. Please check this student\'s quiz attempt on Chapter 2...'}
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.85rem', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowForwardModal(false)}
                  className="canvas-btn"
                >
                  {t('canvasHelp.cancel') || 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleForwardTicket}
                  disabled={isForwarding || !selectedAssignee}
                  className="canvas-btn canvas-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Forward size={14} />
                  <span>{isForwarding ? 'Forwarding...' : (t('canvasHelp.confirmForward') || 'Forward Now')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Admin Update Ticket Status & Response */}
      {showStatusModal && selectedTicket && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="canvas-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0055A5' }}>
                {t('canvasHelp.updateStatusModalTitle') || 'Update Status & Resolution Response'}
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            {statusError && (
              <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '3px', fontSize: '0.8rem', marginBottom: '12px' }}>
                {statusError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  {t('canvasHelp.newStatus') || 'Ticket Status'}:
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="OPEN">{t('canvasHelp.statusOpen') || 'Open'}</option>
                  <option value="IN_PROGRESS">{t('canvasHelp.statusInProgress') || 'In Progress'}</option>
                  <option value="RESOLVED">{t('canvasHelp.statusResolved') || 'Resolved'}</option>
                  <option value="CLOSED">{t('canvasHelp.statusClosed') || 'Closed'}</option>
                  <option value="REOPENED">{t('canvasHelp.statusReopened') || 'Reopened'}</option>
                </select>

                {(targetStatus === 'RESOLVED' || targetStatus === 'CLOSED') && (
                  <p style={{ fontSize: '0.75rem', color: '#047857', backgroundColor: '#ECFDF5', padding: '6px 10px', borderRadius: '3px', marginTop: '6px', margin: '6px 0 0 0' }}>
                    💡 Marking as Resolved or Closed will automatically trigger a resolution feedback prompt (Like/Dislike, Solved/Unsolved) for the student.
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  {t('canvasHelp.responseMessage') || 'Resolution Response (Visible to Student)'}:
                </label>
                <textarea
                  rows={4}
                  value={responseReply}
                  onChange={(e) => setResponseReply(e.target.value)}
                  placeholder={t('canvasHelp.responseMessagePlaceholder') || 'Enter the official resolution or answer for the student...'}
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.85rem', fontFamily: 'inherit' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Internal Staff Notes (Optional):
                </label>
                <input
                  type="text"
                  value={statusInternalNotes}
                  onChange={(e) => setStatusInternalNotes(e.target.value)}
                  placeholder="Private notes for staff..."
                  className="canvas-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="canvas-btn"
                >
                  {t('canvasHelp.cancel') || 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdatingStatus}
                  className="canvas-btn canvas-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={14} />
                  <span>{isUpdatingStatus ? 'Saving...' : (t('canvasHelp.confirmUpdate') || 'Save & Notify Student')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
