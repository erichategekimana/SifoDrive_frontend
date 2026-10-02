import React, { useEffect, useState } from 'react';
import {
  Banknote,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import {
  AgentKioskService,
  type AgentCommissionDTO,
  type AgentKioskStatsDTO,
} from '../../core/services/AgentKioskService';
import { Spinner } from '../../components/common/Spinner';

export const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [stats, setStats] = useState<AgentKioskStatsDTO | null>(null);
  const [commissions, setCommissions] = useState<AgentCommissionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kiosk Client Onboard Modal
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [clientPhone, setClientPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Service Facilitation Modal
  const [showFacilitateModal, setShowFacilitateModal] = useState(false);
  const [selectedService, setSelectedService] = useState('BOOKING');
  const [facClientPhone, setFacClientPhone] = useState('');
  const [isFacilitating, setIsFacilitating] = useState(false);

  useEffect(() => {
    const loadAgentData = async () => {
      try {
        const [statsData, commsData] = await Promise.all([
          AgentKioskService.getInstance().getKioskStats(),
          AgentKioskService.getInstance().getCommissions(),
        ]);
        setStats(statsData);
        setCommissions(commsData);
      } catch (err) {
        console.error('Failed to load agent console:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAgentData();
  }, []);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOnboarding(true);
    try {
      await AgentKioskService.getInstance().onboardClient({
        phone_number: clientPhone,
        first_name: firstName,
        last_name: lastName,
        national_id: nationalId,
      });
      alert(t('dashboard.agent.onboardSuccess', { first: firstName, last: lastName }));
      setShowOnboardModal(false);
      setClientPhone('');
      setFirstName('');
      setLastName('');
      setNationalId('');
      // Reload stats
      const updatedStats = await AgentKioskService.getInstance().getKioskStats();
      setStats(updatedStats);
    } catch (err: any) {
      alert(err.message || 'Onboarding failed');
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleFacilitateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFacilitating(true);
    try {
      await AgentKioskService.getInstance().facilitateService({
        client_phone: facClientPhone,
        service_type: selectedService,
      });
      alert(t('dashboard.agent.facilitateSuccess'));
      setShowFacilitateModal(false);
      setFacClientPhone('');
      // Reload
      const updatedComms = await AgentKioskService.getInstance().getCommissions();
      setCommissions(updatedComms);
    } catch (err: any) {
      alert(err.message || 'Facilitation failed');
    } finally {
      setIsFacilitating(false);
    }
  };

  if (isLoading) {
    return <Spinner message={t('dashboard.agent.loadingConsole')} />;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(5, 135, 40, 0.08) 0%, rgba(0, 51, 102, 0.1) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: '#058728',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {stats?.agent_code || 'SIFO-AGT-001'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {stats?.business_name || 'Kiosk / Agency Hub'} • {stats?.district || 'Nyarugenge'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0' }}>
            {user?.fullName} — {t('dashboard.agent.agentTitle')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {t('dashboard.agent.agentSubtitle', {
              onboarded: stats?.total_clients_onboarded || 0,
              days: stats?.days_to_payout || 8,
            })}
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowOnboardModal(true)}
            className="btn btn-primary btn-md"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0055A5', borderColor: '#0055A5' }}
          >
            <UserPlus size={18} />
            <span>{t('dashboard.agent.onboardClientBtn')}</span>
          </button>
          <button
            onClick={() => setShowFacilitateModal(true)}
            className="btn btn-primary btn-md"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#058728', borderColor: '#058728' }}
          >
            <Sparkles size={18} />
            <span>{t('dashboard.agent.facilitateServiceBtn')}</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.agent.accruedCommission')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#058728', marginTop: '4px' }}>
            {(stats?.pending_balance_rwf || 0).toLocaleString()} RWF
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.agent.settledCommission')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {(stats?.total_paid_out_rwf || 0).toLocaleString()} RWF
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.agent.clientsOnboardedCount')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0374b5', marginTop: '4px' }}>
            {stats?.total_clients_onboarded || 0}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.agent.daysToPayoutLabel')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {stats?.days_to_payout || 8} {t('dashboard.agent.daysUnit')}
          </div>
        </div>
      </div>

      {/* Commission Ledger History Table */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Banknote size={20} color="#058728" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {t('dashboard.agent.ledgerTitle')}
            </h3>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.agent.colClient')}</th>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.agent.colService')}</th>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.agent.colCommission')}</th>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.agent.colStatus')}</th>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.agent.colDate')}</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length > 0 ? (
                commissions.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{c.client_full_name || 'Client'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.client_phone_number}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{c.service_type_display}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#058728' }}>
                      +{c.commission_amount_rwf.toLocaleString()} RWF
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: c.status === 'PAID_OUT' ? 'rgba(5, 135, 40, 0.12)' : 'rgba(3, 116, 181, 0.12)',
                          color: c.status === 'PAID_OUT' ? '#058728' : '#0374b5',
                        }}
                      >
                        {c.status === 'PAID_OUT'
                          ? t('dashboard.agent.statusPaidOut')
                          : t('dashboard.agent.statusAccrued')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('dashboard.agent.noCommissions')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Client Modal */}
      {showOnboardModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 16px 0' }}>
              {t('dashboard.agent.onboardModalTitle')}
            </h3>

            <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  {t('dashboard.agent.clientPhoneLabel')}
                </label>
                <input
                  type="tel"
                  placeholder="+250788..."
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    {t('dashboard.agent.firstNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                    {t('dashboard.agent.lastNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  {t('dashboard.agent.nationalIdLabel')}
                </label>
                <input
                  type="text"
                  placeholder="1199..."
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="btn btn-secondary btn-md"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isOnboarding}
                  className="btn btn-primary btn-md"
                  style={{ background: '#0055A5', borderColor: '#0055A5' }}
                >
                  {isOnboarding ? t('dashboard.agent.registering') : t('dashboard.agent.enrollClient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Facilitate Service Modal */}
      {showFacilitateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 16px 0' }}>
              {t('dashboard.agent.facilitateModalTitle')}
            </h3>

            <form onSubmit={handleFacilitateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  {t('dashboard.agent.selectServiceLabel')}
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="BOOKING">{t('dashboard.agent.serviceBooking')}</option>
                  <option value="SUBSCRIPTION">{t('dashboard.agent.serviceSubscription')}</option>
                  <option value="EXAM_PURCHASE">{t('dashboard.agent.serviceExamPurchase')}</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  {t('dashboard.agent.clientPhoneLabel')}
                </label>
                <input
                  type="tel"
                  placeholder="+250788..."
                  value={facClientPhone}
                  onChange={(e) => setFacClientPhone(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowFacilitateModal(false)}
                  className="btn btn-secondary btn-md"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isFacilitating}
                  className="btn btn-primary btn-md"
                  style={{ background: '#058728', borderColor: '#058728' }}
                >
                  {isFacilitating ? t('dashboard.agent.processing') : t('dashboard.agent.confirmFacilitate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
