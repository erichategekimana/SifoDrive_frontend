import React from 'react';
import {
  useAdminAuditData,
  AuditHeader,
  AuditIntegrityHeader,
  CriticalEventsWidget,
  AuditFiltersBar,
  AuditLogsTable,
} from '../../features/audit';

export const AdminAuditPage: React.FC = () => {
  const {
    logsData,
    criticalEvents,
    integrityStats,
    isVerifying,
    isLoading,
    severityFilter,
    setSeverityFilter,
    actionSearch,
    setActionSearch,
    page,
    setPage,
    loadData,
    handleVerifyIntegrity,
  } = useAdminAuditData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Actions */}
      <AuditHeader
        isLoading={isLoading}
        isVerifying={isVerifying}
        onRefresh={loadData}
        onVerifyIntegrity={handleVerifyIntegrity}
      />

      {/* Integrity Card */}
      <AuditIntegrityHeader
        integrityStats={integrityStats}
        totalLogsCount={logsData.count}
      />

      {/* Critical Events Strip (If Any) */}
      <CriticalEventsWidget criticalEvents={criticalEvents} />

      {/* Filter Bar */}
      <AuditFiltersBar
        actionSearch={actionSearch}
        setActionSearch={setActionSearch}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        onSearchEnter={loadData}
        onSeverityChange={(val) => {
          setSeverityFilter(val);
          setPage(1);
        }}
      />

      {/* Audit Logs Table */}
      <AuditLogsTable
        logsData={logsData}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
};

export default AdminAuditPage;
