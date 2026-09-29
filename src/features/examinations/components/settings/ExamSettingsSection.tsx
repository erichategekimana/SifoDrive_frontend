import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';

export const ExamSettingsSection: React.FC = () => {
  const { showToast } = useToast();

  const [settingsForm, setSettingsForm] = useState({
    passingScore: 12,
    totalQuestions: 20,
    durationMinutes: 20,
    maxGuestTrials: 2,
    tabSwitchLimit: 3,
    anomalySnapshots: true,
  });

  const handleSaveSettings = () => {
    showToast('Exam policies and settings saved successfully!', 'success');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0' }}>
        National Police Theory Examination Policies
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Configure passing criteria, proctoring security thresholds, and guest trial access limits
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Passing Score (Questions Required)</label>
            <input
              type="number"
              value={settingsForm.passingScore}
              onChange={(e) => setSettingsForm({ ...settingsForm, passingScore: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                marginTop: '6px',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rwanda National standard: 12 / 20 (60%)</span>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Questions per Exam</label>
            <input
              type="number"
              value={settingsForm.totalQuestions}
              disabled
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-subtle)',
                color: '#9ca3af',
                marginTop: '6px',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fixed standard by Rwanda National Police</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Exam Duration (Minutes)</label>
            <input
              type="number"
              value={settingsForm.durationMinutes}
              onChange={(e) => setSettingsForm({ ...settingsForm, durationMinutes: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                marginTop: '6px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Guest Free Trial Sessions Limit</label>
            <input
              type="number"
              value={settingsForm.maxGuestTrials}
              onChange={(e) => setSettingsForm({ ...settingsForm, maxGuestTrials: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                marginTop: '6px',
              }}
            />
          </div>
        </div>

        <div style={{ padding: '14px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--primary-light)' }}>
            Anti-Cheat & Proctoring Engine Settings
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem' }}>Tab switch violation auto-flag threshold</span>
            <input
              type="number"
              value={settingsForm.tabSwitchLimit}
              onChange={(e) => setSettingsForm({ ...settingsForm, tabSwitchLimit: Number(e.target.value) })}
              style={{
                width: '80px',
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                textAlign: 'center',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem' }}>Capture Anomaly Webcam Snapshots (B2C Remote)</span>
            <input
              type="checkbox"
              checked={settingsForm.anomalySnapshots}
              onChange={(e) => setSettingsForm({ ...settingsForm, anomalySnapshots: e.target.checked })}
              style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
            />
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          style={{
            background: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Save size={16} /> Save Examination Policies
        </button>
      </div>
    </div>
  );
};
