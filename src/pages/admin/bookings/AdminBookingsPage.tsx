import React from 'react';
import {
  useAdminBookingsData,
  BookingsHeader,
  BookingFiltersBar,
  BookingOrdersTable,
  CategoryPricingSection,
  BookingActionDialog,
} from '../../../features/bookings';
import { BookingsTabsNav } from './BookingsTabsNav';

export const AdminBookingsPage: React.FC = () => {
  const {
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
  } = useAdminBookingsData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Actions */}
      <BookingsHeader
        isLoading={isLoading}
        onRefresh={loadData}
      />

      {/* Tabs */}
      <BookingsTabsNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ordersCount={ordersData.count}
      />

      {activeTab === 'ORDERS' ? (
        <>
          <BookingFiltersBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onSearch={handleSearch}
          />

          <BookingOrdersTable
            ordersData={ordersData}
            isLoading={isLoading}
            onOpenAction={openAction}
          />
        </>
      ) : (
        <CategoryPricingSection pricing={pricing} />
      )}

      {/* Action Dialog Modal */}
      <BookingActionDialog
        actionOrder={actionOrder}
        actionType={actionType}
        onClose={closeAction}
        onSubmit={handleExecuteAction}
        agentId={agentId}
        setAgentId={setAgentId}
        nextStatus={nextStatus}
        setNextStatus={setNextStatus}
        applicationNumber={applicationNumber}
        setApplicationNumber={setApplicationNumber}
        billId={billId}
        setBillId={setBillId}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AdminBookingsPage;
