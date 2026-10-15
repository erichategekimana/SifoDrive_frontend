import React from 'react';
import {
  useAdminUsersData,
  UserFiltersBar,
  UserTable,
  CreateUserModal,
  ChangeRoleModal,
  InspectUserModal,
} from '../../../features/users';
import { UsersHeader } from './UsersHeader';

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
      <UsersHeader
        onRefresh={fetchUsers}
        onCreateAccount={() => setIsCreateModalOpen(true)}
        isLoading={isLoading}
      />

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
