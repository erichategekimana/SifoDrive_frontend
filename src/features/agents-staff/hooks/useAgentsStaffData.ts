import { useState, useEffect, useMemo } from 'react';
import {
  AdminService,
  type StaffUserItem,
  type ServiceCommissionConfigItem,
  type AgentCommissionItem,
  type AuditLogItem,
} from '../../../core/services/AdminService';
import { useToast } from '../../../context/ToastContext';
import type { StaffRoleFilter } from '../types';

export const useAgentsStaffData = () => {
  const [activeTab, setActiveTab] = useState<'staffs' | 'agents' | 'rates'>('staffs');
  const [agentSubTab, setAgentSubTab] = useState<'directory' | 'ledger'>('directory');
  const [staffRoleFilter, setStaffRoleFilter] = useState<StaffRoleFilter>('ALL');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<StaffUserItem | null>(null);

  // Agent Individual Ledger Modal State
  const [agentLedgerModal, setAgentLedgerModal] = useState<StaffUserItem | null>(null);
  const [agentModalSearchQuery, setAgentModalSearchQuery] = useState<string>('');

  // Staff Audit State
  const [auditingStaff, setAuditingStaff] = useState<StaffUserItem | null>(null);
  const [staffAuditLogs, setStaffAuditLogs] = useState<AuditLogItem[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>('ALL');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Data states
  const [staffList, setStaffList] = useState<StaffUserItem[]>([]);
  const [commissionRates, setCommissionRates] = useState<ServiceCommissionConfigItem[]>([]);
  const [commissionsLedger, setCommissionsLedger] = useState<AgentCommissionItem[]>([]);

  // Modals state
  const [isCreateStaffModalOpen, setIsCreateStaffModalOpen] = useState<boolean>(false);
  const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState<boolean>(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState<boolean>(false);

  // Selected staff for edit/payout
  const [selectedStaff, setSelectedStaff] = useState<StaffUserItem | null>(null);

  // Create Form State
  const [newPhone, setNewPhone] = useState<string>('');
  const [newFirstName, setNewFirstName] = useState<string>('');
  const [newLastName, setNewLastName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('TUTOR');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newBusinessName, setNewBusinessName] = useState<string>('');
  const [newNationalId, setNewNationalId] = useState<string>('');
  const [newDistrict, setNewDistrict] = useState<string>('');
  const [newSector, setNewSector] = useState<string>('');
  const [newSchoolName, setNewSchoolName] = useState<string>('');

  // Edit Form State
  const [editFirstName, setEditFirstName] = useState<string>('');
  const [editLastName, setEditLastName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editBusinessName, setEditBusinessName] = useState<string>('');
  const [editDistrict, setEditDistrict] = useState<string>('');
  const [editSector, setEditSector] = useState<string>('');
  const [editSchoolName, setEditSchoolName] = useState<string>('');

  // Payout Form State
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutNotes, setPayoutNotes] = useState<string>('');

  // Rate Edit State
  const [editingRate, setEditingRate] = useState<ServiceCommissionConfigItem | null>(null);
  const [newRateFee, setNewRateFee] = useState<number>(500);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, ratesRes, ledgerRes] = await Promise.allSettled([
        adminService.getStaff({ role: 'ALL' }),
        adminService.getCommissionRates(),
        adminService.getAgentCommissions(),
      ]);

      if (staffRes.status === 'fulfilled') setStaffList(staffRes.value);
      if (ratesRes.status === 'fulfilled') setCommissionRates(ratesRes.value);
      if (ledgerRes.status === 'fulfilled') setCommissionsLedger(ledgerRes.value);
    } catch (err) {
      console.error('Failed to load Agents & Staff data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter Staff (excluding AGENT)
  const filteredStaffList = useMemo(() => {
    return staffList
      .filter((u) => u.role !== 'AGENT')
      .filter((u) => {
        if (staffRoleFilter !== 'ALL' && u.role !== staffRoleFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          u.phone_number.toLowerCase().includes(q) ||
          (u.full_name && u.full_name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.school_name && u.school_name.toLowerCase().includes(q))
        );
      });
  }, [staffList, staffRoleFilter, searchQuery]);

  // Filter Agents (role === AGENT)
  const filteredAgentList = useMemo(() => {
    return staffList
      .filter((u) => u.role === 'AGENT')
      .filter((u) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          u.phone_number.toLowerCase().includes(q) ||
          (u.full_name && u.full_name.toLowerCase().includes(q)) ||
          (u.agent_code && u.agent_code.toLowerCase().includes(q)) ||
          (u.business_name && u.business_name.toLowerCase().includes(q)) ||
          (u.district && u.district.toLowerCase().includes(q))
        );
      });
  }, [staffList, searchQuery]);

  // View single agent's ledger in pop-out modal
  const handleViewAgentLedger = (agent: StaffUserItem) => {
    setAgentLedgerModal(agent);
    setAgentModalSearchQuery('');
  };

  const handleCloseAgentLedgerModal = () => {
    setAgentLedgerModal(null);
    setAgentModalSearchQuery('');
  };

  // Trigger Individual Staff Audit
  const handleAuditStaff = async (staff: StaffUserItem) => {
    setAuditingStaff(staff);
    setIsAuditLoading(true);
    setAuditSearchQuery('');
    setAuditSeverityFilter('ALL');
    try {
      const logs = await adminService.getUserAuditTrail(staff.id);
      setStaffAuditLogs(logs);
    } catch (err: any) {
      toastError(err?.message || 'Failed to load staff activity audit logs.');
      setStaffAuditLogs([]);
    } finally {
      setIsAuditLoading(false);
    }
  };

  const handleCloseAudit = () => {
    setAuditingStaff(null);
    setStaffAuditLogs([]);
    setAuditSearchQuery('');
    setAuditSeverityFilter('ALL');
  };

  const handleRefreshAudit = async () => {
    if (!auditingStaff) return;
    setIsAuditLoading(true);
    try {
      const logs = await adminService.getUserAuditTrail(auditingStaff.id);
      setStaffAuditLogs(logs);
    } catch (err: any) {
      toastError(err?.message || 'Failed to refresh staff audit logs.');
    } finally {
      setIsAuditLoading(false);
    }
  };

  // Filtered staff audit logs
  const filteredStaffAuditLogs = useMemo(() => {
    let list = staffAuditLogs;
    if (auditSeverityFilter !== 'ALL') {
      list = list.filter((l) => l.severity === auditSeverityFilter);
    }
    if (!auditSearchQuery.trim()) return list;
    const q = auditSearchQuery.toLowerCase();
    return list.filter((l) => {
      const actionMatch = Boolean(l.action && l.action.toLowerCase().includes(q));
      const endpointMatch = Boolean(l.endpoint && l.endpoint.toLowerCase().includes(q));
      const objMatch = Boolean(l.object_type && l.object_type.toLowerCase().includes(q));
      const ipMatch = Boolean(l.ip_address && l.ip_address.toLowerCase().includes(q));
      const contextMatch = Boolean(l.context && JSON.stringify(l.context).toLowerCase().includes(q));
      return actionMatch || endpointMatch || objMatch || ipMatch || contextMatch;
    });
  }, [staffAuditLogs, auditSeverityFilter, auditSearchQuery]);

  // Filter Ledger Entries (all agents or a single selected agent)
  const filteredLedger = useMemo(() => {
    let list = commissionsLedger;
    if (selectedAgentFilter) {
      list = list.filter(
        (c) =>
          c.agent === selectedAgentFilter.id ||
          (selectedAgentFilter.agent_code && c.agent_code === selectedAgentFilter.agent_code) ||
          c.agent_phone === selectedAgentFilter.phone_number
      );
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        (c.service_reference && c.service_reference.toLowerCase().includes(q)) ||
        (c.agent_name && c.agent_name.toLowerCase().includes(q)) ||
        (c.agent_code && c.agent_code.toLowerCase().includes(q)) ||
        (c.client_name && c.client_name.toLowerCase().includes(q)) ||
        (c.client_phone && c.client_phone.toLowerCase().includes(q)) ||
        (c.service_type && c.service_type.toLowerCase().includes(q))
    );
  }, [commissionsLedger, selectedAgentFilter, searchQuery]);

  // Filter Ledger Entries for Individual Agent Pop-out Modal
  const agentModalLedger = useMemo(() => {
    if (!agentLedgerModal) return [];
    let list = commissionsLedger.filter(
      (c) =>
        c.agent === agentLedgerModal.id ||
        (agentLedgerModal.agent_code && c.agent_code === agentLedgerModal.agent_code) ||
        c.agent_phone === agentLedgerModal.phone_number
    );
    if (!agentModalSearchQuery.trim()) return list;
    const q = agentModalSearchQuery.toLowerCase();
    return list.filter(
      (c) =>
        (c.service_reference && c.service_reference.toLowerCase().includes(q)) ||
        (c.client_name && c.client_name.toLowerCase().includes(q)) ||
        (c.client_phone && c.client_phone.toLowerCase().includes(q)) ||
        (c.service_type && c.service_type.toLowerCase().includes(q)) ||
        (c.status && c.status.toLowerCase().includes(q))
    );
  }, [commissionsLedger, agentLedgerModal, agentModalSearchQuery]);

  // Handle Create Staff / Agent
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim() || !newFirstName.trim() || !newLastName.trim()) {
      warning('Phone number, first name, and last name are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createStaff({
        phone_number: newPhone.trim(),
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
        email: newEmail.trim() || undefined,
        role: newRole,
        password: newPassword.trim() || undefined,
        business_name: newBusinessName.trim() || undefined,
        national_id_number: newNationalId.trim() || undefined,
        district: newDistrict.trim() || undefined,
        sector: newSector.trim() || undefined,
        school_name: newSchoolName.trim() || undefined,
      });

      success(`Created ${newRole} user "${newFirstName} ${newLastName}".`);
      setIsCreateStaffModalOpen(false);
      resetCreateForm();
      loadAllData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.phone_number || err?.message || 'Failed to create user.';
      toastError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setNewPhone('');
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewPassword('');
    setNewBusinessName('');
    setNewNationalId('');
    setNewDistrict('');
    setNewSector('');
    setNewSchoolName('');
  };

  // Open Edit Modal
  const handleOpenEdit = (staff: StaffUserItem) => {
    setSelectedStaff(staff);
    setEditFirstName(staff.first_name || '');
    setEditLastName(staff.last_name || '');
    setEditEmail(staff.email || '');
    setEditBusinessName(staff.business_name || '');
    setEditDistrict(staff.district || '');
    setEditSector(staff.sector || '');
    setEditSchoolName(staff.school_name || '');
    setIsEditStaffModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setIsSubmitting(true);
    try {
      await adminService.updateStaff(selectedStaff.id, {
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        email: editEmail.trim() || undefined,
        business_name: editBusinessName.trim() || undefined,
        district: editDistrict.trim() || undefined,
        sector: editSector.trim() || undefined,
        school_name: editSchoolName.trim() || undefined,
      });

      success(`Updated user "${selectedStaff.phone_number}".`);
      setIsEditStaffModalOpen(false);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Staff Active / Deactivated
  const handleToggleStaffActive = async (staff: StaffUserItem) => {
    const actionName = staff.is_active ? 'deactivate' : 'activate';
    const confirmed = window.confirm(`Are you sure you want to ${actionName} ${staff.role} "${staff.full_name || staff.phone_number}"?`);
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await adminService.updateStaff(staff.id, {
        is_active: !staff.is_active,
      });
      success(`Successfully ${actionName}d user "${staff.phone_number}".`);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || `Failed to ${actionName} user.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Payout Modal
  const handleOpenPayout = (agent: StaffUserItem) => {
    setSelectedStaff(agent);
    setPayoutAmount(agent.pending_balance_rwf || 0);
    setPayoutNotes(`Monthly 30-day commission settlement for ${agent.agent_code || agent.full_name}`);
    setIsPayoutModalOpen(true);
  };

  // Settle Monthly Payout
  const handleProcessPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    if (payoutAmount <= 0) {
      warning('Payout amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.payoutAgentMonthly({
        agent_id: selectedStaff.id,
        payout_amount: payoutAmount,
        notes: payoutNotes.trim(),
      });

      success(`Settled ${payoutAmount.toLocaleString()} RWF payout for Agent ${selectedStaff.agent_code || selectedStaff.phone_number}.`);
      setIsPayoutModalOpen(false);
      loadAllData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to process payout settlement.';
      toastError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Commission Rate
  const handleUpdateCommissionRate = async (rate: ServiceCommissionConfigItem, newFee: number) => {
    setIsSubmitting(true);
    try {
      await adminService.updateCommissionRate({
        service_type: rate.service_type,
        commission_fee_rwf: Number(newFee),
      });
      success(`Updated ${rate.service_type} commission fee to ${Number(newFee).toLocaleString()} RWF.`);
      setEditingRate(null);
      loadAllData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update commission rate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalStaffCount = staffList.filter((s) => s.role !== 'AGENT').length;
  const totalAgentCount = staffList.filter((s) => s.role === 'AGENT').length;

  return {
    activeTab,
    setActiveTab,
    agentSubTab,
    setAgentSubTab,
    staffRoleFilter,
    setStaffRoleFilter,
    selectedAgentFilter,
    setSelectedAgentFilter,
    agentLedgerModal,
    agentModalSearchQuery,
    setAgentModalSearchQuery,
    auditingStaff,
    staffAuditLogs,
    isAuditLoading,
    auditSearchQuery,
    setAuditSearchQuery,
    auditSeverityFilter,
    setAuditSeverityFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSubmitting,
    staffList,
    commissionRates,
    commissionsLedger,
    isCreateStaffModalOpen,
    setIsCreateStaffModalOpen,
    isEditStaffModalOpen,
    setIsEditStaffModalOpen,
    isPayoutModalOpen,
    setIsPayoutModalOpen,
    selectedStaff,
    setSelectedStaff,
    newPhone,
    setNewPhone,
    newFirstName,
    setNewFirstName,
    newLastName,
    setNewLastName,
    newEmail,
    setNewEmail,
    newRole,
    setNewRole,
    newPassword,
    setNewPassword,
    newBusinessName,
    setNewBusinessName,
    newNationalId,
    setNewNationalId,
    newDistrict,
    setNewDistrict,
    newSector,
    setNewSector,
    newSchoolName,
    setNewSchoolName,
    editFirstName,
    setEditFirstName,
    editLastName,
    setEditLastName,
    editEmail,
    setEditEmail,
    editBusinessName,
    setEditBusinessName,
    editDistrict,
    setEditDistrict,
    editSector,
    setEditSector,
    editSchoolName,
    setEditSchoolName,
    payoutAmount,
    setPayoutAmount,
    payoutNotes,
    setPayoutNotes,
    editingRate,
    setEditingRate,
    newRateFee,
    setNewRateFee,
    loadAllData,
    filteredStaffList,
    filteredAgentList,
    filteredStaffAuditLogs,
    filteredLedger,
    agentModalLedger,
    handleViewAgentLedger,
    handleCloseAgentLedgerModal,
    handleAuditStaff,
    handleCloseAudit,
    handleRefreshAudit,
    handleCreateStaff,
    handleOpenEdit,
    handleSaveEdit,
    handleToggleStaffActive,
    handleOpenPayout,
    handleProcessPayout,
    handleUpdateCommissionRate,
    totalStaffCount,
    totalAgentCount,
  };
};
