import React from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRightLeft, UserCheck } from 'lucide-react';
import type { AdminUserItem } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';

interface StudentDetailsModalProps {
  learner: AdminUserItem | null;
  onClose: () => void;
  onChangeCohort: (learner: AdminUserItem) => void;
  onChangeTutor: (learner: AdminUserItem) => void;
}

export const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  learner,
  onClose,
  onChangeCohort,
  onChangeTutor,
}) => {
  if (!learner) return null;

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
          maxWidth: '560px',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: learner.role === 'STUDENT' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                color: learner.role === 'STUDENT' ? '#38bdf8' : '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            >
              {(learner.full_name || learner.phone_number).charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {learner.full_name || 'Anonymous User'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <Badge variant={learner.role === 'STUDENT' ? 'info' : 'neutral'}>
                  {learner.role}
                </Badge>
                <Badge variant={learner.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {learner.status}
                </Badge>
              </div>
            </div>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
          {/* Student ID */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Student ID</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
              {learner.student_id || 'Not Assigned'}
            </span>
          </div>

          {/* Phone & Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Phone Number</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#ffffff' }}>{learner.phone_number}</div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Email Address</div>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>{learner.email || 'None on file'}</div>
            </div>
          </div>

          {/* Cohort & Tutor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Enrolled Cohort</div>
              <div style={{ fontWeight: 700, color: learner.cohort_name ? '#38bdf8' : 'var(--text-muted)' }}>
                {learner.cohort_name || 'Unassigned'}
              </div>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Assigned Tutor</div>
              <div style={{ fontWeight: 700, color: learner.assigned_tutor_name ? '#a78bfa' : 'var(--text-muted)' }}>
                {learner.assigned_tutor_name || 'No Tutor Assigned'}
              </div>
            </div>
          </div>

          {/* Registration Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Registered On</span>
            <span style={{ color: '#ffffff' }}>
              {learner.created_at ? new Date(learner.created_at).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={() => {
              onClose();
              onChangeCohort(learner);
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowRightLeft size={13} />
            <span>Change Cohort</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onChangeTutor(learner);
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserCheck size={13} />
            <span>Change Tutor</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
