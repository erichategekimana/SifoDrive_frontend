import React from 'react';
import { RefreshCw, UserPlus } from 'lucide-react';
import {
  useAdminUsersData,
  UserFiltersBar,
  UserTable,
  CreateUserModal,
  ChangeRoleModal,
  InspectUserModal,
} from '../../features/users';

export const AdminUsersPage: React.FC = () => {
  const {
    usersData,
    isLoading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    inspectUser,
    setInspectUser,
    isCreateModalOpen,
    setIsCreateModalOpen,
    roleChangeUser,
    setRoleChangeUser,
    selectedNewRole,
    setSelectedNewRole,
    newUserPhone,
    setNewUserPhone,
    newUserFirstName,
    setNewUserFirstName,
    newUserLastName,
    setNewUserLastName,
    newUserEmail,
    setNewUserEmail,
    newUserRole,
    setNewUserRole,
    newUserPassword,
    setNewUserPassword,
    newUserSchoolName,
    setNewUserSchoolName,
    newUserQuota,
    setNewUserQuota,
    isSubmitting,
    fetchUsers,
    handleSearchSubmit,
    handleCreateUser,
    handleChangeRoleSubmit,
    handleStatusChange,
  } = useAdminUsersData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Title & Stats Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            User Directory
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            System-wide user registry, role governance, account lifecycle, and audit compliance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchUsers}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh user directory"
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={14} />
            <span>Create Account</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <UserFiltersBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setPage={setPage}
        handleSearchSubmit={handleSearchSubmit}
      />

      {/* User Directory Table */}
      <UserTable
        usersData={usersData}
        isLoading={isLoading}
        page={page}
        setPage={setPage}
        onInspect={(u) => setInspectUser(u)}
        onChangeRole={(u) => {
          setRoleChangeUser(u);
          setSelectedNewRole(u.role === 'SYSTEM_ADMIN' ? 'TUTOR' : u.role);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* 1. Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        isSubmitting={isSubmitting}
        newUserPhone={newUserPhone}
        setNewUserPhone={setNewUserPhone}
        newUserFirstName={newUserFirstName}
        setNewUserFirstName={setNewUserFirstName}
        newUserLastName={newUserLastName}
        setNewUserLastName={setNewUserLastName}
        newUserEmail={newUserEmail}
        setNewUserEmail={setNewUserEmail}
        newUserRole={newUserRole}
        setNewUserRole={setNewUserRole}
        newUserPassword={newUserPassword}
        setNewUserPassword={setNewUserPassword}
        newUserSchoolName={newUserSchoolName}
        setNewUserSchoolName={setNewUserSchoolName}
        newUserQuota={newUserQuota}
        setNewUserQuota={setNewUserQuota}
      />

      {/* 2. Change Role Modal */}
      <ChangeRoleModal
        roleChangeUser={roleChangeUser}
        onClose={() => setRoleChangeUser(null)}
        onSubmit={handleChangeRoleSubmit}
        selectedNewRole={selectedNewRole}
        setSelectedNewRole={setSelectedNewRole}
        isSubmitting={isSubmitting}
      />

      {/* 3. User Details Inspection Modal */}
      <InspectUserModal
        inspectUser={inspectUser}
        onClose={() => setInspectUser(null)}
        onStatusChange={handleStatusChange}
        onOpenRoleChange={(u) => {
          setRoleChangeUser(u);
          setSelectedNewRole(u.role === 'SYSTEM_ADMIN' ? 'TUTOR' : u.role);
        }}
      />
    </div>
  );
};

export default AdminUsersPage;
