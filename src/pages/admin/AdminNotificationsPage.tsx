import React, { useState, useEffect } from 'react';
import {
  Send,
  RefreshCw,
  Phone,
} from 'lucide-react';
import {
  AdminService,
  type SMSLogItem,
  type SMSTemplateItem,
  type PaginatedResult,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { BroadcastModal } from '../../components/admin/BroadcastModal';
import { useToast } from '../../context/ToastContext';

export const AdminNotificationsPage: React.FC = () => {
  const [logsData, setLogsData] = useState<PaginatedResult<SMSLogItem>>({ count: 0, results: [] });
  const [templates, setTemplates] = useState<SMSTemplateItem[]>([]);
  const [activeTab, setActiveTab] = useState<'LOGS' | 'TEMPLATES' | 'TEST'>('LOGS');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);

  // Test SMS State
  const [testPhone, setTestPhone] = useState<string>('');
  const [testMessage, setTestMessage] = useState<string>('');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [logsRes, templatesRes] = await Promise.allSettled([
        adminService.getSmsLogs({ page: 1 }),
        adminService.getSmsTemplates(),
      ]);

      if (logsRes.status === 'fulfilled') setLogsData(logsRes.value);
      if (templatesRes.status === 'fulfilled') setTemplates(templatesRes.value);
    } catch (err) {
      console.error('Failed loading SMS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testMessage.trim()) {
      warning('Phone number and message are required.');
      return;
    }

    setIsSendingTest(true);
    try {
      await adminService.sendTestSms(testPhone.trim(), testMessage.trim());
      success(`Dispatched test message to ${testPhone}.`);
      setTestMessage('');
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Could not send test SMS.');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            SMS Communications Hub
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Dispatch SMS broadcasts to student cohorts, view gateway delivery receipts, and configure templates.
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

      {/* Tabs */}
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
          onClick={() => setActiveTab('TEST')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'TEST' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'TEST' ? 'var(--primary-light)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Test Gateway Dispatch
        </button>
      </div>

      {activeTab === 'LOGS' ? (
        /* Delivery Logs Table */
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <Spinner message="Loading SMS delivery logs from backend..." />
            </div>
          ) : logsData.results.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No SMS log records found in the backend database.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                    <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Recipient</th>
                    <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Message Preview</th>
                    <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Gateway Status</th>
                    <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logsData.results.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} color="var(--primary-light)" />
                          <span>{log.recipient}</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.message_body}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {log.message_type || 'TRANSACTIONAL'}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <Badge
                          variant={
                            log.status === 'DELIVERED'
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === 'TEMPLATES' ? (
        /* Templates List */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {templates.length === 0 ? (
            <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              No notification templates registered in `/api/v1/notifications/admin/templates/`.
            </div>
          ) : (
            templates.map((tpl) => (
              <div key={tpl.id} className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>{tpl.name}</span>
                  <Badge variant="neutral" style={{ fontFamily: 'monospace' }}>{tpl.code}</Badge>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', lineHeight: 1.5 }}>
                  {tpl.body}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Test Dispatch Tab */
        <div className="glass-panel" style={{ maxWidth: '560px', padding: '28px', borderRadius: 'var(--radius-2xl)' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Send Test SMS
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Directly test Rwanda MTN / Airtel SMS delivery via Africa's Talking / Twilio gateway.
          </p>

          <form onSubmit={handleSendTest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Recipient Phone Number (e.g. +250788123456) *
              </label>
              <input
                type="tel"
                required
                placeholder="+250788123456"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Test Message Content *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Muraho! Ubu ni ubutumwa bw'igerageza buturutse muri Sifo Drive..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSendingTest}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Send size={16} />
              <span>{isSendingTest ? 'Sending...' : 'Send Test SMS'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
};
