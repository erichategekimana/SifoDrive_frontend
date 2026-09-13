import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  RefreshCw,
  Phone,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Eye,
  X,
  Server,
  FileText,
  Radio,
  ArrowRight,
} from 'lucide-react';
import {
  AdminService,
  type SMSLogItem,
  type SMSTemplateItem,
  type GatewayStatusItem,
  type PaginatedResult,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { BroadcastModal } from '../../components/admin/BroadcastModal';
import { useToast } from '../../context/ToastContext';

// Preset SMS Templates for quick insertion in Single SMS
const PRESET_SNIPPETS = [
  {
    label: 'OTP Verification (Rwanda)',
    type: 'OTP',
    text: '[Sifo Drive] Kode yawe yo kwemeza ni: 482910. Imara iminota 10. Ntuyisangize undi muntu.',
  },
  {
    label: 'Live Class Reminder',
    type: 'LIVE_CLASS_REMINDER',
    text: '[Sifo Drive] Isomo ry amategeko y umuhanda ritangira mu minota 15! Kanda hano winjire: https://meet.google.com/abc-defg-hij',
  },
  {
    label: 'Irembo Booking Confirmed',
    type: 'BOOKING_CONFIRMED',
    text: '[Sifo Drive] Umwanya w ikizamini cyawe wemejwe! Itariki: 24/09/2026, Ikigo: Kigali Arena. Witwaze indangamuntu yawe.',
  },
  {
    label: 'Exam Result Notice',
    type: 'EXAM_RESULT',
    text: '[Sifo Drive] Amanota y ikizamini cyo kwimenyereza arabonetse: 18/20 (Watsinze). Reba raporo muri porogaramu.',
  },
];

export const AdminNotificationsPage: React.FC = () => {
  const [logsData, setLogsData] = useState<PaginatedResult<SMSLogItem>>({ count: 0, results: [] });
  const [templates, setTemplates] = useState<SMSTemplateItem[]>([]);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatusItem | null>(null);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'SINGLE_SMS' | 'TEMPLATES' | 'GATEWAY'>('LOGS');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPingingGateway, setIsPingingGateway] = useState<boolean>(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);

  // Filter & Search state for logs
  const [phoneFilter, setPhoneFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Single SMS Form state
  const [singlePhone, setSinglePhone] = useState<string>('');
  const [singleMessage, setSingleMessage] = useState<string>('');
  const [singleType, setSingleType] = useState<string>('GENERAL');
  const [isSendingSingle, setIsSendingSingle] = useState<boolean>(false);
  const [lastSingleResult, setLastSingleResult] = useState<any | null>(null);

  // Inspection modal state
  const [inspectLog, setInspectLog] = useState<SMSLogItem | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [logsRes, templatesRes, gatewayRes] = await Promise.allSettled([
        adminService.getSmsLogs({
          page: 1,
          phone: phoneFilter.trim() || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
        adminService.getSmsTemplates(),
        adminService.getGatewayStatus(),
      ]);

      if (logsRes.status === 'fulfilled') {
        setLogsData(logsRes.value);
      }
      if (templatesRes.status === 'fulfilled') {
        setTemplates(templatesRes.value);
      }
      if (gatewayRes.status === 'fulfilled') {
        setGatewayStatus(gatewayRes.value);
      }
    } catch (err) {
      console.error('Failed loading SMS communication data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [phoneFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePingGateway = async () => {
    setIsPingingGateway(true);
    try {
      const res = await adminService.getGatewayStatus();
      setGatewayStatus(res);
      if (res.connected) {
        success(`Gateway ping success! ${res.message || 'Pindo API online'}`);
      } else {
        warning(`Gateway error: ${res.error || 'Connection failed'}`);
      }
    } catch (err: any) {
      toastError(err?.message || 'Could not ping gateway');
    } finally {
      setIsPingingGateway(false);
    }
  };

  const handleSendSingleSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singlePhone.trim() || !singleMessage.trim()) {
      warning('Recipient phone and message body are required.');
      return;
    }

    setIsSendingSingle(true);
    setLastSingleResult(null);

    try {
      const res = await adminService.sendTestSms(singlePhone.trim(), singleMessage.trim(), singleType);
      setLastSingleResult(res);
      if (res.success) {
        success(`SMS successfully dispatched to ${singlePhone} via Pindo!`);
        setSingleMessage('');
        loadData();
      } else {
        toastError(res.error_message || 'Pindo gateway rejected message.');
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to dispatch SMS.');
    } finally {
      setIsSendingSingle(false);
    }
  };

  const handleRetry = async (logItem: SMSLogItem) => {
    setRetryingId(logItem.id);
    try {
      await adminService.retrySms(logItem.id);
      success(`Retry dispatched for ${logItem.recipient_phone || logItem.recipient}`);
      loadData();
      if (inspectLog && inspectLog.id === logItem.id) {
        setInspectLog(null);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to retry SMS transmission.');
    } finally {
      setRetryingId(null);
    }
  };

  const handleUseTemplate = (tpl: SMSTemplateItem) => {
    const text = tpl.body_template || tpl.body || '';
    setSingleMessage(text);
    if (tpl.notification_type) {
      setSingleType(tpl.notification_type);
    }
    setActiveTab('SINGLE_SMS');
    success(`Loaded template "${tpl.name || tpl.code || tpl.template_code}" into Single SMS dispatcher.`);
  };

  const charCount = singleMessage.length;
  const segments = Math.ceil(charCount / 160) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              SMS Communication
            </h1>
            {gatewayStatus?.connected ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--success)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--success)',
                  }}
                />
                Pindo Gateway Live
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--danger)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--danger)',
                  }}
                />
                Gateway Checking
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Rwanda Pindo SMS gateway management, delivery receipts, single SMS dispatch, and mass broadcasts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Send size={15} />
            <span>Broadcast SMS</span>
          </button>
        </div>
      </div>

      {/* Gateway Quick Status Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          border: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={16} color="var(--primary-light)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Provider:</span>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Pindo Rwanda</strong>
          </div>
          <div style={{ height: '16px', width: '1px', background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={15} color="var(--success)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Endpoint:</span>
            <code
              style={{
                fontSize: '0.78rem',
                color: 'var(--primary-light)',
                background: 'var(--bg-surface-elevated)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              https://api.pindo.io/v1/sms/
            </code>
          </div>
          <div style={{ height: '16px', width: '1px', background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sender ID:</span>
            <Badge variant="neutral" style={{ fontFamily: 'monospace' }}>
              {gatewayStatus?.sender_id || 'PindoTest'}
            </Badge>
          </div>
        </div>

        <button
          onClick={handlePingGateway}
          disabled={isPingingGateway}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
        >
          <RotateCcw size={13} className={isPingingGateway ? 'spin' : ''} />
          <span>{isPingingGateway ? 'Pinging...' : 'Ping Gateway'}</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('LOGS')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'LOGS' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'LOGS' ? 'var(--primary-light)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Delivery Audit Logs ({logsData.count})
        </button>
        <button
          onClick={() => setActiveTab('SINGLE_SMS')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'SINGLE_SMS' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'SINGLE_SMS' ? 'var(--primary-light)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Send Single SMS
        </button>
        <button
          onClick={() => setActiveTab('TEMPLATES')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'TEMPLATES' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'TEMPLATES' ? 'var(--primary-light)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          System Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('GATEWAY')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'GATEWAY' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'GATEWAY' ? 'var(--primary-light)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Gateway Diagnostics
        </button>
      </div>

      {/* Tab 1: Delivery Audit Logs */}
      {activeTab === 'LOGS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Filters */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
                <input
                  type="text"
                  placeholder="Filter by phone number (e.g. +250...)"
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                />
                <Phone
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="DELIVERED">Delivered</option>
                <option value="SENT">Sent</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Showing {logsData.results.length} of {logsData.count} logs
            </span>
          </div>

          {/* Logs Table */}
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <Spinner message="Loading SMS delivery logs from backend..." />
              </div>
            ) : logsData.results.length === 0 ? (
              <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  No SMS delivery records found
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                  Try adjusting filters or send a test SMS from the "Send Single SMS" tab.
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Recipient</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Message Preview</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Sender ID</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Gateway Status</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsData.results.map((log) => {
                      const displayPhone = log.recipient_phone || log.recipient;
                      return (
                        <tr
                          key={log.id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Phone size={13} color="var(--primary-light)" />
                              <span style={{ fontFamily: 'monospace' }}>{displayPhone}</span>
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                            <div
                              onClick={() => setInspectLog(log)}
                              title="Click to view full message"
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                              }}
                            >
                              {log.message_body}
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            <Badge variant="neutral" style={{ fontSize: '0.72rem' }}>
                              {log.message_type || 'GENERAL'}
                            </Badge>
                          </td>

                          <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                            {log.sender_id || 'PindoTest'}
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <Badge
                              variant={
                                log.status === 'DELIVERED' || log.status === 'DELIVRD'
                                  ? 'success'
                                  : log.status === 'SENT'
                                  ? 'info'
                                  : log.status === 'FAILED'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {log.status}
                            </Badge>
                          </td>

                          <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {new Date(log.created_at).toLocaleString('en-RW', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>

                          <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => setInspectLog(log)}
                                className="btn btn-secondary btn-xs"
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Eye size={12} />
                                <span>Inspect</span>
                              </button>
                              {log.status === 'FAILED' && (
                                <button
                                  onClick={() => handleRetry(log)}
                                  disabled={retryingId === log.id}
                                  className="btn btn-secondary btn-xs"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: 'var(--danger)',
                                    borderColor: 'rgba(239, 68, 68, 0.3)',
                                  }}
                                >
                                  <RotateCcw size={12} className={retryingId === log.id ? 'spin' : ''} />
                                  <span>Retry</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Send Single SMS */}
      {activeTab === 'SINGLE_SMS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 580px) 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Dispatch Form */}
          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-2xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Dispatch Single SMS
              </h3>
            </div>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Directly dispatches a single SMS through the Pindo gateway endpoint:
              <br />
              <code style={{ fontSize: '0.78rem', color: 'var(--primary-light)' }}>https://api.pindo.io/v1/sms/</code>
            </p>

            <form onSubmit={handleSendSingleSMS} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Recipient Phone Number (Rwanda) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    placeholder="+250 788 123 456"
                    value={singlePhone}
                    onChange={(e) => setSinglePhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                      fontSize: '0.92rem',
                    }}
                  />
                  <Phone
                    size={15}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supports MTN Rwanda, Airtel Rwanda (+250 78/79/72/73...)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Message Type Classification
                </label>
                <select
                  value={singleType}
                  onChange={(e) => setSingleType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                >
                  <option value="GENERAL">General Operational Notice</option>
                  <option value="OTP">OTP Verification Code</option>
                  <option value="LIVE_CLASS_REMINDER">Live Class Reminder</option>
                  <option value="BOOKING_REMINDER">Exam Booking Reminder</option>
                  <option value="BOOKING_CONFIRMED">Exam Slot Confirmed</option>
                  <option value="EXAM_RESULT">Practice Exam Result</option>
                  <option value="PAYMENT_SUCCESS">Payment Confirmation</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Message Body *
                  </label>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: charCount > 160 ? 'var(--warning)' : 'var(--text-muted)',
                    }}
                  >
                    {charCount} / 160 chars ({segments} SMS segment{segments > 1 ? 's' : ''})
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Type Rwanda SMS message body here..."
                  value={singleMessage}
                  onChange={(e) => setSingleMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Sender: <strong style={{ color: 'var(--text-secondary)' }}>{gatewayStatus?.sender_id || 'PindoTest'}</strong>
                </span>
                <button
                  type="submit"
                  disabled={isSendingSingle || !singlePhone.trim() || !singleMessage.trim()}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
                >
                  <Send size={15} />
                  <span>{isSendingSingle ? 'Dispatching...' : 'Dispatch Single SMS'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Preset Snippets & Live Result Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Live Result receipt */}
            {lastSingleResult && (
              <div
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-xl)',
                  border: lastSingleResult.success
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : '1px solid rgba(239, 68, 68, 0.4)',
                  background: lastSingleResult.success
                    ? 'rgba(16, 185, 129, 0.05)'
                    : 'rgba(239, 68, 68, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {lastSingleResult.success ? (
                    <CheckCircle2 size={18} color="var(--success)" />
                  ) : (
                    <AlertCircle size={18} color="var(--danger)" />
                  )}
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {lastSingleResult.success ? 'SMS Dispatched Successfully' : 'SMS Transmission Rejected'}
                  </strong>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {lastSingleResult.message_id && (
                    <div>
                      Pindo Message ID: <code style={{ color: 'var(--primary-light)' }}>{lastSingleResult.message_id}</code>
                    </div>
                  )}
                  {lastSingleResult.status && (
                    <div>
                      Gateway Status: <Badge variant={lastSingleResult.success ? 'success' : 'danger'}>{lastSingleResult.status}</Badge>
                    </div>
                  )}
                  {lastSingleResult.error_message && (
                    <div style={{ color: 'var(--danger)', marginTop: '4px' }}>
                      Error: {lastSingleResult.error_message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Templates Picker */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Quick Preset Templates
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                Click any snippet to automatically populate the message box with Rwanda standard text:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PRESET_SNIPPETS.map((snippet, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSingleMessage(snippet.text);
                      setSingleType(snippet.type);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {snippet.label}
                      </span>
                      <Badge variant="neutral" style={{ fontSize: '0.68rem' }}>{snippet.type}</Badge>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {snippet.text}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System Templates */}
      {activeTab === 'TEMPLATES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              System templates registered across notifications. Click "Use in Single SMS" to populate the dispatcher.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {templates.length === 0 ? (
              <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                No templates configured in the system.
              </div>
            ) : (
              templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {tpl.name || tpl.template_code || tpl.code}
                      </strong>
                      <Badge variant="neutral" style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                        {tpl.language ? tpl.language.toUpperCase() : 'RW'}
                      </Badge>
                    </div>

                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-surface-elevated)',
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        lineHeight: 1.5,
                        fontFamily: 'monospace',
                      }}
                    >
                      {tpl.body_template || tpl.body}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tpl.notification_type || tpl.channel || 'SMS'}
                    </span>
                    <button
                      onClick={() => handleUseTemplate(tpl)}
                      className="btn btn-secondary btn-xs"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>Use in Single SMS</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Gateway Diagnostics */}
      {activeTab === 'GATEWAY' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 600px) 1fr', gap: '24px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-2xl)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Pindo SMS Gateway Configuration
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Gateway Provider:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Pindo (api.pindo.io)</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Absolute Base URL:</span>
                <code style={{ color: 'var(--primary-light)' }}>https://api.pindo.io</code>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Single SMS Endpoint:</span>
                <code style={{ color: 'var(--primary-light)' }}>https://api.pindo.io/v1/sms/</code>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Sender ID:</span>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {gatewayStatus?.sender_id || 'PindoTest'}
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Authorization Header:</span>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>Bearer (Configured & Live)</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Connection Status:</span>
                <Badge variant={gatewayStatus?.connected ? 'success' : 'danger'}>
                  {gatewayStatus?.connected ? 'ONLINE' : 'OFFLINE'}
                </Badge>
              </div>

              <button
                onClick={handlePingGateway}
                disabled={isPingingGateway}
                className="btn btn-primary"
                style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <RotateCcw size={15} className={isPingingGateway ? 'spin' : ''} />
                <span>{isPingingGateway ? 'Verifying Gateway...' : 'Execute Live Gateway Health Check'}</span>
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-2xl)' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Diagnostic Response
            </h4>
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}
            >
              {JSON.stringify(gatewayStatus || { message: 'No diagnostic run yet' }, null, 2)}
            </div>
          </div>
        </div>
      )}

      {/* Inspect Log Detail Modal */}
      {inspectLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            padding: '16px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '600px',
              borderRadius: 'var(--radius-2xl)',
              padding: '24px',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Eye size={16} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  SMS Transmission Receipt
                </h3>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Recipient Phone:</span>
                <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                  {inspectLog.recipient_phone || inspectLog.recipient}
                </strong>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>Gateway Status:</span>
                <Badge
                  variant={
                    inspectLog.status === 'DELIVERED' || inspectLog.status === 'DELIVRD'
                      ? 'success'
                      : inspectLog.status === 'SENT'
                      ? 'info'
                      : inspectLog.status === 'FAILED'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {inspectLog.status}
                </Badge>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Full Message Body:
                </label>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.5,
                  }}
                >
                  {inspectLog.message_body}
                </div>
              </div>

              {inspectLog.provider_message_id && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Pindo Message ID:</span>
                  <code style={{ color: 'var(--primary-light)' }}>{inspectLog.provider_message_id}</code>
                </div>
              )}

              {inspectLog.error_message && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--danger)',
                  }}
                >
                  <strong>Gateway Rejection:</strong> {inspectLog.error_message}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Dispatched:{' '}
                  {new Date(inspectLog.created_at).toLocaleString('en-RW', {
                    dateStyle: 'medium',
                    timeStyle: 'medium',
                  })}
                </span>

                {inspectLog.status === 'FAILED' && (
                  <button
                    onClick={() => handleRetry(inspectLog)}
                    disabled={retryingId === inspectLog.id}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={13} className={retryingId === inspectLog.id ? 'spin' : ''} />
                    <span>Retry Send</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast SMS Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
};
