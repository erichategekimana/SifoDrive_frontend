import React from 'react';
import { Building2 } from 'lucide-react';
import type { AcademyProfile } from '../types';

interface AcademyConfigSectionProps {
  academy: AcademyProfile;
  setAcademy: React.Dispatch<React.SetStateAction<AcademyProfile>>;
}

export const AcademyConfigSection: React.FC<AcademyConfigSectionProps> = ({
  academy,
  setAcademy,
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
          <Building2 size={18} color="#94a3b8" />
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Academy Credentials & Contacts</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Registered Driving School Name
            </label>
            <input
              type="text"
              value={academy.name}
              onChange={(e) => setAcademy({ ...academy, name: e.target.value })}
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
              RDB / Ministry Licensing Code
            </label>
            <input
              type="text"
              value={academy.licenseNumber}
              onChange={(e) => setAcademy({ ...academy, licenseNumber: e.target.value })}
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
              Main Support Helpline
            </label>
            <input
              type="text"
              value={academy.supportPhone}
              onChange={(e) => setAcademy({ ...academy, supportPhone: e.target.value })}
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
              WhatsApp Concierge Hotline
            </label>
            <input
              type="text"
              value={academy.whatsappPhone}
              onChange={(e) => setAcademy({ ...academy, whatsappPhone: e.target.value })}
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
              Official Email
            </label>
            <input
              type="email"
              value={academy.email}
              onChange={(e) => setAcademy({ ...academy, email: e.target.value })}
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
          <Building2 size={18} color="#94a3b8" />
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Branches & Training Grounds</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Primary Training Yard (Practical Driving)
            </label>
            <input
              type="text"
              value={academy.mainBranch}
              onChange={(e) => setAcademy({ ...academy, mainBranch: e.target.value })}
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
              Secondary Classroom Branch (Theory & Code)
            </label>
            <input
              type="text"
              value={academy.secondBranch}
              onChange={(e) => setAcademy({ ...academy, secondBranch: e.target.value })}
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
              Operational Schedule
            </label>
            <input
              type="text"
              value={academy.workingDaysLabel}
              onChange={(e) => setAcademy({ ...academy, workingDaysLabel: e.target.value })}
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
    </div>
  );
};
