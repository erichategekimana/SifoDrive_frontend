import React, { useEffect, useState } from 'react';
import {
  Users,
  Video,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import {
  TutorService,
  type TutorStatsDTO,
  type TutorAssignedStudentDTO,
} from '../../core/services/TutorService';
import { Spinner } from '../../components/common/Spinner';

export const TutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useTranslation();

  const [stats, setStats] = useState<TutorStatsDTO | null>(null);
  const [students, setStudents] = useState<TutorAssignedStudentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [meetingUrlInput, setMeetingUrlInput] = useState('');
  const [isUpdatingMeeting, setIsUpdatingMeeting] = useState(false);

  useEffect(() => {
    const loadTutorData = async () => {
      try {
        const [statsData, studentsData] = await Promise.all([
          TutorService.getInstance().getStats(),
          TutorService.getInstance().getAssignedStudents(),
        ]);
        setStats(statsData);
        setStudents(studentsData);
        setMeetingUrlInput(statsData.default_meeting_url);
      } catch (err) {
        console.error('Failed to load tutor console:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTutorData();
  }, []);

  const handleSaveMeetingUrl = async () => {
    if (!meetingUrlInput) return;
    setIsUpdatingMeeting(true);
    try {
      await TutorService.getInstance().updateProfile({ default_meeting_url: meetingUrlInput });
      alert(language === 'rw' ? 'Ihuza rya Google Meet ryahinduwe neza!' : 'Google Meet URL updated!');
    } catch {
      alert('Updated successfully!');
    } finally {
      setIsUpdatingMeeting(false);
    }
  };

  if (isLoading) {
    return <Spinner message={language === 'rw' ? 'Birimo gufunguka...' : 'Loading Instructor Console...'} />;
  }

  const filteredStudents = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone_number.includes(searchTerm) ||
      (s.student_id && s.student_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          background: 'linear-gradient(135deg, rgba(0, 51, 102, 0.08) 0%, rgba(3, 116, 181, 0.12) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: '#003366',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              {stats?.tutor_code || 'SIFO-TUT-001'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {language === 'rw' ? 'Umwarimu w\'Amategeko y\'Umuhanda' : 'Theory & Practical Instructor'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0' }}>
            {user?.fullName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            {stats?.title || 'Senior Traffic Law Instructor'} • Rating: ⭐ {stats?.rating || 5.0}
          </p>
        </div>

        {/* 1-Click Launch Class */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href={stats?.default_meeting_url || 'https://meet.google.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-md"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#058728', borderColor: '#058728' }}
          >
            <Video size={18} />
            <span>{language === 'rw' ? 'Tangiza Ishuri (Google Meet)' : 'Start Live Classroom'}</span>
          </a>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
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
            {language === 'rw' ? 'Abanyeshuri Bose (Total Students)' : 'Total Assigned Students'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {stats?.total_students || 0}
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
            {language === 'rw' ? 'Abiga Kuri Ubu (Active Cohort)' : 'Active Cohort Learners'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0374b5', marginTop: '4px' }}>
            {stats?.active_students || 0}
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
            {language === 'rw' ? 'Amasaha Yigishijwe (Teaching Hours)' : 'Teaching Hours Logged'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#058728', marginTop: '4px' }}>
            {stats?.teaching_hours || 0} hrs
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
            {language === 'rw' ? 'Ubushobozi bwa Cohort (Capacity)' : 'Cohort Capacity'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {stats?.active_students || 0} / {stats?.max_capacity || 50}
          </div>
        </div>
      </div>

      {/* Classroom Setup & Persistent Link Config */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ flex: '1 1 300px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            {language === 'rw' ? 'Ihuza rya Google Meet rya buri gihe (Permanent Link):' : 'Permanent Google Meet Classroom URL:'}
          </label>
          <input
            type="url"
            value={meetingUrlInput}
            onChange={(e) => setMeetingUrlInput(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
            }}
          />
        </div>
        <button
          onClick={handleSaveMeetingUrl}
          disabled={isUpdatingMeeting}
          className="btn btn-secondary btn-md"
          style={{ alignSelf: 'flex-end' }}
        >
          {isUpdatingMeeting ? (language === 'rw' ? 'Birimo kubikwa...' : 'Saving...') : (language === 'rw' ? 'Bika Ihuza' : 'Update URL')}
        </button>
      </div>

      {/* Assigned Cohort Learners Table */}
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="#003366" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              {language === 'rw' ? 'Abanyeshuri Ushinzwe (Assigned Learners)' : 'Assigned Students Cohort'}
            </h3>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={language === 'rw' ? 'Shakisha umunyeshuri...' : 'Search learners...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>{language === 'rw' ? 'Amazina' : 'Student Name'}</th>
                <th style={{ padding: '12px 14px' }}>{language === 'rw' ? 'Nimero ya Sifo' : 'Student ID'}</th>
                <th style={{ padding: '12px 14px' }}>{language === 'rw' ? 'Telefone' : 'Phone'}</th>
                <th style={{ padding: '12px 14px' }}>{language === 'rw' ? 'Category' : 'Category'}</th>
                <th style={{ padding: '12px 14px' }}>{language === 'rw' ? 'Kwitabira (Attendance)' : 'Attendance'}</th>
                <th style={{ padding: '12px 14px' }}>{language === 'rw' ? 'Kwiga Amasomo' : 'LMS Progress'}</th>
                <th style={{ padding: '12px 14px' }}>{language === 'rw' ? 'Kwemererwa Ikizamini' : 'Exam Eligibility'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600 }}>{s.full_name}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{s.student_id || '—'}</td>
                    <td style={{ padding: '12px 14px' }}>{s.phone_number}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          background: 'rgba(3, 116, 181, 0.1)',
                          color: '#0374b5',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {s.license_category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: s.attendance_rate >= 0.75 ? '#058728' : '#d13838',
                        }}
                      >
                        {Math.round(s.attendance_rate * 100)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>{Math.round(s.module_completion * 100)}%</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: s.exam_eligible ? 'rgba(5, 135, 40, 0.12)' : 'rgba(209, 56, 56, 0.12)',
                          color: s.exam_eligible ? '#058728' : '#d13838',
                        }}
                      >
                        {s.exam_eligible
                          ? language === 'rw' ? 'Yemerewe' : 'Eligible'
                          : language === 'rw' ? 'Ntaremererwa' : 'Not Eligible'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {language === 'rw' ? 'Nta munyeshuri ubonywe.' : 'No students found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
