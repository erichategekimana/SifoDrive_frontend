import { useState, useEffect, useCallback } from 'react';
import {
  AdminService,
  type AuditIntegrityStats,
  type AuditLogItem,
  type PaginatedResult,
} from '../../../core/services/AdminService';
import { useToast } from '../../../context/ToastContext';

export const useAdminAuditData = () => {
  const [logsData, setLogsData] = useState<PaginatedResult<AuditLogItem>>({ count: 0, results: [] });
  const [criticalEvents, setCriticalEvents] = useState<AuditLogItem[]>([]);
  const [integrityStats, setIntegrityStats] = useState<AuditIntegrityStats | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [actionSearch, setActionSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const adminService = AdminService.getInstance();
  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [logsRes, criticalRes, integrityRes] = await Promise.allSettled([
        adminService.getAuditLogs({
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
          action: actionSearch.trim() || undefined,
          page,
        }),
        adminService.getCriticalAuditEvents(),
        adminService.getIntegrityStats(),
      ]);

      if (logsRes.status === 'fulfilled') setLogsData(logsRes.value);
      if (criticalRes.status === 'fulfilled') setCriticalEvents(criticalRes.value);
      if (integrityRes.status === 'fulfilled') setIntegrityStats(integrityRes.value);
    } catch (err) {
      console.error('Failed loading audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [severityFilter, actionSearch, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await adminService.getIntegrityStats();
      setIntegrityStats(res);
      success(`Database SHA-256 block chain verified across ${res.total_records} records.`);
    } catch (err: any) {
      toastError(err?.message || 'Verification could not be completed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return {
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
  };
};
