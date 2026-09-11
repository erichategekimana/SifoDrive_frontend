import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, PlayCircle, Lock, ArrowRight } from 'lucide-react';
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
  const { t, language } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Record<string, Module[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLmsContent = async () => {
      try {
        const lms = LmsService.getInstance();
        const courseList = await lms.getCourses();

        if (courseList.length === 0) {
          const isRw = language === 'rw';
          // Fallback demo courses matching Rwanda National Police Curriculum
          const demoCourse = new Course({
            id: 'demo-course-1',
            title: isRw
              ? 'Integanyanyigisho Rusange y’Amategeko y’Umuhanda mu Rwanda'
              : 'Universal Rwanda Driving Theory Curriculum (Amategeko y’Umuhanda)',
            description: isRw
              ? 'Integanyanyigisho yemewe y’amategeko y’umuhanda mu Rwanda ikubiyemo ibyerekeye gutanga inzira mu masangano, ibyapa, ibimenyetso by’abapolisi, umutekano w’ikinyabiziga, n’amande.'
              : 'Official Rwandan Highway Code curriculum covering priority at intersections, traffic signs, police hand signals, vehicle safety, and penalties.',
            estimated_hours: 20,
            modules_count: 5,
            lessons_count: 24,
            progress_percentage: 35,
          });
          setCourses([demoCourse]);

          setModules({
            'demo-course-1': [
              new Module({
                id: 'mod-1',
                course: 'demo-course-1',
                title: isRw
                  ? 'Ingingo ya 1: Amategeko Rusange n’Imikoreshereze y’Umuhanda'
                  : 'Module 1: General Rules & Road Usage (Amategeko Rusange)',
                description: isRw
                  ? 'Uburenganzira bwo gutambuka mbere, umuvuduko ntarengwa, kunyuranaho, n’ibikoresho by’ingenzi by’ikinyabiziga.'
                  : 'Right of way, speed restrictions, overtaking, and vehicle equipment requirements.',
                order: 1,
                lessons: [
                  {
                    id: 'les-1',
                    module: 'mod-1',
                    title: isRw
                      ? '1.1 Ibyiciro by’Imihanda Rusange n’Umuvuduko Ntarengwa'
                      : '1.1 Classification of Public Roads & Speed Limits',
                    lesson_type: 'TEXT',
                    order: 1,
                    is_completed: true,
                    is_free_preview: true,
                  },
                  {
                    id: 'les-2',
                    module: 'mod-1',
                    title: isRw
                      ? '1.2 Kunyuranaho no Kugendera mu Mukono Wabyo'
                      : '1.2 Overtaking & Lane Discipline',
                    lesson_type: 'TEXT',
                    order: 2,
                    is_completed: true,
                    is_free_preview: true,
                  },
                  {
                    id: 'les-3',
                    module: 'mod-1',
                    title: isRw
                      ? '1.3 Amasangano y’Imihanda n’Ibyerekeye Karitsiye (Roundabout)'
                      : '1.3 Intersections & Right of Way at Roundabouts',
                    lesson_type: 'VIDEO',
                    order: 3,
                    is_completed: false,
                    is_free_preview: false,
                  },
                ],
              }),
              new Module({
                id: 'mod-2',
                course: 'demo-course-1',
                title: isRw
                  ? 'Ingingo ya 2: Ibyapa n’Ibimenyetso byo mu Muhanda'
                  : 'Module 2: Road Signs & Markings (Ibimenyetso byo mu Muhanda)',
                description: isRw
                  ? 'Ibyapa by’akaga, ibibuzwa, ibitegetswe, n’ibiyobora.'
                  : 'Warning, prohibitory, mandatory, and informative traffic sign comprehension.',
                order: 2,
                lessons: [
                  {
                    id: 'les-4',
                    module: 'mod-2',
                    title: isRw
                      ? '2.1 Ibyapa by’Akaga n’Iburira Bihagaze nk’Impande Eshatu'
                      : '2.1 Danger & Warning Triangular Signs',
                    lesson_type: 'ROAD_SIGN',
                    order: 1,
                    is_completed: true,
                    is_free_preview: true,
                  },
                  {
                    id: 'les-5',
                    module: 'mod-2',
                    title: isRw
                      ? '2.2 Ibyapa Bibuza bifite Uruziga Rutukura'
                      : '2.2 Prohibitory & Priority Red Circle Signs',
                    lesson_type: 'ROAD_SIGN',
                    order: 2,
                    is_completed: false,
                    is_free_preview: false,
                  },
                  {
                    id: 'les-6',
                    module: 'mod-2',
                    title: isRw
                      ? '2.3 Ikizamini cy’Imyitozo: Gusuzuma Ibyapa n’Ibimenyetso'
                      : '2.3 Practice Quiz: Signs & Signals Evaluation',
                    lesson_type: 'QUIZ',
                    order: 3,
                    is_completed: false,
                    is_free_preview: false,
                  },
                ],
              }),
              new Module({
                id: 'mod-3',
                course: 'demo-course-1',
                title: isRw
                  ? 'Ingingo ya 3: Ibihe Bidasanzwe, Guparika n’Ibihano'
                  : 'Module 3: Special Situations, Parking & Penalties',
                description: isRw
                  ? 'Kugendera mu misozi, gutwara imvura igwa, ubutabazi mu mpanuka, n’amande ateganywa n’amategeko.'
                  : 'Mountain driving, rainy season protocols, accident management, and fines.',
                order: 3,
                lessons: [
                  {
                    id: 'les-7',
                    module: 'mod-3',
                    title: isRw
                      ? '3.1 Gutwara Nijoro n’Imikoreshereze y’Amatara'
                      : '3.1 Night Driving & Headlight Regulations',
                    lesson_type: 'TEXT',
                    order: 1,
                    is_completed: false,
                    is_free_preview: false,
                  },
                  {
                    id: 'les-8',
                    module: 'mod-3',
                    title: isRw
                      ? '3.2 Ibihano by’Amategeko, Gufatira Ibinyabiziga n’Amande'
                      : '3.2 Legal Penalties, Confiscation & Fines (Amande)',
                    lesson_type: 'TEXT',
                    order: 2,
                    is_completed: false,
                    is_free_preview: false,
                  },
                ],
              }),
            ],
          });
        } else {
          setCourses(courseList);
        }
      } catch (err) {
        console.warn('Using preview curriculum:', err);
        const isRw = language === 'rw';
        const demoCourse = new Course({
          id: 'demo-course-1',
          title: isRw
            ? 'Integanyanyigisho Rusange y’Amategeko y’Umuhanda mu Rwanda'
            : 'Universal Rwanda Driving Theory Curriculum (Amategeko y’Umuhanda)',
          description: isRw
            ? 'Integanyanyigisho yemewe y’amategeko y’umuhanda mu Rwanda ikubiyemo ibyerekeye gutanga inzira mu masangano, ibyapa, ibimenyetso by’abapolisi, umutekano w’ikinyabiziga, n’amande.'
            : 'Official Rwandan Highway Code curriculum covering priority at intersections, traffic signs, police hand signals, vehicle safety, and penalties.',
          estimated_hours: 20,
          modules_count: 5,
          lessons_count: 24,
          progress_percentage: 35,
        });
        setCourses([demoCourse]);
        setModules({
          'demo-course-1': [
            new Module({
              id: 'mod-1',
              course: 'demo-course-1',
              title: isRw
                ? 'Ingingo ya 1: Amategeko Rusange n’Imikoreshereze y’Umuhanda'
                : 'Module 1: General Rules & Road Usage (Amategeko Rusange)',
              description: isRw
                ? 'Uburenganzira bwo gutambuka mbere, umuvuduko ntarengwa, kunyuranaho, n’ibikoresho by’ingenzi by’ikinyabiziga.'
                : 'Right of way, speed restrictions, overtaking, and vehicle equipment requirements.',
              order: 1,
              lessons: [
                {
                  id: 'les-1',
                  module: 'mod-1',
                  title: isRw
                    ? '1.1 Ibyiciro by’Imihanda Rusange n’Umuvuduko Ntarengwa'
                    : '1.1 Classification of Public Roads & Speed Limits',
                  lesson_type: 'TEXT',
                  order: 1,
                  is_completed: true,
                  is_free_preview: true,
                },
                {
                  id: 'les-2',
                  module: 'mod-1',
                  title: isRw
                    ? '1.2 Kunyuranaho no Kugendera mu Mukono Wabyo'
                    : '1.2 Overtaking & Lane Discipline',
                  lesson_type: 'TEXT',
                  order: 2,
                  is_completed: true,
                  is_free_preview: true,
                },
                {
                  id: 'les-3',
                  module: 'mod-1',
                  title: isRw
                    ? '1.3 Amasangano y’Imihanda n’Ibyerekeye Karitsiye (Roundabout)'
                    : '1.3 Intersections & Right of Way at Roundabouts',
                  lesson_type: 'VIDEO',
                  order: 3,
                  is_completed: false,
                  is_free_preview: false,
                },
              ],
            }),
            new Module({
              id: 'mod-2',
              course: 'demo-course-1',
              title: isRw
                ? 'Ingingo ya 2: Ibyapa n’Ibimenyetso byo mu Muhanda'
                : 'Module 2: Road Signs & Markings (Ibimenyetso byo mu Muhanda)',
              description: isRw
                ? 'Ibyapa by’akaga, ibibuzwa, ibitegetswe, n’ibiyobora.'
                : 'Warning, prohibitory, mandatory, and informative traffic sign comprehension.',
              order: 2,
              lessons: [
                {
                  id: 'les-4',
                  module: 'mod-2',
                  title: isRw
                    ? '2.1 Ibyapa by’Akaga n’Iburira Bihagaze nk’Impande Eshatu'
                    : '2.1 Danger & Warning Triangular Signs',
                  lesson_type: 'ROAD_SIGN',
                  order: 1,
                  is_completed: true,
                  is_free_preview: true,
                },
                {
                  id: 'les-5',
                  module: 'mod-2',
                  title: isRw
                    ? '2.2 Ibyapa Bibuza bifite Uruziga Rutukura'
                    : '2.2 Prohibitory & Priority Red Circle Signs',
                  lesson_type: 'ROAD_SIGN',
                  order: 2,
                  is_completed: false,
                  is_free_preview: false,
                },
                {
                  id: 'les-6',
                  module: 'mod-2',
                  title: isRw
                    ? '2.3 Ikizamini cy’Imyitozo: Gusuzuma Ibyapa n’Ibimenyetso'
                    : '2.3 Practice Quiz: Signs & Signals Evaluation',
                  lesson_type: 'QUIZ',
                  order: 3,
                  is_completed: false,
                  is_free_preview: false,
                },
              ],
            }),
            new Module({
              id: 'mod-3',
              course: 'demo-course-1',
              title: isRw
                ? 'Ingingo ya 3: Ibihe Bidasanzwe, Guparika n’Ibihano'
                : 'Module 3: Special Situations, Parking & Penalties',
              description: isRw
                ? 'Kugendera mu misozi, gutwara imvura igwa, ubutabazi mu mpanuka, n’amande ateganywa n’amategeko.'
                : 'Mountain driving, rainy season protocols, accident management, and fines.',
              order: 3,
              lessons: [
                {
                  id: 'les-7',
                  module: 'mod-3',
                  title: isRw
                    ? '3.1 Gutwara Nijoro n’Imikoreshereze y’Amatara'
                    : '3.1 Night Driving & Headlight Regulations',
                  lesson_type: 'TEXT',
                  order: 1,
                  is_completed: false,
                  is_free_preview: false,
                },
                {
                  id: 'les-8',
                  module: 'mod-3',
                  title: isRw
                    ? '3.2 Ibihano by’Amategeko, Gufatira Ibinyabiziga n’Amande'
                    : '3.2 Legal Penalties, Confiscation & Fines (Amande)',
                  lesson_type: 'TEXT',
                  order: 2,
                  is_completed: false,
                  is_free_preview: false,
                },
              ],
            }),
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLmsContent();
  }, [language]);

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

      {courses.map((course) => {
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
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{mod.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>
                        {mod.description}
                      </p>
                    </div>
                    <Badge variant={mod.completionPercentage === 100 ? 'success' : 'neutral'}>
                      {mod.completedLessonsCount} / {mod.lessons.length} {t('common.completed')}
                    </Badge>
                  </div>

                  {/* Lessons List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                    {mod.lessons.map((lesson) => {
                      const isLocked = !lesson.isFreePreview && user?.isGuest();

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
                                  <Badge variant="info" style={{ fontSize: '0.65rem' }}>
                                    {t('lms.freePreviewBadge')}
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
      })}
    </div>
  );
};
