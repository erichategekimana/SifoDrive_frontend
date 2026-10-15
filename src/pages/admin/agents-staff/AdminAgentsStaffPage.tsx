import React from 'react';
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
} from '../../../features/agents-staff';
import { AgentsStaffHeader } from './AgentsStaffHeader';
import { AgentsStaffTabsNav } from './AgentsStaffTabsNav';

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
      <AgentsStaffHeader
        activeTab={activeTab}
        onAddStaff={() => {
          setNewRole('TUTOR');
          setIsCreateStaffModalOpen(true);
        }}
        onAddAgent={() => {
          setNewRole('AGENT');
          setIsCreateStaffModalOpen(true);
        }}
      />

      {/* 2. Main Section Tabs */}
      <AgentsStaffTabsNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        totalStaffCount={totalStaffCount}
        totalAgentCount={totalAgentCount}
        ratesCount={commissionRates.length}
      />

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

      {/* MODAL: Create Staff / Agent */}
      <CreateStaffModal
        isOpen={isCreateStaffModalOpen}
        onClose={() => setIsCreateStaffModalOpen(false)}
        onSubmit={handleCreateStaff}
        isSubmitting={isSubmitting}
        newRole={newRole}
        setNewRole={setNewRole}
        newPhone={newPhone}
        setNewPhone={setNewPhone}
        newFirstName={newFirstName}
        setNewFirstName={setNewFirstName}
        newLastName={newLastName}
        setNewLastName={setNewLastName}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
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
      />

      {/* MODAL: Edit Staff */}
      <EditStaffModal
        isOpen={isEditStaffModalOpen}
        onClose={() => setIsEditStaffModalOpen(false)}
        onSubmit={handleSaveEdit}
        isSubmitting={isSubmitting}
        selectedStaff={selectedStaff}
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

      {/* MODAL: Payout Modal */}
      <AgentPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        onSubmit={handleProcessPayout}
        isSubmitting={isSubmitting}
        selectedStaff={selectedStaff}
        payoutAmount={payoutAmount}
        setPayoutAmount={setPayoutAmount}
        payoutNotes={payoutNotes}
        setPayoutNotes={setPayoutNotes}
      />
    </div>
  );
};

export default AdminAgentsStaffPage;
