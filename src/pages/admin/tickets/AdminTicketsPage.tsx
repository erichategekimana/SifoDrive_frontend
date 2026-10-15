import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SupportTicketService,
  type HelpTicketDTO,
  type AssignableUserDTO,
  type SupportAnnouncementDTO,
} from '../../../core/services/SupportTicketService';
import { useTranslation } from '../../../context/I18nContext';
import { useAuth } from '../../../context/AuthContext';
import { TicketsHeader } from './TicketsHeader';
import { TicketsKpiCards } from './TicketsKpiCards';
import { TicketsTabsNav } from './TicketsTabsNav';
import { TicketsFilterBar } from './TicketsFilterBar';
import { TicketsTable } from './TicketsTable';
import { TicketDetailDrawer } from './TicketDetailDrawer';
import { BulletinsTabView } from './BulletinsTabView';
import { NewTicketModal } from './modals/NewTicketModal';
import { ForwardTicketModal } from './modals/ForwardTicketModal';
import { StatusUpdateModal } from './modals/StatusUpdateModal';

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
      <TicketsHeader
        isSystemAdmin={isSystemAdmin}
        onRefresh={loadData}
        onOpenBroadcastStudio={() => navigate('/admin/broadcast-studio')}
        onNewTicket={() => setShowNewTicketModal(true)}
      />

      {/* KPI Cards Bar */}
      <TicketsKpiCards
        totalCount={totalCount}
        openCount={openCount}
        resolvedCount={resolvedCount}
        reopenedCount={reopenedCount}
        satisfactionRate={satisfactionRate}
        feedbackLikesCount={feedbackLikesCount}
      />

      {/* Switcher for System Admin: View Tickets Desk vs Platform Bulletins */}
      {isSystemAdmin && (
        <TicketsTabsNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          ticketsCount={tickets.length}
          announcementsCount={announcements.length}
        />
      )}

      {/* TAB 1: TICKETS DESK */}
      {activeTab === 'tickets' && (
        <>
          {/* Filter and Search Controls */}
          <TicketsFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          {/* Main Grid: Table & Selected Details */}
          <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1.4fr 1fr' : '1fr', gap: '20px' }}>
            {/* Tickets List Table */}
            <TicketsTable
              tickets={filteredTickets}
              selectedTicket={selectedTicket}
              onSelectTicket={setSelectedTicket}
              isLoading={isLoading}
              language={language}
            />

            {/* Selected Ticket Action & Inspection Drawer */}
            {selectedTicket && (
              <TicketDetailDrawer
                selectedTicket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
                onOpenForwardModal={() => setShowForwardModal(true)}
                onOpenStatusModal={() => setShowStatusModal(true)}
              />
            )}
          </div>
        </>
      )}

      {/* TAB 2: SYSTEM ADMIN SUPPORT BULLETINS & PLATFORM UPDATES (Only visible to System Admin) */}
      {isSystemAdmin && activeTab === 'bulletins' && (
        <BulletinsTabView
          announcements={announcements}
          onOpenBroadcastStudio={() => navigate('/admin/broadcast-studio')}
          onDeleteAnnouncement={handleDeleteAnnouncement}
        />
      )}

      {/* MODAL 1: Create New Ticket / Inquiry */}
      <NewTicketModal
        isOpen={showNewTicketModal}
        onClose={() => setShowNewTicketModal(false)}
        onSubmit={handleCreateTicket}
        newRecipient={newRecipient}
        setNewRecipient={setNewRecipient}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        newPriority={newPriority}
        setNewPriority={setNewPriority}
        newSubject={newSubject}
        setNewSubject={setNewSubject}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        isSubmitting={isSubmittingNew}
        error={newTicketError}
        success={newTicketSuccess}
      />

      {/* MODAL 2: Forward Ticket */}
      <ForwardTicketModal
        isOpen={showForwardModal}
        onClose={() => setShowForwardModal(false)}
        selectedTicket={selectedTicket}
        assignableUsers={assignableUsers}
        selectedAssignee={selectedAssignee}
        setSelectedAssignee={setSelectedAssignee}
        forwardNotes={forwardNotes}
        setForwardNotes={setForwardNotes}
        onForward={handleForwardTicket}
        isForwarding={isForwarding}
        forwardError={forwardError}
      />

      {/* MODAL 3: Update Status & Reply */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        selectedTicket={selectedTicket}
        targetStatus={targetStatus}
        setTargetStatus={setTargetStatus}
        responseReply={responseReply}
        setResponseReply={setResponseReply}
        statusInternalNotes={statusInternalNotes}
        setStatusInternalNotes={setStatusInternalNotes}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={isUpdatingStatus}
        statusError={statusError}
      />
    </div>
  );
};

export default AdminTicketsPage;
