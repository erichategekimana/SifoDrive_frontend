import React from 'react';
import { CalendarClock, Clock } from 'lucide-react';
import type { OperationalRules } from '../types';

interface OperationalRulesSectionProps {
  rules: OperationalRules;
  setRules: React.Dispatch<React.SetStateAction<OperationalRules>>;
}

export const OperationalRulesSection: React.FC<OperationalRulesSectionProps> = ({
  rules,
  setRules,
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <CalendarClock size={18} color="#94a3b8" />
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Booking Quotas & Deadlines</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Max Practical Lessons a Student Can Book Per Week
            </label>
            <input
              type="number"
              min={1}
              max={7}
              value={rules.maxLessonsPerWeek}
              onChange={(e) => setRules({ ...rules, maxLessonsPerWeek: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
              Prevents single students from monopolizing limited car hours.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Minimum Advance Notice Required (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={48}
              value={rules.minAdvanceBookingHours}
              onChange={(e) => setRules({ ...rules, minAdvanceBookingHours: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
              Students cannot book slots starting within this cutoff window.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Free Cancellation Cutoff (Hours Before Lesson)
            </label>
            <input
              type="number"
              min={2}
              max={24}
              value={rules.cancellationCutoffHours}
              onChange={(e) => setRules({ ...rules, cancellationCutoffHours: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
              Cancellations within this period incur the late cancellation penalty.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Max Active Upcoming Bookings
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={rules.maxConcurrentBookings}
              onChange={(e) => setRules({ ...rules, maxConcurrentBookings: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="glass-panel"
        style={{
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Clock size={18} color="#94a3b8" />
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Working Hours & Resources</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                School Opens At
              </label>
              <input
                type="time"
                value={rules.openingTime}
                onChange={(e) => setRules({ ...rules, openingTime: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                School Closes At
              </label>
              <input
                type="time"
                value={rules.closingTime}
                onChange={(e) => setRules({ ...rules, closingTime: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Max Teaching Hours Per Instructor Daily
            </label>
            <input
              type="number"
              min={4}
              max={10}
              value={rules.maxInstructorHoursPerDay}
              onChange={(e) => setRules({ ...rules, maxInstructorHoursPerDay: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
              Enforces fatigue management and instructor safety policies.
            </div>
          </div>

          <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Transmission Preference Choice</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Allow students to choose Manual vs Automatic car</div>
              </div>
              <input
                type="checkbox"
                checked={rules.allowTransmissionChoice}
                onChange={(e) => setRules({ ...rules, allowTransmissionChoice: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Saturday Operations</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Accept student bookings on Saturdays</div>
              </div>
              <input
                type="checkbox"
                checked={rules.openOnSaturdays}
                onChange={(e) => setRules({ ...rules, openOnSaturdays: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
