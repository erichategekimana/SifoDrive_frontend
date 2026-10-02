import React, { useEffect, useState } from 'react';
import {
  Monitor,
  PlusCircle,
} from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';
import {
  EnterpriseService,
  type EnterpriseStatsDTO,
  type EnterpriseStudentDTO,
  type BulkStudentItemDTO,
} from '../../core/services/EnterpriseService';
import { Spinner } from '../../components/common/Spinner';

export const EnterpriseDashboard: React.FC = () => {
  const { t } = useTranslation();

  const [stats, setStats] = useState<EnterpriseStatsDTO | null>(null);
  const [students, setStudents] = useState<EnterpriseStudentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadEnterpriseData = async () => {
      try {
        const [statsData, studentsData] = await Promise.all([
          EnterpriseService.getInstance().getStats(),
          EnterpriseService.getInstance().getStudents(),
        ]);
        setStats(statsData);
        setStudents(studentsData);
      } catch (err) {
        console.error('Failed to load enterprise data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadEnterpriseData();
  }, []);

  const handleBulkEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsvText.trim()) return;

    setIsSubmitting(true);
    try {
      // Parse CSV lines: phone, first_name, last_name, category
      const lines = bulkCsvText.trim().split('\n');
      const parsedStudents: BulkStudentItemDTO[] = lines.map((line) => {
        const [phone, first, last, cat] = line.split(',').map((s) => s.trim());
        return {
          phone_number: phone,
          first_name: first || 'Student',
          last_name: last || 'User',
          license_category: cat || 'B',
        };
      });

      const res = await EnterpriseService.getInstance().bulkEnrollStudents(parsedStudents);
      alert(t('dashboard.enterprise.batchSuccess', { count: res.created_count }));
      setShowBulkModal(false);
      setBulkCsvText('');
      // Reload students
      const updated = await EnterpriseService.getInstance().getStudents();
      setStudents(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to process bulk enrollment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Spinner message={t('dashboard.enterprise.loadingHub')} />;
  }

  const quota = stats?.concurrent_station_quota || 20;
  const activeSeats = stats?.active_exam_sessions || 14;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(0, 51, 102, 0.08) 0%, rgba(5, 135, 40, 0.1) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: '#0055A5',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {stats?.registration_number || 'RDB-DS-2024-089'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {stats?.district || 'Kigali'} Campus
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0' }}>
            {stats?.school_name || t('dashboard.enterprise.badge')}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {t('dashboard.enterprise.labQuota', { quota, total: stats?.total_students || 0 })}
          </p>
        </div>

        {/* Action Button: Bulk Enroll */}
        <button
          onClick={() => setShowBulkModal(true)}
          className="btn btn-primary btn-md"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0055A5', borderColor: '#0055A5' }}
        >
          <PlusCircle size={18} />
          <span>{t('dashboard.enterprise.batchIntake')}</span>
        </button>
      </div>

      {/* 4 Overview Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.enterprise.labQuota', { quota: '', total: '' }).split('•')[0].trim()}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {quota}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.enterprise.activeStations')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0374b5', marginTop: '4px' }}>
            {activeSeats} / {quota}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.enterprise.availableSeats')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#058728', marginTop: '4px' }}>
            {Math.max(0, quota - activeSeats)}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {t('dashboard.enterprise.passRateTitle')}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {stats?.utilization_percentage || 70}%
          </div>
        </div>
      </div>

      {/* Real-time Hardware Workstations Grid */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Monitor size={20} color="#0055A5" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {t('dashboard.enterprise.stationLiveGrid')}
            </h3>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            🟢 {activeSeats} {t('dashboard.enterprise.inExam')} • ⚪ {quota - activeSeats} {t('dashboard.enterprise.idle')}
          </span>
        </div>

        {/* Stations Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '12px',
          }}
        >
          {Array.from({ length: quota }).map((_, idx) => {
            const isOccupied = idx < activeSeats;
            return (
              <div
                key={idx}
                style={{
                  background: isOccupied ? 'rgba(3, 116, 181, 0.08)' : 'var(--bg-surface-elevated)',
                  border: isOccupied ? '1px solid #0374b5' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 10px',
                  textAlign: 'center',
                }}
              >
                <Monitor size={22} color={isOccupied ? '#0374b5' : 'var(--text-muted)'} style={{ margin: '0 auto 6px auto' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  {t('dashboard.enterprise.stationNumber', { num: String(idx + 1).padStart(2, '0') })}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginTop: '4px',
                    color: isOccupied ? '#0374b5' : 'var(--text-muted)',
                  }}
                >
                  {isOccupied ? t('dashboard.enterprise.inExam') : t('dashboard.enterprise.idle')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enrolled Students List */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '24px',
        }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0' }}>
          {t('dashboard.enterprise.candidateDirectory')}
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.tutor.colStudent')}</th>
                <th style={{ padding: '12px 14px' }}>ID</th>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.enterprise.colPhone')}</th>
                <th style={{ padding: '12px 14px' }}>{t('dashboard.enterprise.colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{s.full_name}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{s.student_id || '—'}</td>
                    <td style={{ padding: '12px 14px' }}>{s.phone_number}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          background: 'rgba(5, 135, 40, 0.1)',
                          color: '#058728',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('dashboard.canvas.noResults')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Intake Modal */}
      {showBulkModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              {t('dashboard.enterprise.bulkEnrollTitle')}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {t('dashboard.enterprise.bulkEnrollDesc')}
            </p>

            <form onSubmit={handleBulkEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <textarea
                rows={6}
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                placeholder="+250788111222, Eric, Mugisha, B&#10;+250788333444, Aline, Uwase, A"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  fontFamily: 'monospace',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="btn btn-secondary btn-md"
                >
                  {t('dashboard.guest.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-md"
                  style={{ background: '#0055A5', borderColor: '#0055A5' }}
                >
                  {isSubmitting ? t('dashboard.guest.sendingPrompt') : t('dashboard.enterprise.submitBatch')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
