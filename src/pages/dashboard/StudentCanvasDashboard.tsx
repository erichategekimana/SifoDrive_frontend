import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  FileText,
  Video,
  CheckCircle2,
  ExternalLink,
  X,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import { StudentAccountService, type ExamEligibilityDTO, type StudentProfileDTO } from '../../core/services/StudentAccountService';
import { LmsService, type ProgressSummaryDTO } from '../../core/services/LmsService';
import { LiveClassService } from '../../core/services/LiveClassService';
import { LiveClass } from '../../core/models/LiveClass';
import { Spinner } from '../../components/common/Spinner';

export const StudentCanvasDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useTranslation();

  const [eligibility, setEligibility] = useState<ExamEligibilityDTO | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfileDTO | null>(null);
  const [progress, setProgress] = useState<ProgressSummaryDTO | null>(null);
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Canvas UI Interactive States
  const [showSummaryCounts, setShowSummaryCounts] = useState(true);
  const [showAllGrades, setShowAllGrades] = useState(true);
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses'>('dashboard');

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [eligData, profData, progData, classesData] = await Promise.all([
          StudentAccountService.getInstance().getEligibility(),
          StudentAccountService.getInstance().getProfile(),
          LmsService.getInstance().getProgressSummary(),
          LiveClassService.getInstance().getClasses(),
        ]);
        setEligibility(eligData);
        setStudentProfile(profData);
        setProgress(progData);
        setUpcomingClasses(classesData);
      } catch (err) {
        console.error('Failed to load student canvas dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAll();
  }, []);

  if (isLoading) {
    return <Spinner message={language === 'rw' ? 'Birimo gufunguka...' : 'Loading Canvas Student Hub...'} />;
  }

  const nextClass = upcomingClasses.find((c) => c.isJoinable()) || upcomingClasses[0];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Canvas Top Greeting Header */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '24px 32px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {language === 'rw' ? `Muraho, ${user?.fullName || 'Umunyeshuri'}!` : `Hello, ${user?.fullName || 'Student'}!`}
            </h1>
            <span
              style={{
                background: 'rgba(3, 116, 181, 0.12)',
                color: '#0374b5',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid rgba(3, 116, 181, 0.25)',
              }}
            >
              {studentProfile?.license_category ? `Category ${studentProfile.license_category}` : 'Category B'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', marginBottom: 0 }}>
            {language === 'rw'
              ? `Nimero y'umunyeshuri: ${user?.studentId || 'SIFO-STU-2026-0042'} • Iminsi yikurikiranya yo kwiga: ${studentProfile?.current_streak_days || 5} 🔥`
              : `Student ID: ${user?.studentId || 'SIFO-STU-2026-0042'} • Daily Learning Streak: ${studentProfile?.current_streak_days || 5} days 🔥`}
          </p>
        </div>

        {/* View customization trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/courses"
            className="btn btn-primary btn-md"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#003366', borderColor: '#003366' }}
          >
            <Rocket size={18} />
            <span>{language === 'rw' ? 'Tangira Ikizamini cya Polisi' : 'Start Mock Police Exam'}</span>
          </Link>
        </div>
      </div>

      {/* Canvas Top Tabs: Dashboard / Courses */}
      <div style={{ borderBottom: '2px solid var(--border-subtle)', display: 'flex', gap: '28px', paddingLeft: '8px' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 4px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'dashboard' ? '#0374b5' : 'var(--text-secondary)',
            borderBottom: activeTab === 'dashboard' ? '3px solid #0374b5' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)',
          }}
        >
          {language === 'rw' ? 'Imbonerahamwe (Dashboard)' : 'Dashboard'}
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          style={{
            background: 'none',
            border: 'none',
            padding: '10px 4px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'courses' ? '#0374b5' : 'var(--text-secondary)',
            borderBottom: activeTab === 'courses' ? '3px solid #0374b5' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all var(--transition-fast)',
          }}
        >
          {language === 'rw' ? 'Amasomo Yanjye (Courses)' : 'Courses'}
        </button>
      </div>

      {/* Two Column Layout: Main Content (Left 70%) & Canvas Sidebar Widgets (Right 30%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '28px' }}>
        {/* LEFT COLUMN: Course Work, Stats & Assignments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Official Exam Eligibility Tracker (Canvas Grade Weighting Table Style) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={20} color="#0374b5" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  {language === 'rw'
                    ? "Ibisabwa Kwiyandikisha ku Kizamini cya Polisi (Exam Eligibility)"
                    : "National Police Exam Eligibility Pre-Flight Check"}
                </h3>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: eligibility?.eligible ? 'rgba(5, 135, 40, 0.12)' : 'rgba(209, 56, 56, 0.12)',
                  color: eligibility?.eligible ? '#058728' : '#d13838',
                  border: `1px solid ${eligibility?.eligible ? 'rgba(5, 135, 40, 0.3)' : 'rgba(209, 56, 56, 0.3)'}`,
                }}
              >
                {eligibility?.eligible
                  ? language === 'rw'
                    ? 'Wujuje Ibisabwa (Eligible)'
                    : 'Eligible for Exam'
                  : language === 'rw'
                  ? 'Birasigaye (Pending Criteria)'
                  : 'Pending Prerequisites'}
              </span>
            </div>

            {/* Criteria Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              {/* Pillar 1: Tuition */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {language === 'rw' ? "1. Kwishyura Ishuri (Tuition)" : "1. Tuition Payment"}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color={eligibility?.criteria?.tuition_paid ? '#058728' : '#d13838'} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {eligibility?.criteria?.tuition_paid
                      ? language === 'rw' ? 'Yarishyuwe' : 'Paid'
                      : language === 'rw' ? 'Bitarishyurwa' : 'Unpaid'}
                  </span>
                </div>
              </div>

              {/* Pillar 2: Live Attendance */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {language === 'rw' ? "2. Kwitabira Amasomo (≥ 75%)" : "2. Live Attendance (≥ 75%)"}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2
                    size={16}
                    color={(eligibility?.criteria?.attendance_rate || 0) >= 0.75 ? '#058728' : '#d13838'}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {Math.round((eligibility?.criteria?.attendance_rate || 0) * 100)}% / 75%
                  </span>
                </div>
              </div>

              {/* Pillar 3: Foundational Modules */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {language === 'rw' ? "3. Amasomo Shingiro (100%)" : "3. Foundational LMS (100%)"}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2
                    size={16}
                    color={(eligibility?.criteria?.module_completion || 0) >= 1.0 ? '#058728' : '#0374b5'}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {Math.round((eligibility?.criteria?.module_completion || 0) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Course Work Header with Show Summary Counts Toggle */}
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
                gap: '12px',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '14px',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {language === 'rw' ? 'Imirimo yo gukora (Course work)' : 'Course work'}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Toggle Summary Counts */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={showSummaryCounts}
                    onChange={(e) => setShowSummaryCounts(e.target.checked)}
                    style={{ accentColor: '#058728', width: '16px', height: '16px' }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {language === 'rw' ? 'Erekana ibiteranyo' : 'Show summary counts'}
                  </span>
                </label>

                {/* Course Filter Dropdown */}
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 12px',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="ALL">{language === 'rw' ? 'Amasomo yose' : 'All Courses'}</option>
                  <option value="CAT_B">Amategeko y'Umuhanda (Cat B)</option>
                  <option value="SIGNS">Ibyapa byo ku Muhanda (Road Signs)</option>
                </select>
              </div>
            </div>

            {/* 3 Metric Stat Boxes: Due, Missing, Submitted */}
            {showSummaryCounts && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {/* Due (Blue) */}
                <div
                  style={{
                    background: '#e8f3fb',
                    border: '1px solid rgba(3, 116, 181, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0374b5' }}>
                    {language === 'rw' ? 'Biteganyijwe (Due)' : 'Due'}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0374b5', marginTop: '4px' }}>
                    3
                  </div>
                </div>

                {/* Missing (Red) */}
                <div
                  style={{
                    background: '#fde8e8',
                    border: '1px solid rgba(209, 56, 56, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#d13838' }}>
                    {language === 'rw' ? 'Bitaratanzwe (Missing)' : 'Missing'}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d13838', marginTop: '4px' }}>
                    0
                  </div>
                </div>

                {/* Submitted (Green) */}
                <div
                  style={{
                    background: '#e8f7ec',
                    border: '1px solid rgba(5, 135, 40, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#058728' }}>
                    {language === 'rw' ? 'Byatanzwe (Submitted)' : 'Submitted'}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#058728', marginTop: '4px' }}>
                    {progress?.quizzes_taken || 2}
                  </div>
                </div>
              </div>
            )}

            {/* Assignments List (Canvas Look: Clickable blue title, course tag, points, due pill) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Item 1 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(3, 116, 181, 0.1)',
                      color: '#0374b5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Rocket size={18} />
                  </div>
                  <div>
                    <Link
                      to="/courses"
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#0374b5',
                        textDecoration: 'none',
                      }}
                    >
                      {language === 'rw'
                        ? "Ikizamini cy'Amategeko y'Umuhanda - Igice cya 1"
                        : "Traffic Regulations Quiz - Part 1"}
                    </Link>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Amategeko y'Umuhanda | Category B • 20 pts
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  30/10/2026 11:59 PM
                </div>
              </div>

              {/* Item 2 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(5, 135, 40, 0.1)',
                      color: '#058728',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FileText size={18} />
                  </div>
                  <div>
                    <Link
                      to="/road-signs"
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#0374b5',
                        textDecoration: 'none',
                      }}
                    >
                      {language === 'rw'
                        ? "Isuzuma ry'Ibyapa by'Umuhanda (Road Signs Mastery)"
                        : "Road Signs Comprehensive Assessment"}
                    </Link>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Ibyapa byo mu Rwanda • 100 pts
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  02/11/2026 11:59 PM
                </div>
              </div>

              {/* Item 3 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(234, 88, 12, 0.1)',
                      color: '#ea580c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Video size={18} />
                  </div>
                  <div>
                    <Link
                      to="/live-classes"
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#0374b5',
                        textDecoration: 'none',
                      }}
                    >
                      {language === 'rw'
                        ? "Isomo ry'Imbonankubone: Amategeko yo gutambuka mbere (Priority Rules)"
                        : "Live Theory Session: Right of Way & Priority"}
                    </Link>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Google Meet Theory • Facilitator: Aline Uwase
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: 'rgba(5, 135, 40, 0.1)',
                    border: '1px solid rgba(5, 135, 40, 0.25)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    color: '#058728',
                    fontWeight: 700,
                  }}
                >
                  {language === 'rw' ? 'Uyu Munsi 18:00' : 'Today 18:00'}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Course Cards with Grades Badge (Canvas Look) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                {language === 'rw' ? 'Amasomo n\'Amanota (Course Grades)' : 'Course Grades'}
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={showAllGrades}
                  onChange={(e) => setShowAllGrades(e.target.checked)}
                  style={{ accentColor: '#058728', width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {language === 'rw' ? 'Erekana amanota yose' : 'Show all grades'}
                </span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Course Card 1 */}
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  background: 'var(--bg-surface-elevated)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '110px',
                    background: 'linear-gradient(135deg, #003366 0%, #0374b5 100%)',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    Category B
                  </span>
                  <div
                    style={{
                      background: '#ffffff',
                      color: '#003366',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    {progress?.average_quiz_score ? `${progress.average_quiz_score}%` : '85%'}
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700 }}>
                    <Link to="/courses" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {language === 'rw' ? "Amategeko y'Umuhanda mu Rwanda" : "Rwanda Road Regulations"}
                    </Link>
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    SIFO-MOD-01 • 15 Lessons
                  </p>
                </div>
              </div>

              {/* Course Card 2 */}
              <div
                style={{
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  background: 'var(--bg-surface-elevated)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    height: '110px',
                    background: 'linear-gradient(135deg, #058728 0%, #10b981 100%)',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    {language === 'rw' ? 'Ibyapa' : 'Road Signs'}
                  </span>
                  <div
                    style={{
                      background: '#ffffff',
                      color: '#058728',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    90%
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700 }}>
                    <Link to="/road-signs" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {language === 'rw' ? "Ibyapa byose byo mu Rwanda" : "Complete Rwanda Road Signs"}
                    </Link>
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    SIFO-SIGNS-02 • 120 Interactive Signs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Canvas LMS Sidebar Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. Announcements Widget (Ibitangazwa) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                {language === 'rw' ? 'Ibitangazwa (Announcements)' : 'Announcements'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {language === 'rw' ? 'Bitarasomwa (1)' : 'Unread (1)'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  borderLeft: '4px solid #0374b5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#003366',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    SF
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Sifo Drive Academy
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0374b5' }}>
                  {language === 'rw'
                    ? "Gahunda y'ibizamini bya Polisi y'uku Kwezi"
                    : "Police Theory Exam Schedule This Month"}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  {language === 'rw'
                    ? "Abanyeshuri bose bujuje 75% mu kwitabira amasomo barashobora kwiyandikisha..."
                    : "All learners with ≥75% attendance can now request Irembo exam registration..."}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Upcoming Live Class Widget with Instant 1-Click Join */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 51, 102, 0.08) 0%, rgba(3, 116, 181, 0.12) 100%)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(3, 116, 181, 0.3)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Video size={18} color="#0374b5" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0374b5', textTransform: 'uppercase' }}>
                {language === 'rw' ? "Ishuri ry'Imbonankubone" : "Upcoming Live Lecture"}
              </span>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '4px 0 8px 0' }}>
              {nextClass?.title || (language === 'rw' ? "Amategeko yo Gutambuka no Guhagarara" : "Priority & Stopping Rules")}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              {language === 'rw' ? "Mwalimu: Aline Uwase • Uyu munsi saa 18:00" : "Instructor: Aline Uwase • Today at 18:00"}
            </p>
            <a
              href={nextClass?.googleMeetUrl || 'https://meet.google.com/sifo-class-theory'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-md"
              style={{ width: '100%', justifyContent: 'center', background: '#058728', borderColor: '#058728' }}
            >
              <ExternalLink size={16} />
              <span>{language === 'rw' ? "Injira mu Ishuri (Google Meet)" : "Join Google Meet"}</span>
            </a>
          </div>

          {/* 3. To Do Widget (Canvas Style with Points & Dismiss X) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 14px 0' }}>
              {language === 'rw' ? 'Ibyo gukora (To Do)' : 'To Do'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0374b5' }}>
                    {language === 'rw' ? "Kwitoza Igisate cya 2" : "Practice Mock Quiz 2"}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    20 pts • Oct 30 at 11:59 PM
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Dismiss"
                >
                  <X size={15} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0374b5' }}>
                    {language === 'rw' ? "Gusoma Icyapa cy'Umuvuduko" : "Review Speed Limit Signs"}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Road Signs • Nov 2 at 11:59 PM
                  </div>
                </div>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  title="Dismiss"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Recent Feedback Widget (Ibiheruka Gusuzumwa) */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
            }}
          >
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 14px 0' }}>
              {language === 'rw' ? 'Ibiheruka Gusuzumwa (Recent Feedback)' : 'Recent Feedback'}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="#058728" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {language === 'rw' ? "Itegeko ry'Umuhanda Q1" : "Road Rules Quiz 1"}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Amategeko y'Umuhanda
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#058728' }}>
                18/20 pts (90%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
