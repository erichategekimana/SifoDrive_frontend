import React from 'react';
import { Bell, Users } from 'lucide-react';
import type { NotificationSettings } from '../types';

interface NotificationSettingsSectionProps {
  notifications: NotificationSettings;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationSettings>>;
}

export const NotificationSettingsSection: React.FC<NotificationSettingsSectionProps> = ({
  notifications,
  setNotifications,
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
          <Bell size={18} color="#94a3b8" />
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Student SMS Notifications</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Practical Lesson SMS Reminder
            </label>
            <select
              value={notifications.smsLessonReminderHoursBefore}
              onChange={(e) =>
                setNotifications({ ...notifications, smsLessonReminderHoursBefore: Number(e.target.value) })
              }
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#1a1f2e',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.86rem',
                outline: 'none',
              }}
            >
              <option value={1}>1 Hour before session</option>
              <option value={2}>2 Hours before session</option>
              <option value={4}>4 Hours before session</option>
              <option value={12}>12 Hours before session</option>
            </select>
          </div>

          <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Tuition & Payment SMS Receipt</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Dispatched instantly upon MoMo payment</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.sendPaymentReceiptSms}
                onChange={(e) => setNotifications({ ...notifications, sendPaymentReceiptSms: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Police Mock Exam Schedule Notice</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>SMS with test time and designated room</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.sendExamScheduleSms}
                onChange={(e) => setNotifications({ ...notifications, sendExamScheduleSms: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Certificate Ready SMS</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>SMS with QR verification link when graduate completes</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.sendCertificateReadySms}
                onChange={(e) => setNotifications({ ...notifications, sendCertificateReadySms: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
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
          <Users size={18} color="#94a3b8" />
          <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Staff & Operational Alerts</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Instructor Daily Schedule SMS</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Send daily morning schedule to instructors at 06:30 CAT</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.dailyInstructorScheduleSms}
              onChange={(e) => setNotifications({ ...notifications, dailyInstructorScheduleSms: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff' }}>Low Learner Attendance Alert</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Flag students with less than 60% session attendance</div>
            </div>
            <input
              type="checkbox"
              checked={notifications.alertAdminLowAttendance}
              onChange={(e) => setNotifications({ ...notifications, alertAdminLowAttendance: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
              Low Attendance Warning Threshold (%)
            </label>
            <input
              type="number"
              min={30}
              max={80}
              value={notifications.lowAttendanceThreshold}
              onChange={(e) =>
                setNotifications({ ...notifications, lowAttendanceThreshold: Number(e.target.value) })
              }
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
