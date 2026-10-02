import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Shield,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { SupportTicketService, type HelpTicketDTO, type SupportAnnouncementDTO } from '../../core/services/SupportTicketService';
import { useTranslation } from '../../context/I18nContext';

export const HelpView: React.FC = () => {
  const supportService = SupportTicketService.getInstance();
  const { t, language } = useTranslation();

  const [tickets, setTickets] = useState<HelpTicketDTO[]>([]);
  const [announcements, setAnnouncements] = useState<SupportAnnouncementDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<HelpTicketDTO | null>(null);

  // Form state
  const [recipientRole, setRecipientRole] = useState<'TUTOR' | 'TECH_SUPPORT'>('TUTOR');
  const [category, setCategory] = useState<'CONTENT_INQUIRY' | 'TECHNICAL_ISSUE' | 'EXAM_DISPUTE' | 'ACCOUNT_BILLING' | 'OTHER'>('CONTENT_INQUIRY');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tList, aList] = await Promise.all([
        supportService.getTickets(),
        supportService.getAnnouncements(),
      ]);
      setTickets(tList);
      setAnnouncements(aList);
    } catch (e) {
      console.error('Error fetching support data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setFormError(t('canvasHelp.formErrorRequired'));
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
      setFormSuccess(true);
      setSubject('');
      setMessage('');
      setFormError(null);
      setTimeout(() => {
        setFormSuccess(false);
        setShowNewTicketForm(false);
      }, 2500);
    } catch (err: any) {
      setFormError(err.message || t('canvasHelp.formErrorGeneric'));
    }
  };

  const getStatusBadge = (status: HelpTicketDTO['status']) => {
    switch (status) {
      case 'OPEN':
        return <span className="canvas-badge canvas-badge-open">{t('canvasHelp.statusOpen')}</span>;
      case 'IN_PROGRESS':
        return <span className="canvas-badge canvas-badge-progress">{t('canvasHelp.statusInProgress')}</span>;
      case 'RESOLVED':
        return <span className="canvas-badge canvas-badge-resolved">{t('canvasHelp.statusResolved')}</span>;
      default:
        return <span className="canvas-badge canvas-badge-closed">{t('canvasHelp.statusClosed')}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0055A5', margin: 0 }}>
            {t('canvasHelp.title')}
          </h1>
          <p style={{ color: '#666666', fontSize: '0.9rem', marginTop: '4px' }}>
            {t('canvasHelp.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          className="canvas-btn canvas-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>{showNewTicketForm ? t('canvasHelp.closeForm') : t('canvasHelp.newTicket')}</span>
        </button>
      </div>

      {/* New Ticket Form (Expandable) */}
      {showNewTicketForm && (
        <div className="canvas-card" style={{ marginBottom: '24px', borderLeft: '4px solid #0055A5 !important' }}>
          <div className="canvas-card-header">
            <h2 style={{ fontSize: '1.05rem', margin: 0, color: '#0055A5' }}>
              {t('canvasHelp.submitHeader')}
            </h2>
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
              <span>{t('canvasHelp.successMsg')}</span>
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
                  {t('canvasHelp.recipient')}
                </label>
                <select
                  value={recipientRole}
                  onChange={(e) => setRecipientRole(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D0D5DD',
                    borderRadius: '2px',
                    fontSize: '0.85rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="TUTOR">{t('canvasHelp.tutorRecipient')}</option>
                  <option value="TECH_SUPPORT">{t('canvasHelp.techRecipient')}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2D3B45', marginBottom: '6px' }}>
                  {t('canvasHelp.category')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D0D5DD',
                    borderRadius: '2px',
                    fontSize: '0.85rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="CONTENT_INQUIRY">{t('canvasHelp.catContent')}</option>
                  <option value="TECHNICAL_ISSUE">{t('canvasHelp.catTech')}</option>
                  <option value="EXAM_DISPUTE">{t('canvasHelp.catExam')}</option>
                  <option value="ACCOUNT_BILLING">{t('canvasHelp.catBilling')}</option>
                  <option value="OTHER">{t('canvasHelp.catOther')}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2D3B45', marginBottom: '6px' }}>
                  {t('canvasHelp.priority')}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #D0D5DD',
                    borderRadius: '2px',
                    fontSize: '0.85rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="LOW">{t('canvasHelp.prioLow')}</option>
                  <option value="MEDIUM">{t('canvasHelp.prioMedium')}</option>
                  <option value="HIGH">{t('canvasHelp.prioHigh')}</option>
                  <option value="URGENT">{t('canvasHelp.prioUrgent')}</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2D3B45', marginBottom: '6px' }}>
                {t('canvasHelp.subject')}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('canvasHelp.subjectPlaceholder')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D0D5DD',
                  borderRadius: '2px',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2D3B45', marginBottom: '6px' }}>
                {t('canvasHelp.details')}
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('canvasHelp.detailsPlaceholder')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D0D5DD',
                  borderRadius: '2px',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowNewTicketForm(false)}
                className="canvas-btn"
              >
                {t('canvasHelp.cancel')}
              </button>
              <button type="submit" className="canvas-btn canvas-btn-primary">
                <Send size={14} />
                <span>{t('canvasHelp.submit')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Workspace: 2-Column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: My Tickets Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="canvas-card" style={{ padding: 0 }}>
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #EAEAEA',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0055A5', margin: 0 }}>
                {t('canvasHelp.myTickets')}
              </h2>
              <button
                onClick={loadData}
                className="canvas-btn"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                title={t('canvasHelp.refresh')}
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {isLoading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#666666', fontSize: '0.85rem' }}>
                {t('canvasHelp.loading')}
              </div>
            ) : tickets.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#888888', fontSize: '0.85rem' }}>
                {t('canvasHelp.noTickets')}
              </div>
            ) : (
              <table className="canvas-table">
                <thead>
                  <tr>
                    <th>{t('canvasHelp.thSubject')}</th>
                    <th>{t('canvasHelp.thRecipient')}</th>
                    <th>{t('canvasHelp.thStatus')}</th>
                    <th>{t('canvasHelp.thDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((tkt) => {
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
                          <div style={{ fontWeight: 600, color: '#0055A5' }}>{tkt.subject}</div>
                          <div style={{ fontSize: '0.72rem', color: '#777777', marginTop: '2px' }}>
                            {tkt.category} • Priority: {tkt.priority}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            {tkt.recipient_role === 'TUTOR' ? t('canvasHelp.tutorRecipient') : t('canvasHelp.techRecipient')}
                          </span>
                        </td>
                        <td>{getStatusBadge(tkt.status)}</td>
                        <td style={{ fontSize: '0.75rem', color: '#888888' }}>
                          {new Date(tkt.created_at).toLocaleDateString(language === 'rw' ? 'rw-RW' : 'en-US')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Selected Ticket Response Details */}
          {selectedTicket && (
            <div className="canvas-card" style={{ borderLeft: '4px solid #0055A5 !important' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0055A5', letterSpacing: '0.04em' }}>
                    TICKET ID: {selectedTicket.id} • {selectedTicket.recipient_role}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2D3B45', margin: '4px 0' }}>
                    {selectedTicket.subject}
                  </h3>
                </div>
                {getStatusBadge(selectedTicket.status)}
              </div>

              <div style={{ padding: '12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '2px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666666', display: 'block', marginBottom: '4px' }}>
                  {t('canvasHelp.yourRequest')}
                </span>
                <p style={{ fontSize: '0.85rem', color: '#333333', lineHeight: 1.5, margin: 0 }}>
                  {selectedTicket.message}
                </p>
              </div>

              {selectedTicket.response ? (
                <div style={{ padding: '12px', backgroundColor: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <CheckCircle2 size={16} color="#058728" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#22543D' }}>
                      {t('canvasHelp.responseFrom', { name: selectedTicket.assigned_to_name || 'Staff' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#2F855A', lineHeight: 1.5, margin: 0 }}>
                    {selectedTicket.response}
                  </p>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: '#888888', fontStyle: 'italic' }}>
                  {t('canvasHelp.pendingReview')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Training Admin & Tech Support Bulletins */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="canvas-card" style={{ padding: 0 }}>
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #EAEAEA',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Shield size={16} color="#0055A5" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0055A5' }}>
                {t('canvasHelp.systemBulletins')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #F0F0F0',
                    backgroundColor: ann.is_pinned ? '#FFFDF0' : '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2D3B45', margin: 0, lineHeight: 1.3 }}>
                      {ann.title}
                    </h4>
                    {ann.is_pinned && (
                      <span className="canvas-badge canvas-badge-progress" style={{ fontSize: '0.62rem' }}>
                        {t('canvasHelp.pinnedBadge')}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#777777', marginBottom: '6px' }}>
                    {t('canvasHelp.postedBy', { author: ann.author, date: ann.date })}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#555555', lineHeight: 1.4, margin: 0 }}>
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
