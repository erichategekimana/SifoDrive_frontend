import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  HelpCircle,
  FileText,
  Users,
  BookOpen,
  RefreshCw,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import {
  TutorLmsService,
  type CohortSelectorItem,
  type CohortCourseItem,
  type CohortModuleItem,
  type CohortQuizItem,
  type CohortActivityItem,
} from '../../../../core/services/TutorLmsService';
import { CohortModuleReleasePanel } from './CohortModuleReleasePanel';
import { CohortQuizSchedulePanel } from './CohortQuizSchedulePanel';
import { CohortActivitiesPanel } from './CohortActivitiesPanel';
import { Spinner } from '../../../../components/common/Spinner';

type TutorLmsTab = 'modules' | 'quizzes' | 'activities';

export const TutorLmsStudio: React.FC = () => {
  const [cohorts, setCohorts] = useState<CohortSelectorItem[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('cohort') || localStorage.getItem('sifo_tutor_active_cohort') || '';
  });

  const [courses, setCourses] = useState<CohortCourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const handleCohortChange = (cohortId: string) => {
    if (!cohortId || cohortId === selectedCohortId) return;
    localStorage.setItem('sifo_tutor_active_cohort', cohortId);
    const params = new URLSearchParams(window.location.search);
    params.set('cohort', cohortId);
    window.location.search = params.toString();
  };

  const [activeTab, setActiveTab] = useState<TutorLmsTab>('modules');

  // Tab content states
  const [modules, setModules] = useState<CohortModuleItem[]>([]);
  const [quizzes, setQuizzes] = useState<CohortQuizItem[]>([]);
  const [activities, setActivities] = useState<CohortActivityItem[]>([]);

  const [isLoadingCohorts, setIsLoadingCohorts] = useState<boolean>(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // 1. Initial Load: Tutor Cohorts
  const loadCohorts = useCallback(async () => {
    setIsLoadingCohorts(true);
    try {
      const data = await TutorLmsService.getInstance().getTutorCohorts();
      setCohorts(data);
      if (data.length > 0) {
        const savedCohortId = new URLSearchParams(window.location.search).get('cohort') || localStorage.getItem('sifo_tutor_active_cohort');
        const matched = data.find((c) => c.id === savedCohortId);
        const finalId = matched ? matched.id : data[0].id;
        setSelectedCohortId(finalId);
        localStorage.setItem('sifo_tutor_active_cohort', finalId);
      }
    } catch (err) {
      console.error('Failed to load tutor cohorts:', err);
    } finally {
      setIsLoadingCohorts(false);
    }
  }, []);

  useEffect(() => {
    loadCohorts();
  }, [loadCohorts]);

  // 2. When Cohort changes: Load courses
  const loadCohortCourses = useCallback(async (cohortId: string) => {
    if (!cohortId) {
      setCourses([]);
      setSelectedCourseId('');
      return;
    }
    setIsLoadingCourses(true);
    try {
      const data = await TutorLmsService.getInstance().getCohortCourses(cohortId);
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].id);
      } else {
        setSelectedCourseId('');
      }
    } catch (err) {
      console.error('Failed to load cohort courses:', err);
    } finally {
      setIsLoadingCourses(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCohortId) {
      loadCohortCourses(selectedCohortId);
    }
  }, [selectedCohortId, loadCohortCourses]);

  // 3. When Course or Cohort or Tab changes: Load relevant tab data
  const loadTabData = useCallback(async () => {
    if (!selectedCohortId || !selectedCourseId) {
      setModules([]);
      setQuizzes([]);
      setActivities([]);
      return;
    }

    setIsLoadingData(true);
    try {
      if (activeTab === 'modules') {
        const modData = await TutorLmsService.getInstance().getCohortModules(selectedCohortId, selectedCourseId);
        setModules(modData);
      } else if (activeTab === 'quizzes') {
        const quizData = await TutorLmsService.getInstance().getCohortQuizzes(selectedCohortId, selectedCourseId);
        setQuizzes(quizData);
      } else if (activeTab === 'activities') {
        const actData = await TutorLmsService.getInstance().getCohortActivities(selectedCohortId, selectedCourseId);
        setActivities(actData);
      }
    } catch (err) {
      console.error('Failed to load tab data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedCohortId, selectedCourseId, activeTab]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  if (isLoadingCohorts) {
    return <Spinner message="Loading your assigned cohorts..." />;
  }

  if (cohorts.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-2xl)',
          padding: '48px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
          No Cohorts Assigned Yet
        </h3>
        <p style={{ margin: '8px auto 0', maxWidth: '520px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          You have not been assigned to any student cohorts by the Training Administrator yet. Once assigned, you will manage course modules, quiz deadlines, and activities for your learners here.
        </p>
      </div>
    );
  }

  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Selector Bar: Select Cohort & Course */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          {/* Cohort Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Select Active Cohort
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={18} color="#0055A5" />
              <select
                value={selectedCohortId}
                onChange={(e) => handleCohortChange(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  minWidth: '220px',
                }}
              >
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) - {c.student_count} Students
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Course Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}
            >
              Assigned Course
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="#058728" />
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={isLoadingCourses || courses.length === 0}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  minWidth: '240px',
                }}
              >
                {courses.length === 0 ? (
                  <option value="">No courses assigned for this cohort</option>
                ) : (
                  courses.map((crs) => (
                    <option key={crs.id} value={crs.id}>
                      {crs.title} ({crs.code || 'CRS'})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={loadTabData}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={isLoadingData ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--radius-xl)',
            padding: '40px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
          }}
        >
          <AlertCircle size={32} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
            No Assigned Courses in {selectedCohort?.name}
          </h4>
          <p style={{ margin: '6px auto 0', maxWidth: '480px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            The Training Administrator has not assigned any courses from your accredited curricula to you for this cohort yet.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
          {/* Subtabs Bar */}
          <div
            style={{
              padding: '14px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--bg-surface-elevated)',
            }}
          >
            <button
              onClick={() => setActiveTab('modules')}
              className={`btn btn-sm ${activeTab === 'modules' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Layers size={14} />
              <span>Module Releases & Locks</span>
            </button>

            <button
              onClick={() => setActiveTab('quizzes')}
              className={`btn btn-sm ${activeTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <HelpCircle size={14} />
              <span>Quiz Scheduling & Deadlines</span>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className={`btn btn-sm ${activeTab === 'activities' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={14} />
              <span>Cohort Activities & Drills</span>
            </button>
          </div>

          {/* Panel Content */}
          <div style={{ padding: '24px' }}>
            {activeTab === 'modules' && (
              <CohortModuleReleasePanel
                cohortId={selectedCohortId}
                courseId={selectedCourseId}
                modules={modules}
                isLoading={isLoadingData}
                onRefresh={loadTabData}
              />
            )}

            {activeTab === 'quizzes' && (
              <CohortQuizSchedulePanel
                cohortId={selectedCohortId}
                courseId={selectedCourseId}
                quizzes={quizzes}
                isLoading={isLoadingData}
                onRefresh={loadTabData}
              />
            )}

            {activeTab === 'activities' && (
              <CohortActivitiesPanel
                cohortId={selectedCohortId}
                courseId={selectedCourseId}
                activities={activities}
                isLoading={isLoadingData}
                onRefresh={loadTabData}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
