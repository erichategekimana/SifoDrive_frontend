import React from 'react';
import { Plus } from 'lucide-react';
import {
  useAgentsStaffData,
  StaffSection,
  StaffAuditModal,
  CreateStaffModal,
  EditStaffModal,
  AgentDirectorySection,
  AgentLedgerModal,
  AgentPayoutModal,
  CommissionRatesSection,
} from '../../features/agents-staff';

export const AdminAgentsStaffPage: React.FC = () => {
  const {
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
  } = useAgentsStaffData();

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

      {/* 3. Section 1: Staffs */}
      {activeTab === 'staffs' && (
        <StaffSection
          staffList={filteredStaffList}
          isLoading={isLoading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          staffRoleFilter={staffRoleFilter}
          setStaffRoleFilter={setStaffRoleFilter}
          onAuditStaff={handleAuditStaff}
          onOpenEdit={handleOpenEdit}
          onToggleStaffActive={handleToggleStaffActive}
        />
      )}

      {/* 4. Section 2: Agents */}
      {activeTab === 'agents' && (
        <AgentDirectorySection
          agentSubTab={agentSubTab}
          setAgentSubTab={setAgentSubTab}
          filteredAgentList={filteredAgentList}
          commissionsLedger={commissionsLedger}
          filteredLedger={filteredLedger}
          selectedAgentFilter={selectedAgentFilter}
          setSelectedAgentFilter={setSelectedAgentFilter}
          staffList={staffList}
          totalAgentCount={totalAgentCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoading={isLoading}
          onViewAgentLedger={handleViewAgentLedger}
          onOpenPayout={handleOpenPayout}
          onOpenEdit={handleOpenEdit}
          onToggleStaffActive={handleToggleStaffActive}
        />
      )}

      {/* 5. Section 3: Commission Rates */}
      {activeTab === 'rates' && (
        <CommissionRatesSection
          commissionRates={commissionRates}
          editingRate={editingRate}
          setEditingRate={setEditingRate}
          newRateFee={newRateFee}
          setNewRateFee={setNewRateFee}
          isSubmitting={isSubmitting}
          onUpdateCommissionRate={handleUpdateCommissionRate}
        />
      )}

      {/* MODAL: Staff Activity Audit */}
      <StaffAuditModal
        auditingStaff={auditingStaff}
        staffList={staffList}
        staffAuditLogs={staffAuditLogs}
        filteredStaffAuditLogs={filteredStaffAuditLogs}
        isAuditLoading={isAuditLoading}
        auditSearchQuery={auditSearchQuery}
        setAuditSearchQuery={setAuditSearchQuery}
        auditSeverityFilter={auditSeverityFilter}
        setAuditSeverityFilter={setAuditSeverityFilter}
        onAuditStaff={handleAuditStaff}
        onClose={handleCloseAudit}
        onRefreshAudit={handleRefreshAudit}
      />

      {/* MODAL: Individual Agent Commission Ledger */}
      <AgentLedgerModal
        agentLedgerModal={agentLedgerModal}
        agentModalLedger={agentModalLedger}
        commissionsLedger={commissionsLedger}
        agentModalSearchQuery={agentModalSearchQuery}
        setAgentModalSearchQuery={setAgentModalSearchQuery}
        onClose={handleCloseAgentLedgerModal}
        onOpenPayout={handleOpenPayout}
      />

      {/* MODAL: Create Staff / Agent */}
      <CreateStaffModal
        isOpen={isCreateStaffModalOpen}
        onClose={() => setIsCreateStaffModalOpen(false)}
        onSubmit={handleCreateStaff}
        isSubmitting={isSubmitting}
        newRole={newRole}
        setNewRole={setNewRole}
        newFirstName={newFirstName}
        setNewFirstName={setNewFirstName}
        newLastName={newLastName}
        setNewLastName={setNewLastName}
        newPhone={newPhone}
        setNewPhone={setNewPhone}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        newBusinessName={newBusinessName}
        setNewBusinessName={setNewBusinessName}
        newNationalId={newNationalId}
        setNewNationalId={setNewNationalId}
        newDistrict={newDistrict}
        setNewDistrict={setNewDistrict}
        newSector={newSector}
        setNewSector={setNewSector}
        newSchoolName={newSchoolName}
        setNewSchoolName={setNewSchoolName}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
      />

      {/* MODAL: Edit Staff / Agent */}
      <EditStaffModal
        isOpen={isEditStaffModalOpen}
        selectedStaff={selectedStaff}
        onClose={() => setIsEditStaffModalOpen(false)}
        onSubmit={handleSaveEdit}
        isSubmitting={isSubmitting}
        editFirstName={editFirstName}
        setEditFirstName={setEditFirstName}
        editLastName={editLastName}
        setEditLastName={setEditLastName}
        editEmail={editEmail}
        setEditEmail={setEditEmail}
        editBusinessName={editBusinessName}
        setEditBusinessName={setEditBusinessName}
        editDistrict={editDistrict}
        setEditDistrict={setEditDistrict}
        editSector={editSector}
        setEditSector={setEditSector}
        editSchoolName={editSchoolName}
        setEditSchoolName={setEditSchoolName}
      />

      {/* MODAL: Settle 30-Day Monthly Payout */}
      <AgentPayoutModal
        isOpen={isPayoutModalOpen}
        selectedStaff={selectedStaff}
        onClose={() => setIsPayoutModalOpen(false)}
        onSubmit={handleProcessPayout}
        payoutAmount={payoutAmount}
        setPayoutAmount={setPayoutAmount}
        payoutNotes={payoutNotes}
        setPayoutNotes={setPayoutNotes}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AdminAgentsStaffPage;
