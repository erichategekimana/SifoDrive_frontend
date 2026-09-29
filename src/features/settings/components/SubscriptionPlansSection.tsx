import React from 'react';
import {
  Sparkles,
  Minus,
  Plus,
  Check,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import type { SubscriptionPlan, GuestTrialConfig } from '../types';

interface SubscriptionPlansSectionProps {
  plans: SubscriptionPlan[];
  guestTrialConfig: GuestTrialConfig;
  setGuestTrialConfig: React.Dispatch<React.SetStateAction<GuestTrialConfig>>;
  bundleCount: number;
  setBundleCount: React.Dispatch<React.SetStateAction<number>>;
  calculateBundlePrice: (count: number, unitPrice?: number) => {
    count: number;
    rawTotal: number;
    discountPercent: number;
    discountAmount: number;
    finalTotal: number;
    unitEffective: number;
  };
  handlePlanPriceChange: (id: string, newPrice: number) => void;
  handleTogglePlan: (id: string) => void;
  formatRwf: (val: number) => string;
}

export const SubscriptionPlansSection: React.FC<SubscriptionPlansSectionProps> = ({
  plans,
  guestTrialConfig,
  setGuestTrialConfig,
  bundleCount,
  setBundleCount,
  calculateBundlePrice,
  handlePlanPriceChange,
  handleTogglePlan,
  formatRwf,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        className="glass-panel"
        style={{
          padding: '20px 24px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            Subscription & Access Packages
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '3px' }}>
            Manage pricing, durations, and active status for online study passes and corporate tiers.
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600 }}>
          {plans.filter((p) => p.isActive).length} of {plans.length} Plans Active
        </div>
      </div>

      {/* Guest Onboarding & Free Trial Configuration Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          background: 'rgba(56, 189, 248, 0.03)',
          borderLeft: '4px solid #38bdf8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="#38bdf8" />
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
            Guest Onboarding & Flexible Multi-Exam Bundle Rules
          </span>
        </div>
        <p style={{ margin: '0 0 18px 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
          Guests can create an account and immediately receive <strong style={{ color: '#ffffff' }}>1 Free Trial Mock Exam</strong>. Users can adjust their bundle with <strong style={{ color: '#38bdf8' }}>+</strong> and <strong style={{ color: '#38bdf8' }}>-</strong> to buy any number of exams. Buying <strong style={{ color: '#34d399' }}>more than 5 exams grants a 5% discount</strong>, and <strong style={{ color: '#34d399' }}>more than 10 exams grants a 10% discount</strong>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Free Trial on Registration
            </label>
            <input
              type="number"
              min={0}
              max={5}
              value={guestTrialConfig.freeTrialExamsOnSignup}
              onChange={(e) =>
                setGuestTrialConfig({ ...guestTrialConfig, freeTrialExamsOnSignup: Number(e.target.value) })
              }
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 700,
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
              Auto-credited to new registered users.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Base Price per Single Exam (RWF)
            </label>
            <input
              type="number"
              step={100}
              value={guestTrialConfig.singleExamPrice}
              onChange={(e) => {
                const val = Number(e.target.value);
                setGuestTrialConfig({ ...guestTrialConfig, singleExamPrice: val });
                handlePlanPriceChange('plan_single_exam', val);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 700,
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
              Base unit price for 1 exam sitting.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Tier 1 Discount (&gt; 5 Exams)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min={1}
                max={50}
                value={guestTrialConfig.tier1DiscountPercent}
                onChange={(e) =>
                  setGuestTrialConfig({ ...guestTrialConfig, tier1DiscountPercent: Number(e.target.value) })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.86rem', color: '#94a3b8', fontWeight: 700 }}>%</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
              Applied when user selects &gt; 5 exams.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Tier 2 Discount (&gt; 10 Exams)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min={1}
                max={50}
                value={guestTrialConfig.tier2DiscountPercent}
                onChange={(e) =>
                  setGuestTrialConfig({ ...guestTrialConfig, tier2DiscountPercent: Number(e.target.value) })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '0.86rem', color: '#94a3b8', fontWeight: 700 }}>%</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
              Applied when user selects &gt; 10 exams.
            </div>
          </div>
        </div>

        {/* Quick bundle preset chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Quick Test Bundles:</span>
          {[
            { count: 1, label: '1 Exam (500 RWF)' },
            { count: 3, label: '3 Exams (1,500 RWF)' },
            { count: 6, label: '6 Exams (5% OFF → 2,850 RWF)' },
            { count: 12, label: '12 Exams (10% OFF → 5,400 RWF)' },
          ].map((chip) => (
            <button
              key={chip.count}
              type="button"
              onClick={() => setBundleCount(chip.count)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: bundleCount === chip.count ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                background: bundleCount === chip.count ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: bundleCount === chip.count ? '#38bdf8' : '#cbd5e1',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#ffffff', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={guestTrialConfig.allowGuestPayAsYouGo}
              onChange={(e) => setGuestTrialConfig({ ...guestTrialConfig, allowGuestPayAsYouGo: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Allow Guest Self-Checkout (MoMo / Airtel)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#ffffff', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={guestTrialConfig.creditsNeverExpire}
              onChange={(e) => setGuestTrialConfig({ ...guestTrialConfig, creditsNeverExpire: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Exam Credits Never Expire (Valid until used)
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: plan.isActive ? '1px solid var(--border-subtle)' : '1px dashed rgba(255, 255, 255, 0.1)',
              background: plan.isActive ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              opacity: plan.isActive ? 1 : 0.6,
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>
                    {plan.category}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                    {plan.name}
                  </div>
                </div>
                {plan.badge && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    {plan.badge}
                  </span>
                )}
              </div>

              {plan.id === 'plan_single_exam' ? (
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
                      Select Bundle Size (+ / -)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                      Base: {formatRwf(guestTrialConfig.singleExamPrice)}
                    </span>
                  </div>

                  {/* Interactive + and - stepper */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '10px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setBundleCount((prev) => Math.max(1, prev - 1))}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Minus size={15} />
                    </button>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                        {bundleCount} {bundleCount === 1 ? 'Exam' : 'Exams'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                        {bundleCount > 10 ? '10% Discount Applied' : bundleCount > 5 ? '5% Discount Applied' : 'Standard Rate'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBundleCount((prev) => Math.min(50, prev + 1))}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Calculated total card */}
                  {(() => {
                    const calc = calculateBundlePrice(bundleCount);
                    return (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(56, 189, 248, 0.06)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                            Auto-Calculated Price
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '1px' }}>
                            {formatRwf(calc.finalTotal)}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
                            {calc.unitEffective} RWF / exam sitting
                          </div>
                        </div>
                        {calc.discountPercent > 0 && (
                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              {calc.discountPercent}% OFF
                            </span>
                            <div style={{ fontSize: '0.68rem', color: '#10b981', marginTop: '2px' }}>
                              Saved {formatRwf(calc.discountAmount)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>
                    Price (RWF) / Duration
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      step={500}
                      value={plan.price}
                      onChange={(e) => handlePlanPriceChange(plan.id, Number(e.target.value))}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: 800,
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      / {plan.interval}
                    </span>
                  </div>
                </div>
              )}

              {/* Feature list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                {plan.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                    <Check size={14} color="#38bdf8" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.78rem', color: plan.isActive ? '#ffffff' : '#64748b', fontWeight: 600 }}>
                {plan.isActive ? 'Active on Student Portal' : 'Disabled (Hidden)'}
              </span>
              <button
                onClick={() => handleTogglePlan(plan.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: plan.isActive ? '#38bdf8' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {plan.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
