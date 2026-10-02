import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  Award,
  Compass,
  FileText,
  ChevronRight,
  ArrowLeft,
  Lock,
  Headphones,
  Search,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { LmsService } from '../../core/services/LmsService';
import { Course } from '../../core/models/Course';
import { Spinner } from '../../components/common/Spinner';

export const CoursesView: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: courseIdParam } = useParams<{ id?: string }>();

  const isGuest = user?.role === 'GUEST';

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Load published courses list from backend database
  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LmsService.getInstance().getCourses();
      setCourses(data);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
      setError(err?.message || 'Failed to load courses from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // 2. If a specific course ID is in the URL, load full course detail
  useEffect(() => {
    if (!courseIdParam) {
      setSelectedCourse(null);
      return;
    }

    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        const detail = await LmsService.getInstance().getCourseDetail(courseIdParam);
        if (isMounted) {
          setSelectedCourse(detail);
        }
      } catch (err: any) {
        console.error(`Failed to load detail for course ${courseIdParam}:`, err);
        if (isMounted) {
          setSelectedCourse(null);
        }
      } finally {
        if (isMounted) {
          setLoadingDetail(false);
        }
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [courseIdParam]);

  const handleSelectCourse = (course: Course) => {
    navigate(`/courses/${course.id}`);
  };

  const handleBackToCourses = () => {
    navigate('/courses');
  };

  const filteredCourses = courses.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      c.curriculumTitle.toLowerCase().includes(term)
    );
  });

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircle size={18} color="#0055A5" />;
      case 'AUDIO':
        return <Headphones size={18} color="#7C3AED" />;
      case 'QUIZ':
        return <Award size={18} color="#D9381E" />;
      case 'ROAD_SIGN':
        return <Compass size={18} color="#058728" />;
      default:
        return <FileText size={18} color="#2563EB" />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
        <Spinner message="Loading courses catalogue from database..." />
      </div>
    );
  }

  // --- Course Detail View ---
  if (selectedCourse || loadingDetail) {
    if (loadingDetail) {
      return (
        <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
          <Spinner message="Loading course curriculum and lessons..." />
        </div>
      );
    }

    if (!selectedCourse) {
      return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
          <AlertCircle size={48} color="#D9381E" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2D3B45' }}>Course Not Found</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>
            The requested course may have been unpublished or removed.
          </p>
          <button onClick={handleBackToCourses} className="canvas-btn canvas-btn-primary">
            <ArrowLeft size={16} />
            <span>{t('canvasCourses.backToCourses')}</span>
          </button>
        </div>
      );
    }

    const modules = selectedCourse.modules || [];
    const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
    const completedLessons = modules.reduce((sum, m) => sum + (m.completedLessonsCount || 0), 0);
    const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Course Header & Back button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleBackToCourses}
            className="canvas-btn"
            style={{ marginBottom: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} />
            <span>{t('canvasCourses.backToCourses')}</span>
          </button>

          <div
            className="canvas-card"
            style={{
              borderLeft: '5px solid #0055A5 !important',
              padding: '24px 28px',
              backgroundColor: 'var(--canvas-bg-card, #FFFFFF)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0055A5', letterSpacing: '0.04em' }}>
                    {selectedCourse.code || 'THEORY'}
                  </span>
                  <span style={{ color: '#D0D5DD' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#666666', fontWeight: 600 }}>
                    {selectedCourse.curriculumTitle}
                  </span>
                  {selectedCourse.isPublished && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: '#E8F5E9',
                        color: '#058728',
                        padding: '2px 8px',
                        borderRadius: '2px',
                      }}
                    >
                      Published
                    </span>
                  )}
                </div>

                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#2D3B45', margin: '4px 0 10px 0', lineHeight: 1.25 }}>
                  {selectedCourse.title}
                </h1>

                {selectedCourse.description && (
                  <p style={{ fontSize: '0.88rem', color: '#555555', maxWidth: '780px', margin: 0, lineHeight: 1.5 }}>
                    {selectedCourse.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '24px', marginTop: '16px', fontSize: '0.82rem', color: '#555555', flexWrap: 'wrap' }}>
                  <span>
                    <strong>{t('canvasCourses.modules')}:</strong> {modules.length}
                  </span>
                  <span>
                    <strong>{t('canvasCourses.hours')}:</strong> {selectedCourse.estimatedHours || 12}h
                  </span>
                  <span>
                    <strong>{t('canvasCourses.passStandard')}:</strong> 88%
                  </span>
                </div>
              </div>

              {/* Progress Box */}
              <div
                style={{
                  textAlign: 'right',
                  minWidth: '170px',
                  padding: '14px 18px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '4px',
                  border: '1px solid #EAEAEA',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#666666', fontWeight: 600 }}>
                  {t('canvasCourses.courseProgress')}
                </span>
                <div
                  style={{
                    fontSize: '1.9rem',
                    fontWeight: 800,
                    color: courseProgress >= 80 ? '#058728' : '#0055A5',
                    marginTop: '2px',
                  }}
                >
                  {courseProgress}%
                </div>
                <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                  <div
                    style={{
                      width: `${courseProgress}%`,
                      height: '100%',
                      backgroundColor: courseProgress >= 80 ? '#058728' : '#0055A5',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#888888', marginTop: '6px' }}>
                  {completedLessons} of {totalLessons} completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules & Lessons List */}
        {modules.length === 0 ? (
          <div
            className="canvas-card"
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              border: '1px dashed #D0D5DD',
            }}
          >
            <BookOpen size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: 0 }}>
              No Modules in This Course
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '6px' }}>
              The training admin has not added modules to this course yet.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {modules.map((mod, modIdx) => {
              const isModuleStudentOnly = mod.isStudentOnly;
              const isModuleGatedForUser = isGuest && isModuleStudentOnly;

              return (
                <div key={mod.id} className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Module Header */}
                  <div
                    style={{
                      padding: '14px 22px',
                      backgroundColor: isModuleStudentOnly ? '#FAF5FF' : '#F8FAFC',
                      borderBottom: '1px solid #EAEAEA',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          color: isModuleStudentOnly ? '#7C3AED' : '#0055A5',
                          backgroundColor: isModuleStudentOnly ? '#EDE9FE' : '#E0F2FE',
                          padding: '2px 8px',
                          borderRadius: '2px',
                        }}
                      >
                        Module {modIdx + 1}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.98rem',
                          color: '#1E293B',
                        }}
                      >
                        {mod.title}
                      </span>

                      {mod.isFoundational && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            padding: '1px 6px',
                            borderRadius: '2px',
                          }}
                        >
                          Foundational
                        </span>
                      )}

                      {isModuleStudentOnly && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor: '#EDE9FE',
                            color: '#6B21A8',
                            padding: '2px 8px',
                            borderRadius: '2px',
                          }}
                        >
                          <Lock size={12} />
                          <span>Student Only</span>
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>
                      {t('canvasCourses.lessonsCount', { count: mod.lessons?.length || 0 })}
                    </div>
                  </div>

                  {mod.description && (
                    <div style={{ padding: '10px 22px', fontSize: '0.82rem', color: '#64748B', backgroundColor: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                      {mod.description}
                    </div>
                  )}

                  {/* If entire module is gated for Guest */}
                  {isModuleGatedForUser ? (
                    <div
                      style={{
                        padding: '20px 24px',
                        backgroundColor: '#FFFBEB',
                        borderLeft: '4px solid #F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Lock size={20} color="#D97706" />
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400E' }}>
                            Restricted to Enrolled Students
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: '2px' }}>
                            This module is managed as student-only by the training admin. Enroll or upgrade to access full lesson content.
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/dashboard')}
                        className="canvas-btn"
                        style={{
                          backgroundColor: '#D97706',
                          color: '#FFFFFF',
                          borderColor: '#D97706',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                        }}
                      >
                        <Sparkles size={14} />
                        <span>Upgrade Account</span>
                      </button>
                    </div>
                  ) : (
                    /* Lessons list */
                    <div>
                      {(!mod.lessons || mod.lessons.length === 0) ? (
                        <div style={{ padding: '16px 22px', fontSize: '0.82rem', color: '#94A3B8', fontStyle: 'italic' }}>
                          No lessons available in this module yet.
                        </div>
                      ) : (
                        mod.lessons.map((les) => {
                          const isLessonStudentOnly = les.isStudentOnly || isModuleStudentOnly;
                          const isLessonLockedForGuest = isGuest && isLessonStudentOnly && !les.isFreePreview;

                          return (
                            <div
                              key={les.id}
                              style={{
                                padding: '14px 22px',
                                borderBottom: '1px solid #F1F5F9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: isLessonLockedForGuest ? '#FAFAFA' : '#FFFFFF',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
                                <div style={{ flexShrink: 0 }}>
                                  {isLessonLockedForGuest ? (
                                    <Lock size={18} color="#94A3B8" />
                                  ) : (
                                    getLessonTypeIcon(les.lessonType)
                                  )}
                                </div>

                                <div>
                                  <div
                                    style={{
                                      fontSize: '0.9rem',
                                      fontWeight: 600,
                                      color: isLessonLockedForGuest ? '#64748B' : '#1E293B',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    <span>{les.title}</span>

                                    {les.isFreePreview && (
                                      <span
                                        style={{
                                          fontSize: '0.68rem',
                                          fontWeight: 700,
                                          backgroundColor: '#DCFCE7',
                                          color: '#15803D',
                                          padding: '1px 6px',
                                          borderRadius: '2px',
                                        }}
                                      >
                                        Public Preview
                                      </span>
                                    )}

                                    {les.isStudentOnly && (
                                      <span
                                        style={{
                                          fontSize: '0.68rem',
                                          fontWeight: 700,
                                          backgroundColor: '#EDE9FE',
                                          color: '#6B21A8',
                                          padding: '1px 6px',
                                          borderRadius: '2px',
                                        }}
                                      >
                                        Student Only
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ fontSize: '0.75rem', color: '#888888', marginTop: '3px' }}>
                                    {t('canvasCourses.duration')}: {les.getFormattedDuration()} • {les.getBadgeLabel()}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {les.isCompleted ? (
                                  <span
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.75rem',
                                      color: '#058728',
                                      fontWeight: 700,
                                    }}
                                  >
                                    <CheckCircle size={16} />
                                    <span>{t('canvasCourses.completed')}</span>
                                  </span>
                                ) : !isLessonLockedForGuest ? (
                                  <span className="canvas-badge canvas-badge-open" style={{ fontSize: '0.7rem' }}>
                                    {t('canvasCourses.pending')}
                                  </span>
                                ) : null}

                                {isLessonLockedForGuest ? (
                                  <button
                                    onClick={() => navigate('/dashboard')}
                                    className="canvas-btn"
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.75rem',
                                      color: '#92400E',
                                      backgroundColor: '#FEF3C7',
                                      borderColor: '#FDE68A',
                                    }}
                                    title="Exclusive to enrolled students"
                                  >
                                    <Lock size={13} />
                                    <span>Enrolled Only</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => navigate(`/lesson/${les.id}`)}
                                    className="canvas-btn canvas-btn-primary"
                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                  >
                                    <span>{t('canvasCourses.startLesson')}</span>
                                    <ChevronRight size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- Main Published Courses Catalogue Grid ---
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Page Title & Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0055A5', margin: 0 }}>
            {t('canvasCourses.title')}
          </h1>
          <p style={{ color: '#666666', fontSize: '0.9rem', marginTop: '4px' }}>
            {t('canvasCourses.subtitle')}
          </p>
        </div>

        <button
          onClick={() => navigate('/road-signs')}
          className="canvas-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Compass size={16} color="#0055A5" />
          <span>{t('canvasCourses.roadSignsLib')}</span>
        </button>
      </div>

      {/* Search Input Filter */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D0D5DD',
            borderRadius: '2px',
            padding: '8px 14px',
            maxWidth: '440px',
          }}
        >
          <Search size={16} color="#888888" />
          <input
            type="text"
            placeholder="Search published courses by code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.88rem',
              color: '#1E293B',
              background: 'transparent',
            }}
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '2px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#B91C1C', fontSize: '0.88rem' }}>{error}</span>
          <button onClick={loadCourses} className="canvas-btn" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Zero Courses Empty State */}
      {filteredCourses.length === 0 ? (
        <div
          className="canvas-card"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px dashed #D0D5DD',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#0055A5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <BookOpen size={32} />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: '0 0 8px 0' }}>
            {searchTerm ? 'No Matching Courses Found' : 'No Published Courses Available'}
          </h2>

          <p style={{ color: '#64748B', fontSize: '0.88rem', maxWidth: '520px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
            {searchTerm
              ? `No course matched your search "${searchTerm}". Try another keyword or clear the search.`
              : 'There are currently no published courses in the curriculum. Once the Training Admin publishes a course from the LMS Studio, it will appear here for all enrolled students and guests.'}
          </p>

          <button
            onClick={() => navigate('/road-signs')}
            className="canvas-btn canvas-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Compass size={16} />
            <span>Explore Rwanda Road Signs</span>
          </button>
        </div>
      ) : (
        /* Course Cards Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="canvas-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderTop: '4px solid #0055A5 !important',
                padding: '22px',
                backgroundColor: '#FFFFFF',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onClick={() => handleSelectCourse(course)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0055A5', letterSpacing: '0.04em' }}>
                    {course.code || 'THEORY'}
                  </span>
                  <span className="canvas-badge canvas-badge-open" style={{ fontSize: '0.7rem' }}>
                    {course.curriculumTitle || 'Rwanda Highway Code'}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2D3B45', margin: '6px 0 10px 0', lineHeight: 1.3 }}>
                  {course.title}
                </h2>

                <p style={{ fontSize: '0.84rem', color: '#666666', lineHeight: 1.45, marginBottom: '18px' }}>
                  {course.description || 'Theory training curriculum for provisional driving license preparation.'}
                </p>
              </div>

              <div>
                {/* Progress Bar */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666666', marginBottom: '4px' }}>
                    <span>{t('canvasCourses.progress')}</span>
                    <span style={{ fontWeight: 700, color: course.progressPercentage >= 80 ? '#058728' : '#0055A5' }}>
                      {course.progressPercentage}%
                    </span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${course.progressPercentage}%`,
                        backgroundColor: course.progressPercentage >= 80 ? '#058728' : '#0055A5',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid #F0F0F0',
                    fontSize: '0.75rem',
                    color: '#64748B',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    <span>{course.estimatedHours || 12} {t('canvasCourses.hours')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={14} />
                    <span>{course.modulesCount} {t('canvasCourses.modules')}</span>
                  </div>
                  <button
                    className="canvas-btn canvas-btn-primary"
                    style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCourse(course);
                    }}
                  >
                    {t('canvasCourses.openCourse')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
