import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { AdminUserItem, LiveClassAdminItem, CohortItem } from '../../../core/services/AdminService';
import { Badge } from '../../../components/common/Badge';
import { ScheduleClassModal } from './tutors/ScheduleClassModal';

export interface TutorsSectionProps {
  tutors: AdminUserItem[];
  liveClasses: LiveClassAdminItem[];
  cohorts: CohortItem[];
  refetch: () => Promise<void>;
}

export const TutorsSection: React.FC<TutorsSectionProps> = ({
  tutors,
  liveClasses,
  cohorts,
  refetch,
}) => {
  const [isScheduleClassModalOpen, setIsScheduleClassModalOpen] = useState<boolean>(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tutors Directory */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
            Active Facilitators & Tutors ({tutors.length})
          </h3>
        </div>

        {tutors.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No tutors registered in the system.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Tutor Name</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Phone</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tutors.map((tut) => (
                  <tr key={tut.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                      {tut.full_name || 'Tutor User'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {tut.phone_number}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {tut.email || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={tut.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {tut.status || 'ACTIVE'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scheduled Live Classes */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
            Scheduled Live Classes & Cohort Sessions
          </h3>
          <button
            onClick={() => setIsScheduleClassModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Schedule Class</span>
          </button>
        </div>

        {liveClasses.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No live classes currently scheduled. Click "Schedule Class" to dispatch a session.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Class Title</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Tutor</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Schedule</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Meeting Link</th>
                </tr>
              </thead>
              <tbody>
                {liveClasses.map((cls) => (
                  <tr key={cls.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                      {cls.title}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--primary-light)' }}>
                      {cls.cohort_name || 'Open Class'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {cls.tutor_name || 'Unassigned'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {cls.scheduled_at ? cls.scheduled_at.replace('T', ' ').slice(0, 16) : 'TBD'} ({cls.duration_minutes || 60} min)
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={cls.status === 'COMPLETED' ? 'success' : cls.status === 'SCHEDULED' ? 'info' : 'neutral'}>
                        {cls.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {cls.meeting_link || cls.google_meet_url ? (
                        <a
                          href={cls.meeting_link || cls.google_meet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#38bdf8', textDecoration: 'underline', fontSize: '0.82rem' }}
                        >
                          Google Meet
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ScheduleClassModal
        isOpen={isScheduleClassModalOpen}
        onClose={() => setIsScheduleClassModalOpen(false)}
        cohorts={cohorts}
        tutors={tutors}
        onSuccess={refetch}
      />
    </div>
  );
};

export default TutorsSection;
