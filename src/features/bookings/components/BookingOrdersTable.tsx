import React from 'react';
import { Badge } from '../../../components/common/Badge';
import { Spinner } from '../../../components/common/Spinner';
import type { BookingOrderItem, PaginatedResult } from '../../../core/services/AdminService';
import type { BookingActionType } from '../types';

interface BookingOrdersTableProps {
  ordersData: PaginatedResult<BookingOrderItem>;
  isLoading: boolean;
  onOpenAction: (order: BookingOrderItem, type: BookingActionType) => void;
}

export const BookingOrdersTable: React.FC<BookingOrdersTableProps> = ({
  ordersData,
  isLoading,
  onOpenAction,
}) => {
  return (
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
                        onClick={() => onOpenAction(order, 'STATUS')}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        Status
                      </button>
                      <button
                        onClick={() => onOpenAction(order, 'COMPLETE')}
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
  );
};
