import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, X } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';

interface CreateCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCohortModal: React.FC<CreateCohortModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newCohortName, setNewCohortName] = useState<string>('');
  const [newCohortCode, setNewCohortCode] = useState<string>('');
  const [newCohortStart, setNewCohortStart] = useState<string>('');
  const [newCohortEnd, setNewCohortEnd] = useState<string>('');
  const [newCohortCapacity, setNewCohortCapacity] = useState<number>(60);
  const [newCohortSchedule, setNewCohortSchedule] = useState<string>('');
  const [openImmediately, setOpenImmediately] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCohortName.trim() || !newCohortStart || !newCohortEnd) {
      warning('Cohort name, start date, and end date are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.createCohort({
        name: newCohortName.trim(),
        code: newCohortCode.trim().toUpperCase() || undefined,
        start_date: newCohortStart,
        end_date: newCohortEnd,
        max_capacity: Number(newCohortCapacity) || 60,
        schedule_description: newCohortSchedule.trim() || undefined,
        status: openImmediately ? 'open' : 'queue',
      });
      success(
        openImmediately
          ? `Created and opened cohort "${newCohortName}" as default for new students.`
          : `Created cohort "${newCohortName}" in queue.`
      );
      setNewCohortName('');
      setNewCohortCode('');
      setNewCohortStart('');
      setNewCohortEnd('');
      setNewCohortSchedule('');
      setOpenImmediately(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create cohort.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={22} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              Create New Cohort
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Cohort Name *
            </label>
            <input
              type="text"
              required
              placeholder="Kigali Morning Batch - October 2026"
              value={newCohortName}
              onChange={(e) => setNewCohortName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Cohort Code
            </label>
            <input
              type="text"
              placeholder="COH-2026-OCT-AM"
              value={newCohortCode}
              onChange={(e) => setNewCohortCode(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Start Date *
              </label>
              <input
                type="date"
                required
                value={newCohortStart}
                onChange={(e) => setNewCohortStart(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                End Date *
              </label>
              <input
                type="date"
                required
                value={newCohortEnd}
                onChange={(e) => setNewCohortEnd(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Max Capacity
              </label>
              <input
                type="number"
                min={5}
                max={200}
                value={newCohortCapacity}
                onChange={(e) => setNewCohortCapacity(parseInt(e.target.value) || 60)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Schedule Description
              </label>
              <input
                type="text"
                placeholder="Mon, Wed, Fri 09:00 - 11:00 CAT"
                value={newCohortSchedule}
                onChange={(e) => setNewCohortSchedule(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-lg)',
              background: openImmediately ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 179, 8, 0.06)',
              border: `1px solid ${openImmediately ? 'rgba(34, 197, 94, 0.25)' : 'rgba(234, 179, 8, 0.2)'}`,
              transition: 'all 0.2s ease',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
                margin: 0,
              }}
            >
              <input
                type="checkbox"
                checked={openImmediately}
                onChange={(e) => setOpenImmediately(e.target.checked)}
                style={{
                  marginTop: '3px',
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer',
                }}
              />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: openImmediately ? '#4ade80' : '#ffffff' }}>
                  Open as default intake immediately
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                  {openImmediately ? (
                    <span style={{ color: '#86efac' }}>
                      ⚡ Only one cohort can be <strong>Open</strong> at a time. Activating this will automatically close any previous open cohort, and all new student registrations will enroll here.
                    </span>
                  ) : (
                    <span>
                      Newly created cohorts default to <strong>Queue</strong> status (inactive in line). You can open this cohort at any time from the Cohorts table.
                    </span>
                  )}
                </div>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Creating...' : openImmediately ? 'Create & Open Intake' : 'Create in Queue'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
