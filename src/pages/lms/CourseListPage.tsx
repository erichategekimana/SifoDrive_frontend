import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, PlayCircle, Lock, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { LmsService } from '../../core/services/LmsService';
import { Course } from '../../core/models/Course';
import { Module } from '../../core/models/Module';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';

export const CourseListPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Record<string, Module[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLmsContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const lms = LmsService.getInstance();
        const courseList = await lms.getCourses();
        setCourses(courseList);

        const modulesMap: Record<string, Module[]> = {};
        await Promise.all(
          courseList.map(async (course) => {
            try {
              const mods = await lms.getCourseModules(course.id);
              modulesMap[course.id] = mods;
            } catch (err) {
              console.error(`Failed to load modules for course ${course.id}:`, err);
            }
          })
        );
        setModules(modulesMap);
      } catch (err: any) {
        console.error('Failed to load courses catalogue:', err);
        setError(err?.message || 'Failed to load courses from database.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLmsContent();
  }, []);

  if (isLoading) {
    return <Spinner message={t('common.loading')} />;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge variant="success">{t('lms.officialCurriculum')}</Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('lms.universalCategory')}</span>
        </div>
        <h1>{t('lms.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
          {t('lms.subtitle')}
        </p>
      </div>

      {error && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--error)' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {courses.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <BookOpen size={28} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Published Courses Available</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            There are currently no courses published in the database. When the training admin publishes courses, they will appear here.
          </p>
          <Link to="/road-signs" className="btn btn-primary">
            Explore Road Signs Library
          </Link>
        </Card>
      ) : (
        courses.map((course) => {
          const courseModules = modules[course.id] || [];

          return (
            <div key={course.id} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Card className="glass-panel">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ maxWidth: '700px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {course.code || 'THEORY'}
                      </span>
                      <span>•</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {course.curriculumTitle}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{course.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                      {course.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {t('lms.estimatedDuration')}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t('lms.estimatedHoursValue', { hours: course.estimatedHours })}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Modules Accordion / List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {courseModules.map((mod) => (
                  <Card key={mod.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '14px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
                            {mod.title}
                          </h3>
                          {mod.isStudentOnly && (
                            <Badge variant="warning" style={{ fontSize: '0.7rem' }}>
                              Student Only
                            </Badge>
                          )}
                        </div>
                        {mod.description && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                            {mod.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={mod.completionPercentage === 100 ? 'success' : 'neutral'}>
                        {mod.completedLessonsCount} / {mod.lessons.length} {t('common.completed')}
                      </Badge>
                    </div>

                    {/* Lessons List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                      {mod.lessons.map((lesson) => {
                        const isLocked = (!lesson.isFreePreview && (mod.isStudentOnly || lesson.isStudentOnly) && user?.isGuest());

                        return (
                          <div
                            key={lesson.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              background: 'var(--bg-surface-elevated)',
                              borderRadius: 'var(--radius-lg)',
                              border: lesson.isCompleted
                                ? '1px solid rgba(16, 185, 129, 0.2)'
                                : '1px solid var(--border-subtle)',
                              opacity: isLocked ? 0.7 : 1,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {lesson.isCompleted ? (
                                <CheckCircle2 size={20} color="var(--success)" />
                              ) : isLocked ? (
                                <Lock size={18} color="var(--text-muted)" />
                              ) : (
                                <PlayCircle size={20} color="var(--primary-light)" />
                              )}
                              <div>
                                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                  {lesson.title}
                                </span>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                                  <Badge variant="neutral" style={{ fontSize: '0.65rem' }}>
                                    {lesson.getBadgeLabel()}
                                  </Badge>
                                  {lesson.isFreePreview && (
                                    <Badge variant="success" style={{ fontSize: '0.65rem' }}>
                                      {t('lms.freePreviewBadge')}
                                    </Badge>
                                  )}
                                  {lesson.isStudentOnly && (
                                    <Badge variant="warning" style={{ fontSize: '0.65rem' }}>
                                      Student Only
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              {isLocked ? (
                                <Link to="/register" className="btn btn-secondary btn-sm">
                                  <span>{t('lms.upgradeToAccess')}</span>
                                </Link>
                              ) : (
                                <Link to={`/lesson/${lesson.id}`} className="btn btn-outline btn-sm">
                                  <span>{lesson.isCompleted ? t('common.review') : t('lms.startLesson')}</span>
                                  <ArrowRight size={14} />
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
