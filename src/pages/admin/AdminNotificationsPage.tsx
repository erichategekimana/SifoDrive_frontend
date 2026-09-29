import React from 'react';
import { BroadcastModal } from '../../components/admin/BroadcastModal';
import {
  useNotificationsAdmin,
  NotificationsHeader,
  GatewayBanner,
  SMSLogsSection,
  SingleSMSDispatchSection,
  SMSTemplatesSection,
  SMSGatewayStatusSection,
  SMSLogDetailModal,
} from '../../features/notifications';

export const AdminNotificationsPage: React.FC = () => {
  const {
    logsData,
    templates,
    gatewayStatus,
    activeTab,
    setActiveTab,
    isLoading,
    isPingingGateway,
    isBroadcastOpen,
    setIsBroadcastOpen,
    phoneFilter,
    setPhoneFilter,
    statusFilter,
    setStatusFilter,
    singlePhone,
    setSinglePhone,
    singleMessage,
    setSingleMessage,
    singleType,
    setSingleType,
    isSendingSingle,
    lastSingleResult,
    inspectLog,
    setInspectLog,
    retryingId,
    charCount,
    segments,
    loadData,
    handlePingGateway,
    handleSendSingleSMS,
    handleRetry,
    handleUseTemplate,
  } = useNotificationsAdmin();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Actions Bar */}
      <NotificationsHeader
        gatewayStatus={gatewayStatus}
        isLoading={isLoading}
        onRefresh={loadData}
        onOpenBroadcast={() => setIsBroadcastOpen(true)}
      />

      {/* Gateway Quick Status Banner */}
      <GatewayBanner
        gatewayStatus={gatewayStatus}
        isPingingGateway={isPingingGateway}
        onPingGateway={handlePingGateway}
      />

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
        <SMSLogsSection
          logsData={logsData}
          isLoading={isLoading}
          phoneFilter={phoneFilter}
          setPhoneFilter={setPhoneFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          retryingId={retryingId}
          onInspect={setInspectLog}
          onRetry={handleRetry}
        />
      )}

      {/* Tab 2: Send Single SMS */}
      {activeTab === 'SINGLE_SMS' && (
        <SingleSMSDispatchSection
          singlePhone={singlePhone}
          setSinglePhone={setSinglePhone}
          singleMessage={singleMessage}
          setSingleMessage={setSingleMessage}
          singleType={singleType}
          setSingleType={setSingleType}
          isSendingSingle={isSendingSingle}
          senderId={gatewayStatus?.sender_id || 'PindoTest'}
          lastSingleResult={lastSingleResult}
          charCount={charCount}
          segments={segments}
          onSubmit={handleSendSingleSMS}
        />
      )}

      {/* Tab 3: System Templates */}
      {activeTab === 'TEMPLATES' && (
        <SMSTemplatesSection
          templates={templates}
          onUseTemplate={handleUseTemplate}
        />
      )}

      {/* Tab 4: Gateway Diagnostics */}
      {activeTab === 'GATEWAY' && (
        <SMSGatewayStatusSection
          gatewayStatus={gatewayStatus}
          isPingingGateway={isPingingGateway}
          onPingGateway={handlePingGateway}
        />
      )}

      {/* Inspect Log Detail Modal */}
      <SMSLogDetailModal
        inspectLog={inspectLog}
        onClose={() => setInspectLog(null)}
        onRetry={handleRetry}
        retryingId={retryingId}
      />

      {/* Broadcast SMS Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
};

export default AdminNotificationsPage;
