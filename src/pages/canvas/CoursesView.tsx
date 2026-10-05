import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Compass,
  ArrowLeft,
  Search,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';
import { LmsService } from '../../core/services/LmsService';
import { Course } from '../../core/models/Course';
import { Spinner } from '../../components/common/Spinner';
import {
  SupportTicketService,
  type SupportAnnouncementDTO,
} from '../../core/services/SupportTicketService';
import { CanvasCourseWorkspace } from '../../features/lms/components/course/CanvasCourseWorkspace';

export const CoursesView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: courseIdParam } = useParams<{ id?: string }>();
  const highlightAnnouncementId = searchParams.get('announcement');

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [announcements, setAnnouncements] = useState<SupportAnnouncementDTO[]>([]);
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
    SupportTicketService.getInstance().getAnnouncements().then((data) => {
      setAnnouncements(data || []);
    });
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

    return (
      <CanvasCourseWorkspace
        course={selectedCourse}
        announcements={announcements}
        onBackToCourses={handleBackToCourses}
        highlightAnnouncementId={highlightAnnouncementId}
      />
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
