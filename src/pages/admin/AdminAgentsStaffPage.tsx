import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  Edit3,
  Power,
  PowerOff,
  History,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  AdminService,
  type StaffUserItem,
  type ServiceCommissionConfigItem,
  type AgentCommissionItem,
  type AuditLogItem,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

type StaffRoleFilter = 'ALL' | 'TUTOR' | 'TRAINING_ADMIN' | 'BOARD_REVIEWER' | 'ENTERPRISE_ADMIN';

export const AdminAgentsStaffPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'staffs' | 'agents' | 'rates'>('staffs');
  const [agentSubTab, setAgentSubTab] = useState<'directory' | 'ledger'>('directory');
  const [staffRoleFilter, setStaffRoleFilter] = useState<StaffRoleFilter>('ALL');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<StaffUserItem | null>(null);

  // Staff Audit State
  const [auditingStaff, setAuditingStaff] = useState<StaffUserItem | null>(null);
  const [staffAuditLogs, setStaffAuditLogs] = useState<AuditLogItem[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<string>('ALL');

  // Agent Individual Ledger Modal State
  const [viewingAgentLedger, setViewingAgentLedger] = useState<StaffUserItem | null>(null);
  const [agentLedgerSearch, setAgentLedgerSearch] = useState<string>('');
  const [agentLedgerServiceFilter, setAgentLedgerServiceFilter] = useState<string>('ALL');
  const [agentLedgerStatusFilter, setAgentLedgerStatusFilter] = useState<string>('ALL');

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

  // View single agent's ledger in pop-out modal dialog
  const handleViewAgentLedger = (agent: StaffUserItem) => {
    setViewingAgentLedger(agent);
    setAgentLedgerSearch('');
    setAgentLedgerServiceFilter('ALL');
    setAgentLedgerStatusFilter('ALL');
  };

  const handleCloseAgentLedger = () => {
    setViewingAgentLedger(null);
    setAgentLedgerSearch('');
    setAgentLedgerServiceFilter('ALL');
    setAgentLedgerStatusFilter('ALL');
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

  // Filter Ledger Entries specifically for viewingAgentLedger in pop-out dialog
  const agentSpecificLedger = useMemo(() => {
    if (!viewingAgentLedger) return [];
    return commissionsLedger.filter((item) => {
      const matchAgent =
        item.agent === viewingAgentLedger.id ||
        (viewingAgentLedger.agent_code && item.agent_code === viewingAgentLedger.agent_code) ||
        (viewingAgentLedger.phone_number && item.agent_phone === viewingAgentLedger.phone_number);

      if (!matchAgent) return false;

      if (agentLedgerServiceFilter !== 'ALL' && item.service_type !== agentLedgerServiceFilter) {
        return false;
      }

      if (agentLedgerStatusFilter !== 'ALL' && item.status !== agentLedgerStatusFilter) {
        return false;
      }

      if (agentLedgerSearch.trim()) {
        const q = agentLedgerSearch.toLowerCase();
        const refMatch = Boolean(item.service_reference && item.service_reference.toLowerCase().includes(q));
        const clientMatch = Boolean(
          (item.client_name && item.client_name.toLowerCase().includes(q)) ||
          (item.client_phone && item.client_phone.includes(q))
        );
        const serviceMatch = Boolean(item.service_type && item.service_type.toLowerCase().includes(q));
        return refMatch || clientMatch || serviceMatch;
      }

      return true;
    });
  }, [viewingAgentLedger, commissionsLedger, agentLedgerServiceFilter, agentLedgerStatusFilter, agentLedgerSearch]);

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
      success(`Updated ${rate.service_name} commission fee to ${Number(newFee).toLocaleString()} RWF.`);
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

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px', minHeight: '100vh' }}>
      
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
            Agents & Staff
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            Manage platform staff, field agents, service commissions, and monthly payouts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeTab === 'staffs' && (
            <button
              onClick={() => {
                setNewRole('TUTOR');
                setIsCreateStaffModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
            >
              <Plus size={15} />
              <span>Add Staff</span>
            </button>
          )}

          {activeTab === 'agents' && (
            <button
              onClick={() => {
                setNewRole('AGENT');
                setIsCreateStaffModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
            >
              <Plus size={15} />
              <span>Add Agent</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Section Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        <button
          onClick={() => {
            setActiveTab('staffs');
            setSearchQuery('');
          }}
          className={`btn btn-sm ${activeTab === 'staffs' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.82rem', padding: '6px 16px' }}
        >
          Staffs ({totalStaffCount})
        </button>

        <button
          onClick={() => {
            setActiveTab('agents');
            setSearchQuery('');
          }}
          className={`btn btn-sm ${activeTab === 'agents' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.82rem', padding: '6px 16px' }}
        >
          Agents ({totalAgentCount})
        </button>

        <button
          onClick={() => {
            setActiveTab('rates');
            setSearchQuery('');
          }}
          className={`btn btn-sm ${activeTab === 'rates' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.82rem', padding: '6px 16px' }}
        >
          Rates ({commissionRates.length})
        </button>
      </div>

      {/* 3. SECTION 1: STAFFS & INDIVIDUAL AUDIT */}
      {activeTab === 'staffs' && (
        <div>
          {/* STAFF DIRECTORY & AUDIT SELECTION TABLE */}
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            
            {/* Controls Bar: Search & Role Filter */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              
              {/* Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
                {(['ALL', 'TUTOR', 'TRAINING_ADMIN', 'BOARD_REVIEWER', 'ENTERPRISE_ADMIN'] as StaffRoleFilter[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setStaffRoleFilter(r)}
                    className={`btn btn-sm ${staffRoleFilter === r ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.74rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
                  >
                    {r === 'ALL' && 'All'}
                    {r === 'TUTOR' && 'Tutors'}
                    {r === 'TRAINING_ADMIN' && 'Training Admins'}
                    {r === 'BOARD_REVIEWER' && 'Reviewers'}
                    {r === 'ENTERPRISE_ADMIN' && 'Driving Schools'}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: 'relative', width: '240px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search staff to audit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                  }}
                />
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
                <Spinner size={32} />
              </div>
            ) : filteredStaffList.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                No staff members found matching criteria.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px 16px' }}>Staff Member</th>
                      <th style={{ padding: '12px 16px' }}>Role</th>
                      <th style={{ padding: '12px 16px' }}>Contact</th>
                      <th style={{ padding: '12px 16px' }}>Station / Scope</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Last Login & IP</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaffList.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => handleAuditStaff(u)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              margin: 0,
                              cursor: 'pointer',
                              textAlign: 'left',
                              color: '#ffffff',
                              fontWeight: 600,
                              fontSize: '0.86rem',
                              textDecoration: 'underline',
                              textDecorationColor: 'transparent',
                              transition: 'text-decoration-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = 'var(--text-primary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = 'transparent')}
                            title="Click to audit activity history"
                          >
                            {u.full_name || '—'}
                          </button>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            ID: {u.id.slice(0, 8)}...
                          </div>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <Badge variant={u.role === 'TUTOR' ? 'success' : u.role === 'TRAINING_ADMIN' ? 'warning' : u.role === 'SYSTEM_ADMIN' ? 'danger' : 'neutral'}>
                            {u.role}
                          </Badge>
                        </td>

                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{u.phone_number}</div>
                          {u.email && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>}
                        </td>

                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          {u.school_name ? (
                            <div>{u.school_name}</div>
                          ) : u.role === 'TUTOR' ? (
                            <div>{u.assigned_cohorts_count || 0} Cohorts Assigned</div>
                          ) : u.sector ? (
                            <div>{u.sector}</div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Universal Scope</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {u.is_active ? (
                            <Badge variant="success">ACTIVE</Badge>
                          ) : (
                            <Badge variant="neutral">INACTIVE</Badge>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                          {u.last_login ? (
                            <div>
                              <div>{new Date(u.last_login).toLocaleDateString()}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {u.last_login_ip || '127.0.0.1'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Never logged in</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            {/* Individual Staff Audit Button */}
                            <button
                              onClick={() => handleAuditStaff(u)}
                              className="btn btn-primary btn-sm"
                              style={{
                                fontSize: '0.74rem',
                                padding: '4px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Audit individual staff member activities"
                            >
                              <History size={12} />
                              <span>Audit</span>
                            </button>

                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.74rem', padding: '4px 8px' }}
                              title="Edit staff details"
                            >
                              <Edit3 size={12} />
                            </button>

                            <button
                              onClick={() => handleToggleStaffActive(u)}
                              className="btn btn-secondary btn-sm"
                              style={{
                                fontSize: '0.74rem',
                                padding: '4px 8px',
                                color: u.is_active ? 'var(--danger)' : '#4ade80',
                                borderColor: u.is_active ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                              }}
                              title={u.is_active ? 'Deactivate staff account' : 'Activate staff account'}
                            >
                              {u.is_active ? <PowerOff size={12} /> : <Power size={12} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* POP-OUT MODAL: INDIVIDUAL STAFF ACTIVITY AUDIT */}
          {auditingStaff && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1050,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '20px',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) handleCloseAudit();
              }}
            >
              <div
                className="glass-panel"
                style={{
                  width: '100%',
                  maxWidth: '1050px',
                  maxHeight: '88vh',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-surface)',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
                }}
              >
                {/* Audit Header Bar */}
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                        {auditingStaff.full_name || 'Staff User'}
                      </span>
                      <Badge variant={auditingStaff.role === 'TUTOR' ? 'success' : auditingStaff.role === 'TRAINING_ADMIN' ? 'warning' : auditingStaff.role === 'SYSTEM_ADMIN' ? 'danger' : 'neutral'}>
                        {auditingStaff.role}
                      </Badge>
                      {auditingStaff.is_active ? (
                        <Badge variant="success">ACTIVE</Badge>
                      ) : (
                        <Badge variant="neutral">DEACTIVATED</Badge>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {auditingStaff.phone_number} {auditingStaff.email ? `• ${auditingStaff.email}` : ''}
                    </div>
                  </div>

                  {/* Quick Staff Switcher */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Staff:</label>
                    <select
                      value={auditingStaff.id}
                      onChange={(e) => {
                        const found = staffList.find((s) => s.id === e.target.value);
                        if (found) handleAuditStaff(found);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        maxWidth: '220px',
                      }}
                    >
                      {staffList
                        .filter((s) => s.role !== 'AGENT')
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.full_name} ({s.role})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Profile Summary Strip */}
                <div
                  style={{
                    padding: '12px 20px',
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '12px',
                    flexShrink: 0,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned Station / Scope</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
                      {auditingStaff.school_name || (auditingStaff.role === 'TUTOR' ? `${auditingStaff.assigned_cohorts_count || 0} Cohorts Assigned` : '') || auditingStaff.sector || 'Universal Operational Scope'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned Cohorts</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
                      {auditingStaff.role === 'TUTOR' ? `${auditingStaff.assigned_cohorts_count || 0} Cohorts Assigned` : 'All Cohorts Permitted'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Events Logged</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
                      {staffAuditLogs.length} Events Recorded
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last Login IP</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginTop: '2px', fontFamily: 'monospace' }}>
                      {auditingStaff.last_login_ip || '127.0.0.1 (Local Session)'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cryptographic Integrity</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                      <ShieldCheck size={14} color="#10b981" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>SHA-256 Validated</span>
                    </div>
                  </div>
                </div>

                {/* Activity Filters Toolbar */}
                <div
                  style={{
                    padding: '8px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Severity:</span>
                    {['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setAuditSeverityFilter(sev)}
                        className={`btn btn-sm ${auditSeverityFilter === sev ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ position: 'relative', width: '220px' }}>
                      <Search size={13} style={{ position: 'absolute', left: '9px', top: '8px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Filter activities..."
                        value={auditSearchQuery}
                        onChange={(e) => setAuditSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '5px 8px 5px 28px',
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                        }}
                      />
                    </div>

                    <button
                      onClick={handleRefreshAudit}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
                      title="Refresh audit trail"
                    >
                      <RefreshCw size={12} className={isAuditLoading ? 'spin' : ''} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Audit Logs Table (Scrollable Body) */}
                <div style={{ overflowY: 'auto', flex: 1, minHeight: '220px' }}>
                  {isAuditLoading ? (
                    <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
                      <Spinner size={28} />
                    </div>
                  ) : filteredStaffAuditLogs.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                      {staffAuditLogs.length === 0
                        ? `No activity history recorded for ${auditingStaff.full_name} yet.`
                        : 'No activity events matching your severity or search query.'}
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--bg-surface)' }}>
                          <th style={{ padding: '10px 16px' }}>Timestamp</th>
                          <th style={{ padding: '10px 16px' }}>Action</th>
                          <th style={{ padding: '10px 16px' }}>Severity</th>
                          <th style={{ padding: '10px 16px' }}>Target / Resource</th>
                          <th style={{ padding: '10px 16px' }}>Endpoint & IP</th>
                          <th style={{ padding: '10px 16px' }}>Details / Context</th>
                          <th style={{ padding: '10px 16px' }}>Hash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStaffAuditLogs.map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                              <div style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 600 }}>
                                {new Date(log.timestamp || log.created_at).toLocaleDateString()}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {new Date(log.timestamp || log.created_at).toLocaleTimeString()}
                              </div>
                            </td>

                            <td style={{ padding: '10px 16px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', color: '#ffffff' }}>
                                {log.action}
                              </span>
                            </td>

                            <td style={{ padding: '10px 16px' }}>
                              <Badge variant={log.severity === 'CRITICAL' ? 'danger' : log.severity === 'HIGH' ? 'warning' : log.severity === 'MEDIUM' ? 'info' : 'neutral'}>
                                {log.severity}
                              </Badge>
                            </td>

                            <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                              <div>{log.object_type || 'System'}</div>
                              {log.object_id && (
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                  {log.object_id.slice(0, 14)}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '10px 16px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                              <div style={{ fontFamily: 'monospace' }}>
                                {log.ip_address || 'Internal Service'}
                              </div>
                              {log.endpoint && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                  {log.http_method ? `${log.http_method} ` : ''}{log.endpoint}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '10px 16px' }}>
                              {log.context ? (
                                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={JSON.stringify(log.context, null, 2)}>
                                  {Object.entries(log.context).map(([k, v]) => `${k}: ${String(v)}`).join(' • ')}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>—</span>
                              )}
                            </td>

                            <td style={{ padding: '10px 16px' }}>
                              <span style={{ fontSize: '0.72rem', color: '#10b981', fontFamily: 'monospace', fontWeight: 600 }}>
                                Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Audit Footer Bar */}
                <div
                  style={{
                    padding: '10px 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div>
                    Showing {filteredStaffAuditLogs.length} of {staffAuditLogs.length} recorded events for {auditingStaff.full_name}
                  </div>
                  <button
                    onClick={handleCloseAudit}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.74rem', padding: '4px 12px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SECTION 2: AGENTS */}
      {activeTab === 'agents' && (
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          
          {/* Sub-Header Toolbar: Sub-tabs & Search */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Sub Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setAgentSubTab('directory')}
                className={`btn btn-sm ${agentSubTab === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.76rem', padding: '4px 12px' }}
              >
                Directory ({filteredAgentList.length})
              </button>

              <button
                onClick={() => setAgentSubTab('ledger')}
                className={`btn btn-sm ${agentSubTab === 'ledger' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.76rem', padding: '4px 12px' }}
              >
                Ledger ({selectedAgentFilter ? `${selectedAgentFilter.agent_code || selectedAgentFilter.full_name}: ${filteredLedger.length}` : commissionsLedger.length})
              </button>
            </div>

            {/* Filter by Agent (when on Ledger) & Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {agentSubTab === 'ledger' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Agent:</label>
                  <select
                    value={selectedAgentFilter?.id || 'ALL'}
                    onChange={(e) => {
                      if (e.target.value === 'ALL') {
                        setSelectedAgentFilter(null);
                      } else {
                        const found = staffList.find((s) => s.id === e.target.value);
                        setSelectedAgentFilter(found || null);
                      }
                    }}
                    style={{
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      maxWidth: '220px',
                    }}
                  >
                    <option value="ALL">All Agents ({totalAgentCount})</option>
                    {staffList
                      .filter((s) => s.role === 'AGENT')
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.full_name} ({a.agent_code || a.phone_number})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder={agentSubTab === 'directory' ? 'Search agents...' : 'Search ledger...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                  }}
                />
              </div>
            </div>
          </div>

          {/* SUB-VIEW 1: AGENTS DIRECTORY */}
          {agentSubTab === 'directory' && (
            <div>
              {isLoading ? (
                <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
                  <Spinner size={32} />
                </div>
              ) : filteredAgentList.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  No agents registered yet. Use "Add Agent" to register field agents.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Agent</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Station / Location</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Accrued</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Paid Out</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Unpaid Balance</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Last Payout</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgentList.map((u) => {
                        const pendingBal = u.pending_balance_rwf || 0;

                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div
                                onClick={() => handleViewAgentLedger(u)}
                                style={{ fontWeight: 600, color: '#ffffff', cursor: 'pointer', display: 'inline-block' }}
                                title="Click to view agent ledger"
                              >
                                {u.full_name || 'Agent User'}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '1px' }}>
                                {u.phone_number}
                              </div>
                              {u.agent_code && (
                                <div
                                  onClick={() => handleViewAgentLedger(u)}
                                  style={{ fontSize: '0.72rem', color: '#93c5fd', fontFamily: 'monospace', fontWeight: 600, marginTop: '2px', cursor: 'pointer', display: 'inline-block' }}
                                  title="Click to view agent ledger"
                                >
                                  {u.agent_code}
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                              <div>{u.business_name || 'Kiosk'}</div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {[u.district, u.sector].filter(Boolean).join(', ') || 'Rwanda'}
                              </div>
                            </td>

                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                              {(u.total_accrued_rwf || 0).toLocaleString()} RWF
                            </td>

                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                              {(u.total_paid_out_rwf || 0).toLocaleString()} RWF
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontWeight: 700, color: pendingBal > 0 ? '#f59e0b' : '#10b981' }}>
                                {pendingBal.toLocaleString()} RWF
                              </span>
                            </td>

                            <td style={{ padding: '12px 16px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {u.last_payout_date || 'First Cycle'}
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              {u.is_active ? (
                                <Badge variant="success">ACTIVE</Badge>
                              ) : (
                                <Badge variant="neutral">DEACTIVATED</Badge>
                              )}
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  onClick={() => handleViewAgentLedger(u)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                                  title="Review this agent's ledger"
                                >
                                  Ledger
                                </button>

                                {pendingBal > 0 && (
                                  <button
                                    onClick={() => handleOpenPayout(u)}
                                    className="btn btn-primary btn-sm"
                                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                                    title="Settle 30-day payout"
                                  >
                                    Settle
                                  </button>
                                )}

                                <button
                                  onClick={() => handleOpenEdit(u)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                                  title="Edit agent details"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => handleToggleStaffActive(u)}
                                  className="btn btn-secondary btn-sm"
                                  style={{
                                    fontSize: '0.72rem',
                                    padding: '3px 8px',
                                    color: u.is_active ? 'var(--danger)' : '#4ade80',
                                    borderColor: u.is_active ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)',
                                  }}
                                  title={u.is_active ? 'Deactivate agent account' : 'Activate agent account'}
                                >
                                  {u.is_active ? <PowerOff size={11} /> : <Power size={11} />}
                                </button>
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
          )}

          {/* SUB-VIEW 2: COMMISSIONS LEDGER */}
          {agentSubTab === 'ledger' && (
            <div>
              {/* Single Agent Review Banner */}
              {selectedAgentFilter && (
                <div
                  style={{
                    margin: '12px 16px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
                        {selectedAgentFilter.full_name}
                      </span>
                      {selectedAgentFilter.agent_code && (
                        <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontFamily: 'monospace', fontWeight: 600 }}>
                          {selectedAgentFilter.agent_code}
                        </span>
                      )}
                      {selectedAgentFilter.is_active ? (
                        <Badge variant="success">ACTIVE</Badge>
                      ) : (
                        <Badge variant="neutral">DEACTIVATED</Badge>
                      )}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Phone: {selectedAgentFilter.phone_number} • Station: {selectedAgentFilter.business_name || 'Kiosk'} ({[selectedAgentFilter.district, selectedAgentFilter.sector].filter(Boolean).join(', ') || 'Rwanda'})
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Accrued: <strong style={{ color: '#ffffff' }}>{(selectedAgentFilter.total_accrued_rwf || 0).toLocaleString()} RWF</strong> • 
                      Paid Out: <strong style={{ color: '#ffffff' }}>{(selectedAgentFilter.total_paid_out_rwf || 0).toLocaleString()} RWF</strong> • 
                      Unpaid Balance: <strong style={{ color: (selectedAgentFilter.pending_balance_rwf || 0) > 0 ? '#f59e0b' : '#10b981' }}>{(selectedAgentFilter.pending_balance_rwf || 0).toLocaleString()} RWF</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(selectedAgentFilter.pending_balance_rwf || 0) > 0 && (
                      <button
                        onClick={() => handleOpenPayout(selectedAgentFilter)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                      >
                        Settle Payout
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAgentFilter(null)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                    >
                      Show All Agents
                    </button>
                  </div>
                </div>
              )}

              {filteredLedger.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  {selectedAgentFilter
                    ? `No commissions recorded yet for Agent ${selectedAgentFilter.full_name} (${selectedAgentFilter.agent_code || selectedAgentFilter.phone_number}).`
                    : 'No commissions recorded yet. Facilitated services appear here.'}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Date & Ref</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Agent</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Client</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Service</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Client Paid</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Commission</th>
                        <th style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLedger.map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8rem' }}>
                              {new Date(c.created_at).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {c.service_reference || c.id.slice(0, 8)}
                            </div>
                          </td>

                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#ffffff' }}>
                              {c.agent_name || 'Agent'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {c.agent_code || c.agent_phone}
                            </div>
                          </td>

                          <td style={{ padding: '10px 16px' }}>
                            <div style={{ color: '#ffffff' }}>{c.client_name || 'Walk-in Client'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {c.client_phone || '—'}
                            </div>
                          </td>

                          <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                            {c.service_type === 'BOOKING' && 'Driving Test Booking'}
                            {c.service_type === 'SUBSCRIPTION' && 'Course Subscription'}
                            {c.service_type === 'EXAM_PURCHASE' && 'Exam Purchase'}
                            {c.service_type === 'LEARNING_FEE' && 'Tuition Fee'}
                            {c.service_type === 'OTHER' && 'Other'}
                          </td>

                          <td style={{ padding: '10px 16px', color: '#ffffff' }}>
                            {c.amount_paid_by_client_rwf.toLocaleString()} RWF
                          </td>

                          <td style={{ padding: '10px 16px', fontWeight: 700, color: '#10b981' }}>
                            +{c.commission_amount_rwf.toLocaleString()} RWF
                          </td>

                          <td style={{ padding: '10px 16px' }}>
                            {c.status === 'ACCRUED' ? (
                              <Badge variant="warning">ACCRUED</Badge>
                            ) : (
                              <Badge variant="success">PAID OUT</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* POP-OUT MODAL: INDIVIDUAL AGENT SERVICE & COMMISSION LEDGER */}
          {viewingAgentLedger && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1050,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '20px',
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) handleCloseAgentLedger();
              }}
            >
              <div
                className="glass-panel"
                style={{
                  width: '100%',
                  maxWidth: '1050px',
                  maxHeight: '88vh',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-surface)',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                        {viewingAgentLedger.full_name}
                      </span>
                      {viewingAgentLedger.agent_code && (
                        <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontFamily: 'monospace', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)' }}>
                          {viewingAgentLedger.agent_code}
                        </span>
                      )}
                      <Badge variant="neutral">AGENT</Badge>
                      {viewingAgentLedger.is_active ? (
                        <Badge variant="success">ACTIVE</Badge>
                      ) : (
                        <Badge variant="neutral">DEACTIVATED</Badge>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {viewingAgentLedger.phone_number} • {viewingAgentLedger.business_name || 'Kiosk'} ({[viewingAgentLedger.district, viewingAgentLedger.sector].filter(Boolean).join(', ') || 'Rwanda'})
                    </div>
                  </div>

                  {/* Quick Agent Switcher */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Agent:</label>
                    <select
                      value={viewingAgentLedger.id}
                      onChange={(e) => {
                        const found = staffList.find((s) => s.id === e.target.value);
                        if (found) handleViewAgentLedger(found);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                        maxWidth: '220px',
                      }}
                    >
                      {staffList
                        .filter((s) => s.role === 'AGENT')
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.full_name} ({a.agent_code || a.phone_number})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Financial Summary Strip */}
                <div
                  style={{
                    padding: '12px 20px',
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '12px',
                    flexShrink: 0,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Accrued Commission</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                      {(viewingAgentLedger.total_accrued_rwf || 0).toLocaleString()} RWF
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Paid Out</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {(viewingAgentLedger.total_paid_out_rwf || 0).toLocaleString()} RWF
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unpaid Pending Balance</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: (viewingAgentLedger.pending_balance_rwf || 0) > 0 ? '#f59e0b' : '#10b981', marginTop: '2px' }}>
                      {(viewingAgentLedger.pending_balance_rwf || 0).toLocaleString()} RWF
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last Payout Date</div>
                    <div style={{ fontSize: '0.85rem', color: '#ffffff', marginTop: '2px' }}>
                      {viewingAgentLedger.last_payout_date || 'First Cycle (Pending 30-day settlement)'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Facilitated Services</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                      {commissionsLedger.filter((c) => c.agent === viewingAgentLedger.id || (viewingAgentLedger.agent_code && c.agent_code === viewingAgentLedger.agent_code)).length} Transactions
                    </div>
                  </div>
                </div>

                {/* Filters Toolbar */}
                <div
                  style={{
                    padding: '8px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Service:</span>
                    {['ALL', 'BOOKING', 'SUBSCRIPTION', 'COURSE_ENROLLMENT', 'EXAM_PURCHASE'].map((srv) => (
                      <button
                        key={srv}
                        onClick={() => setAgentLedgerServiceFilter(srv)}
                        className={`btn btn-sm ${agentLedgerServiceFilter === srv ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.72rem', padding: '3px 8px', whiteSpace: 'nowrap' }}
                      >
                        {srv === 'ALL' && 'All'}
                        {srv === 'BOOKING' && 'Bookings'}
                        {srv === 'SUBSCRIPTION' && 'Subscriptions'}
                        {srv === 'COURSE_ENROLLMENT' && 'Courses'}
                        {srv === 'EXAM_PURCHASE' && 'Exams'}
                      </button>
                    ))}
                  </div>

                  <div style={{ position: 'relative', width: '220px' }}>
                    <Search size={13} style={{ position: 'absolute', left: '9px', top: '8px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Filter client, ref, service..."
                      value={agentLedgerSearch}
                      onChange={(e) => setAgentLedgerSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 8px 5px 28px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.78rem',
                      }}
                    />
                  </div>
                </div>

                {/* Ledger Table (Scrollable Body) */}
                <div style={{ overflowY: 'auto', flex: 1, minHeight: '220px' }}>
                  {agentSpecificLedger.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
                      No commission ledger entries recorded for {viewingAgentLedger.full_name} matching filter.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', background: 'var(--bg-surface)' }}>
                          <th style={{ padding: '10px 16px' }}>Date & Ref</th>
                          <th style={{ padding: '10px 16px' }}>Client</th>
                          <th style={{ padding: '10px 16px' }}>Service Facilitated</th>
                          <th style={{ padding: '10px 16px' }}>Client Paid</th>
                          <th style={{ padding: '10px 16px' }}>Commission Earned</th>
                          <th style={{ padding: '10px 16px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agentSpecificLedger.map((c) => (
                          <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '10px 16px' }}>
                              <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8rem' }}>
                                {new Date(c.created_at).toLocaleDateString()}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {c.service_reference || c.id.slice(0, 8)}
                              </div>
                            </td>

                            <td style={{ padding: '10px 16px' }}>
                              <div style={{ color: '#ffffff', fontWeight: 600 }}>{c.client_name || 'Walk-in Client'}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                {c.client_phone || '—'}
                              </div>
                            </td>

                            <td style={{ padding: '10px 16px', color: 'var(--text-secondary)' }}>
                              {c.service_type === 'BOOKING' && 'Practical Driving Booking'}
                              {c.service_type === 'SUBSCRIPTION' && 'Premium Video Subscription'}
                              {c.service_type === 'COURSE_ENROLLMENT' && 'Course Enrollment'}
                              {c.service_type === 'EXAM_PURCHASE' && 'Theory Exam Purchase'}
                              {c.service_type === 'LEARNING_FEE' && 'Tuition Fee'}
                              {c.service_type === 'OTHER' && 'Other Service'}
                            </td>

                            <td style={{ padding: '10px 16px', color: '#ffffff' }}>
                              {c.amount_paid_by_client_rwf.toLocaleString()} RWF
                            </td>

                            <td style={{ padding: '10px 16px', fontWeight: 700, color: '#10b981' }}>
                              +{c.commission_amount_rwf.toLocaleString()} RWF
                            </td>

                            <td style={{ padding: '10px 16px' }}>
                              {c.status === 'ACCRUED' ? (
                                <Badge variant="warning">ACCRUED</Badge>
                              ) : (
                                <Badge variant="success">PAID OUT</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Footer Bar */}
                <div
                  style={{
                    padding: '10px 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    fontSize: '0.76rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div>
                    Showing {agentSpecificLedger.length} of {commissionsLedger.filter((c) => c.agent === viewingAgentLedger.id || (viewingAgentLedger.agent_code && c.agent_code === viewingAgentLedger.agent_code)).length} transactions for {viewingAgentLedger.full_name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(viewingAgentLedger.pending_balance_rwf || 0) > 0 && (
                      <button
                        onClick={() => {
                          const target = viewingAgentLedger;
                          handleCloseAgentLedger();
                          handleOpenPayout(target);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.74rem', padding: '4px 12px' }}
                      >
                        Settle Payout ({(viewingAgentLedger.pending_balance_rwf || 0).toLocaleString()} RWF)
                      </button>
                    )}
                    <button
                      onClick={handleCloseAgentLedger}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.74rem', padding: '4px 12px' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SECTION 3: RATES */}
      {activeTab === 'rates' && (
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Service Commission Rates
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Configurable commission fees applied automatically when an agent facilitates a service.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {commissionRates.map((rate) => {
              const isEditing = editingRate?.id === rate.id;

              return (
                <div
                  key={rate.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'monospace' }}>
                        {rate.service_type}
                      </span>
                      <Badge variant="success">ACTIVE</Badge>
                    </div>

                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                      {rate.service_name}
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', margin: '10px 0' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Client Price</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
                          {rate.default_client_price_rwf.toLocaleString()} RWF
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Agent Commission</div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                          {rate.commission_fee_rwf.toLocaleString()} RWF
                        </div>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Commission Fee (RWF):</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="number"
                          value={newRateFee}
                          onChange={(e) => setNewRateFee(parseInt(e.target.value) || 0)}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-medium)',
                            color: '#ffffff',
                            fontSize: '0.82rem',
                          }}
                        />
                        <button
                          onClick={() => handleUpdateCommissionRate(rate, newRateFee)}
                          disabled={isSubmitting}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingRate(null)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingRate(rate);
                        setNewRateFee(rate.commission_fee_rwf);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', fontSize: '0.76rem', padding: '5px' }}
                    >
                      Edit Rate
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. MODAL: Create Staff / Agent */}
      {isCreateStaffModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                {newRole === 'AGENT' ? 'Register Sifo Drive Agent' : 'Create Staff Member'}
              </h3>
              <button onClick={() => setIsCreateStaffModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Role Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                >
                  <option value="TUTOR">TUTOR (Curriculum & Class Instruction)</option>
                  <option value="AGENT">AGENT (Field Kiosk & Service Concierge)</option>
                  <option value="TRAINING_ADMIN">TRAINING ADMIN (Course Operations)</option>
                  <option value="BOARD_REVIEWER">BOARD REVIEWER (Exam Review)</option>
                  <option value="ENTERPRISE_ADMIN">DRIVING SCHOOL ADMIN (Enterprise)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+250788123456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontFamily: 'monospace', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Email</label>
                  <input
                    type="email"
                    placeholder="staff@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              {/* Agent Specific Fields */}
              {newRole === 'AGENT' && (
                <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Agent Kiosk Details</div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>Business / Agency Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Remera Kiosk"
                      value={newBusinessName}
                      onChange={(e) => setNewBusinessName(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>District</label>
                      <input
                        type="text"
                        placeholder="e.g. Gasabo"
                        value={newDistrict}
                        onChange={(e) => setNewDistrict(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>Sector</label>
                      <input
                        type="text"
                        placeholder="e.g. Remera"
                        value={newSector}
                        onChange={(e) => setNewSector(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Enterprise Specific Field */}
              {newRole === 'ENTERPRISE_ADMIN' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Driving School Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Inyange Driving Academy"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Password (Default: Staff@123456)</label>
                <input
                  type="password"
                  placeholder="Leave empty for default password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsCreateStaffModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Edit Staff / Agent */}
      {isEditStaffModalOpen && selectedStaff && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  Edit {selectedStaff.role}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {selectedStaff.phone_number} {selectedStaff.agent_code ? `(${selectedStaff.agent_code})` : ''}
                </span>
              </div>
              <button onClick={() => setIsEditStaffModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>First Name</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Last Name</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                />
              </div>

              {selectedStaff.role === 'AGENT' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Business / Agency Name</label>
                    <input
                      type="text"
                      value={editBusinessName}
                      onChange={(e) => setEditBusinessName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>District</label>
                      <input
                        type="text"
                        value={editDistrict}
                        onChange={(e) => setEditDistrict(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Sector</label>
                      <input
                        type="text"
                        value={editSector}
                        onChange={(e) => setEditSector(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                      />
                    </div>
                  </div>
                </>
              )}

              {selectedStaff.role === 'ENTERPRISE_ADMIN' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Driving School</label>
                  <input
                    type="text"
                    value={editSchoolName}
                    onChange={(e) => setEditSchoolName(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.84rem' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsEditStaffModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: Settle 30-Day Monthly Payout */}
      {isPayoutModalOpen && selectedStaff && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border-medium)', background: 'var(--bg-surface)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  Settle 30-Day Payout
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Agent: {selectedStaff.full_name} ({selectedStaff.agent_code || selectedStaff.phone_number})
                </span>
              </div>
              <button onClick={() => setIsPayoutModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProcessPayout} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Unpaid Balance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                  {(selectedStaff.pending_balance_rwf || 0).toLocaleString()} RWF
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Payout Amount (RWF) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedStaff.pending_balance_rwf || undefined}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Settlement Notes</label>
                <textarea
                  rows={2}
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#ffffff', fontSize: '0.82rem', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsPayoutModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm">
                  {isSubmitting ? 'Settling...' : 'Confirm Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
