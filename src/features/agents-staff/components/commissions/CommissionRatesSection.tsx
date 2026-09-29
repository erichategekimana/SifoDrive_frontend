import React from 'react';
import { Badge } from '../../../../components/common/Badge';
import type { ServiceCommissionConfigItem } from '../../types';

interface CommissionRatesSectionProps {
  commissionRates: ServiceCommissionConfigItem[];
  editingRate: ServiceCommissionConfigItem | null;
  setEditingRate: (rate: ServiceCommissionConfigItem | null) => void;
  newRateFee: number;
  setNewRateFee: (fee: number) => void;
  isSubmitting: boolean;
  onUpdateCommissionRate: (rate: ServiceCommissionConfigItem, newFee: number) => void;
}

export const CommissionRatesSection: React.FC<CommissionRatesSectionProps> = ({
  commissionRates,
  editingRate,
  setEditingRate,
  newRateFee,
  setNewRateFee,
  isSubmitting,
  onUpdateCommissionRate,
}) => {
  return (
    <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', padding: '20px', border: '1px solid var(--border-subtle)' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
          Commission Rates
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Agent commission fees per service.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
        {commissionRates.map((rate) => {
          const isEditing = editingRate?.id === rate.id;

          return (
            <div
              key={rate.id}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', fontFamily: 'monospace' }}>
                    {rate.service_type}
                  </h4>
                  <Badge variant="success">ACTIVE</Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.2)', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Client Price</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
                      {rate.default_client_price_rwf.toLocaleString()} RWF
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Commission</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                      {rate.commission_fee_rwf.toLocaleString()} RWF
                    </div>
                  </div>
                </div>
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Commission (RWF):</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      value={newRateFee}
                      onChange={(e) => setNewRateFee(parseInt(e.target.value) || 0)}
                      style={{
                        flex: 1,
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-medium)',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                      }}
                    />
                    <button
                      onClick={() => onUpdateCommissionRate(rate, newRateFee)}
                      disabled={isSubmitting}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingRate(null)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingRate(rate);
                    setNewRateFee(rate.commission_fee_rwf);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', fontSize: '0.76rem', padding: '5px' }}
                >
                  Edit Rate
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
