import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  AdminService,
  type BookingOrderItem,
  type CategoryPricingItem,
  type PaginatedResult,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

export const AdminBookingsPage: React.FC = () => {
  const [ordersData, setOrdersData] = useState<PaginatedResult<BookingOrderItem>>({ count: 0, results: [] });
  const [pricing, setPricing] = useState<CategoryPricingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'PRICING'>('ORDERS');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected Order for Action Dialog
  const [actionOrder, setActionOrder] = useState<BookingOrderItem | null>(null);
  const [actionType, setActionType] = useState<'ASSIGN' | 'STATUS' | 'COMPLETE' | null>(null);
  const [agentId, setAgentId] = useState<string>('');
  const [nextStatus, setNextStatus] = useState<string>('SUBMITTED');
  const [applicationNumber, setApplicationNumber] = useState<string>('');
  const [billId, setBillId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, error: toastError } = useToast();

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Irembo Booking Operations
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Concierge pipeline for provisional and definitive driving test registration with Rwanda National Police.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

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
          {/* Filter Bar */}
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 300px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  placeholder="Search applicant name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Filter
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} color="var(--text-muted)" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="CODE_GENERATED">Code Generated</option>
                <option value="PAID">Paid</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <Spinner message="Loading Irembo orders from backend..." />
              </div>
            ) : ordersData.results.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No booking orders found for the selected criteria.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Applicant</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>District</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>App Code / Bill</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Agent</th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersData.results.map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {order.applicant_name || 'Learner'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.applicant_phone}</div>
                        </td>

                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary-light)' }}>
                          Cat {order.category}
                        </td>

                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          {order.district}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <Badge
                            variant={
                              order.status === 'COMPLETED'
                                ? 'success'
                                : order.status === 'PAID'
                                ? 'info'
                                : order.status === 'PENDING'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {order.status}
                          </Badge>
                        </td>

                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                          {order.application_number ? (
                            <div>
                              <span style={{ color: 'var(--text-primary)' }}>{order.application_number}</span>
                              {order.bill_id && (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                                  Bill: {order.bill_id}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                          {order.assigned_agent?.full_name || (
                            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => {
                                setActionOrder(order);
                                setActionType('STATUS');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            >
                              Status
                            </button>
                            <button
                              onClick={() => {
                                setActionOrder(order);
                                setActionType('COMPLETE');
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                            >
                              Complete
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
        </>
      ) : (
        /* Pricing Setup Tab */
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Official Rwanda Driving License Categories & Fees
          </h3>

          {pricing.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '36px' }}>
              No category fees returned from `/api/v1/booking/pricing/`.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Category</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Name</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Irembo Base Fee</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Service Concierge Fee</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Total Amount (RWF)</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--primary-light)' }}>
                        Category {p.category_code}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.category_name}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{p.base_fee_rwf?.toLocaleString()} RWF</td>
                      <td style={{ padding: '12px 16px' }}>{p.service_fee_rwf?.toLocaleString()} RWF</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--accent-500)' }}>
                        {p.total_fee_rwf?.toLocaleString()} RWF
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Action Dialog Modal */}
      {actionOrder && actionType && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: 'var(--radius-2xl)',
              padding: '28px',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {actionType === 'STATUS' ? 'Update Order Status' : 'Register Irembo Slot'}
              </h3>
              <button
                onClick={() => setActionOrder(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleExecuteAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {actionType === 'ASSIGN' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Agent ID / User UUID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. usr-agent-001"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              ) : actionType === 'STATUS' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    New Status
                  </label>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="CODE_GENERATED">CODE_GENERATED</option>
                    <option value="PAID">PAID</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Irembo Application Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 240912-IREMBO-099"
                      value={applicationNumber}
                      onChange={(e) => setApplicationNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      RRA / Irembo Bill ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BILL-99201"
                      value={billId}
                      onChange={(e) => setBillId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setActionOrder(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Saving...' : 'Save & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
