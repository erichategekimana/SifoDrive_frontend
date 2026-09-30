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
    showToast('Exam policies saved.', 'success');
  };

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        padding: '22px 24px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        maxWidth: '760px',
      }}
    >
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Examination Policies
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
          Passing criteria, proctoring thresholds, and guest trial limits.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Passing Score
            </label>
            <input
              type="number"
              value={settingsForm.passingScore}
              onChange={(e) => setSettingsForm({ ...settingsForm, passingScore: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                marginTop: '4px',
                fontSize: '0.84rem',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Standard: 12 / 20 (60%)</span>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Total Questions
            </label>
            <input
              type="number"
              value={settingsForm.totalQuestions}
              disabled
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                marginTop: '4px',
                fontSize: '0.84rem',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fixed national standard</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Duration (Minutes)
            </label>
            <input
              type="number"
              value={settingsForm.durationMinutes}
              onChange={(e) => setSettingsForm({ ...settingsForm, durationMinutes: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                marginTop: '4px',
                fontSize: '0.84rem',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Guest Trial Limit
            </label>
            <input
              type="number"
              value={settingsForm.maxGuestTrials}
              onChange={(e) => setSettingsForm({ ...settingsForm, maxGuestTrials: Number(e.target.value) })}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                marginTop: '4px',
                fontSize: '0.84rem',
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '10px', color: 'var(--text-primary)' }}>
            Proctoring Controls
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tab switch threshold</span>
            <input
              type="number"
              value={settingsForm.tabSwitchLimit}
              onChange={(e) => setSettingsForm({ ...settingsForm, tabSwitchLimit: Number(e.target.value) })}
              style={{
                width: '72px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                textAlign: 'center',
                fontSize: '0.8rem',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Capture webcam anomaly snapshots</span>
            <input
              type="checkbox"
              checked={settingsForm.anomalySnapshots}
              onChange={(e) => setSettingsForm({ ...settingsForm, anomalySnapshots: e.target.checked })}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </div>

        <div>
          <button
            onClick={handleSaveSettings}
            className="btn btn-primary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '0.82rem',
            }}
          >
            <Save size={14} /> Save Policies
          </button>
        </div>
      </div>
    </div>
  );
};

