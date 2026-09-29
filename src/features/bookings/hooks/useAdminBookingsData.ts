import { useState, useEffect, useCallback } from 'react';
import {
  AdminService,
  type BookingOrderItem,
  type CategoryPricingItem,
  type PaginatedResult,
} from '../../../core/services/AdminService';
import { useToast } from '../../../context/ToastContext';
import type { BookingsTab, BookingActionType } from '../types';

export const useAdminBookingsData = () => {
  const [ordersData, setOrdersData] = useState<PaginatedResult<BookingOrderItem>>({ count: 0, results: [] });
  const [pricing, setPricing] = useState<CategoryPricingItem[]>([]);
  const [activeTab, setActiveTab] = useState<BookingsTab>('ORDERS');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected Order for Action Dialog
  const [actionOrder, setActionOrder] = useState<BookingOrderItem | null>(null);
  const [actionType, setActionType] = useState<BookingActionType | null>(null);
  const [agentId, setAgentId] = useState<string>('');
  const [nextStatus, setNextStatus] = useState<string>('SUBMITTED');
  const [applicationNumber, setApplicationNumber] = useState<string>('');
  const [billId, setBillId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, error: toastError } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, pricingRes] = await Promise.allSettled([
        adminService.getBookingOrders({
          status: statusFilter,
          search: searchTerm.trim() || undefined,
        }),
        adminService.getCategoryPricing(),
      ]);

      if (ordersRes.status === 'fulfilled') setOrdersData(ordersRes.value);
      if (pricingRes.status === 'fulfilled') setPricing(pricingRes.value);
    } catch (err) {
      console.error('Failed to load booking orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionOrder || !actionType) return;

    setIsSubmitting(true);
    try {
      if (actionType === 'ASSIGN') {
        if (!agentId.trim()) throw new Error('Agent ID is required.');
        await adminService.assignBookingAgent(actionOrder.id, agentId.trim());
        success('Assigned concierge agent to order.');
      } else if (actionType === 'STATUS') {
        await adminService.updateBookingStatus(actionOrder.id, { status: nextStatus });
        success(`Order marked as ${nextStatus}.`);
      } else if (actionType === 'COMPLETE') {
        if (!applicationNumber.trim()) throw new Error('Application Number is required.');
        await adminService.completeBookingOrder(actionOrder.id, {
          application_number: applicationNumber.trim(),
          bill_id: billId.trim() || undefined,
        });
        success('Irembo application slot registered.');
      }

      setActionOrder(null);
      setActionType(null);
      loadData();
    } catch (err: any) {
      toastError(err?.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAction = (order: BookingOrderItem, type: BookingActionType) => {
    setActionOrder(order);
    setActionType(type);
  };

  const closeAction = () => {
    setActionOrder(null);
    setActionType(null);
  };

  return {
    ordersData,
    pricing,
    activeTab,
    setActiveTab,
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    isLoading,
    actionOrder,
    actionType,
    agentId,
    setAgentId,
    nextStatus,
    setNextStatus,
    applicationNumber,
    setApplicationNumber,
    billId,
    setBillId,
    isSubmitting,
    loadData,
    handleSearch,
    handleExecuteAction,
    openAction,
    closeAction,
  };
};
