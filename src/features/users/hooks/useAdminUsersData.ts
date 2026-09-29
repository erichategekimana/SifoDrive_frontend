import { useState, useEffect } from 'react';
import {
  AdminService,
  type AdminUserItem,
  type PaginatedResult,
} from '../../../core/services/AdminService';
import { useToast } from '../../../context/ToastContext';

export const useAdminUsersData = () => {
  const [usersData, setUsersData] = useState<PaginatedResult<AdminUserItem>>({ count: 0, results: [] });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);

  // Modals state
  const [inspectUser, setInspectUser] = useState<AdminUserItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUserItem | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>('TUTOR');

  // Create User Form State
  const [newUserPhone, setNewUserPhone] = useState<string>('');
  const [newUserFirstName, setNewUserFirstName] = useState<string>('');
  const [newUserLastName, setNewUserLastName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<string>('TUTOR');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [newUserSchoolName, setNewUserSchoolName] = useState<string>('');
  const [newUserQuota, setNewUserQuota] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers({
        role: roleFilter,
        status: statusFilter,
        search: searchTerm.trim() || undefined,
        page,
      });
      setUsersData(data);
    } catch (err) {
      console.error('Failed to load user directory:', err);
      setUsersData({ count: 0, results: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserPhone.trim() || !newUserFirstName.trim() || !newUserLastName.trim() || !newUserPassword) {
      warning('Please fill in all required fields.');
      return;
    }

    if (newUserRole === 'SYSTEM_ADMIN') {
      toastError('Creating a System Admin account is prohibited through this portal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await adminService.createUser({
        phone_number: newUserPhone.trim(),
        first_name: newUserFirstName.trim(),
        last_name: newUserLastName.trim(),
        email: newUserEmail.trim() || undefined,
        role: newUserRole,
        password: newUserPassword,
        school_name: newUserRole === 'ENTERPRISE_ADMIN' ? newUserSchoolName.trim() : undefined,
        station_quota: newUserRole === 'ENTERPRISE_ADMIN' ? newUserQuota : undefined,
      });

      success(`Account created successfully for ${created.full_name || created.first_name} (${created.role}).`);
      setIsCreateModalOpen(false);
      // Reset form
      setNewUserPhone('');
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserEmail('');
      setNewUserRole('TUTOR');
      setNewUserPassword('');
      setNewUserSchoolName('');
      setNewUserQuota(10);
      fetchUsers();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleChangeUser) return;

    if (selectedNewRole === 'SYSTEM_ADMIN') {
      toastError('Cannot elevate any account to System Admin.');
      return;
    }

    if (roleChangeUser.role === 'SYSTEM_ADMIN') {
      toastError('Cannot modify the role of a System Admin account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await adminService.updateUserRole(roleChangeUser.id, selectedNewRole);
      success(`Role for ${updated.full_name || updated.phone_number} changed to ${updated.role}.`);
      setRoleChangeUser(null);
      if (inspectUser?.id === roleChangeUser.id) {
        setInspectUser((prev) => (prev ? { ...prev, role: updated.role } : null));
      }
      fetchUsers();
    } catch (err: any) {
      toastError(err?.message || 'Failed to change role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    targetUser: AdminUserItem,
    newStatus: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED' | 'BLACKLISTED'
  ) => {
    if (targetUser.role === 'SYSTEM_ADMIN') {
      toastError('Cannot alter status of a System Admin account.');
      return;
    }

    let confirmMsg = `Are you sure you want to change status of ${targetUser.full_name || targetUser.phone_number} to ${newStatus}?`;
    if (newStatus === 'BLACKLISTED') {
      confirmMsg = `WARNING: Blacklisting ${targetUser.full_name || targetUser.phone_number} will permanently revoke platform access and bar their phone number. Proceed?`;
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      const updated = await adminService.updateUserStatus(targetUser.id, newStatus);
      success(`User ${updated.full_name || updated.phone_number} is now ${updated.status}.`);
      if (inspectUser?.id === targetUser.id) {
        setInspectUser((prev) => (prev ? { ...prev, status: updated.status } : null));
      }
      fetchUsers();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update account status.');
    }
  };

  return {
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
  };
};
