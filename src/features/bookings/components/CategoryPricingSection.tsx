import React from 'react';
import type { CategoryPricingItem } from '../../../core/services/AdminService';

interface CategoryPricingSectionProps {
  pricing: CategoryPricingItem[];
}

export const CategoryPricingSection: React.FC<CategoryPricingSectionProps> = ({ pricing }) => {
  return (
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
  );
};
