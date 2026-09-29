import React from 'react';
import {
  useAdminBookingsData,
  BookingsHeader,
  BookingFiltersBar,
  BookingOrdersTable,
  CategoryPricingSection,
  BookingActionDialog,
} from '../../features/bookings';

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
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('ORDERS')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'ORDERS' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'ORDERS' ? 'var(--primary-light)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Active Applications ({ordersData.count})
        </button>
        <button
          onClick={() => setActiveTab('PRICING')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'PRICING' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'PRICING' ? 'var(--primary-light)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Category Pricing Setup
        </button>
      </div>

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
