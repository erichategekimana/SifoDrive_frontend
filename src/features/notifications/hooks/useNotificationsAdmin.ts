import { useState, useEffect, useCallback } from 'react';
import {
  AdminService,
  type SMSLogItem,
  type SMSTemplateItem,
  type GatewayStatusItem,
  type PaginatedResult,
} from '../../../core/services/AdminService';
import { useToast } from '../../../context/ToastContext';
import type { NotificationsTab } from '../types';

export const useNotificationsAdmin = () => {
  const [logsData, setLogsData] = useState<PaginatedResult<SMSLogItem>>({ count: 0, results: [] });
  const [templates, setTemplates] = useState<SMSTemplateItem[]>([]);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatusItem | null>(null);
  const [activeTab, setActiveTab] = useState<NotificationsTab>('LOGS');
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

  return {
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
  };
};
