import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Lock, AlertCircle, Headphones, Sparkles } from 'lucide-react';
import { LmsService } from '../../core/services/LmsService';
import { Lesson } from '../../core/models/Lesson';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';

export const LessonViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  const { t, language } = useTranslation();

  const isGuest = user?.role === 'GUEST';

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) {
        setIsLoading(false);
        setErrorMessage('No lesson ID specified.');
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setIsForbidden(false);

      try {
        const lms = LmsService.getInstance();
        const data = await lms.getLessonDetail(id);
        setLesson(data);
      } catch (err: any) {
        console.error('Failed to load lesson:', err);
        const status = err?.status || err?.statusCode;
        if (status === 403 || err?.message?.toLowerCase().includes('permission') || err?.message?.toLowerCase().includes('student')) {
          setIsForbidden(true);
          setErrorMessage('This lesson is restricted to enrolled students. Guest accounts cannot access student-only lessons.');
        } else if (status === 404) {
          setErrorMessage('The requested lesson was not found or has been unpublished by the training admin.');
        } else {
          setErrorMessage(err?.message || 'Failed to load lesson from database.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const handleMarkComplete = async () => {
    if (!lesson) return;
    setIsCompleting(true);
    try {
      await LmsService.getInstance().markLessonComplete(lesson.id);
      success(t('lms.lessonCompletedToast'));
      navigate('/courses');
    } catch (err: any) {
      error(err.message || t('common.errorOccurred'));
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
        <Spinner message={t('common.loading')} />
      </div>
    );
  }

  if (isForbidden || (isGuest && lesson?.isStudentOnly && !lesson.isFreePreview)) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center' }}>
        <Card>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <Lock size={32} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
            Student-Only Learning Material
          </h2>

          <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
            This lesson is managed as student-only by the training admin. To access this material, official mock exams, and attend live tutoring classes, please upgrade your account.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/courses" className="btn btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Courses</span>
            </Link>
            <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              <span>Upgrade to Full Student</span>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (errorMessage || !lesson) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center' }}>
        <Card>
          <AlertCircle size={48} color="#D9381E" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
            {t('lms.lessonNotFound')}
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '20px' }}>
            {errorMessage || 'Unable to retrieve lesson content from the database.'}
          </p>
          <Link to="/courses" className="btn btn-primary">
            <ArrowLeft size={16} />
            <span>{t('lms.backToOutline')}</span>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <Link
          to="/courses"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#0055A5',
            fontSize: '0.9rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={18} />
          <span>{t('lms.backToModules')}</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lesson.isFreePreview && <Badge variant="success">Public Preview</Badge>}
          {lesson.isStudentOnly && <Badge variant="warning">Student Only</Badge>}
          <Badge variant="info">{lesson.getBadgeLabel()}</Badge>
        </div>
      </div>

      {/* Lesson Reader Card */}
      <Card>
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
            {lesson.title}
          </h1>
          <div style={{ display: 'flex', gap: '20px', color: '#64748B', fontSize: '0.82rem', flexWrap: 'wrap' }}>
            <span>
              {t('lms.readingTime')} {t('lms.readingTimeValue', { minutes: lesson.durationMinutes })}
            </span>
            <span>Duration: {lesson.getFormattedDuration()}</span>
            <span>Type: {lesson.lessonType}</span>
          </div>
        </div>

        {/* Media Player: Audio */}
        {lesson.lessonType === 'AUDIO' && lesson.audioUrl && (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#7C3AED' }}>
              <Headphones size={20} />
              <span>Audio Lecture</span>
            </div>
            <audio controls style={{ width: '100%' }} src={lesson.audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Media Player: Video */}
        {lesson.lessonType === 'VIDEO' && lesson.videoUrl && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#0F172A',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'center',
            }}
          >
            {lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') ? (
              <iframe
                title={lesson.title}
                src={lesson.videoUrl.replace('watch?v=', 'embed/')}
                style={{ width: '100%', height: '400px', border: 'none', borderRadius: '4px' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls style={{ width: '100%', maxHeight: '440px', borderRadius: '4px' }} src={lesson.videoUrl}>
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}

        {/* Content Body */}
        {lesson.content ? (
          <div
            style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'var(--text-primary, #1E293B)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {lesson.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} style={{ fontSize: '1.25rem', marginTop: '12px', color: '#0055A5' }}>
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4 key={index} style={{ fontSize: '1.05rem', marginTop: '8px', color: '#D9381E' }}>
                    {paragraph.replace('#### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('* ') || paragraph.startsWith('1. ')) {
                return (
                  <div key={index} style={{ paddingLeft: '16px', borderLeft: '3px solid #E2E8F0' }}>
                    {paragraph.split('\n').map((line, li) => (
                      <div key={li} style={{ marginBottom: '6px' }}>{line}</div>
                    ))}
                  </div>
                );
              }
              return <p key={index}>{paragraph}</p>;
            })}
          </div>
        ) : (
          !lesson.audioUrl && !lesson.videoUrl && (
            <p style={{ color: '#94A3B8', fontStyle: 'italic' }}>
              No text content provided for this lesson yet.
            </p>
          )
        )}

        {/* Completion Action */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle, #E2E8F0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
            {language === 'rw'
              ? 'Menya neza ko wumvise iki gice mbere yo gukomeza ku kizamini cy\'imyitozo.'
              : 'Ensure you understand this chapter before proceeding to the quiz assessment.'}
          </div>

          {!isGuest && (
            <Button
              variant="primary"
              onClick={handleMarkComplete}
              isLoading={isCompleting}
              icon={<CheckCircle2 size={18} />}
            >
              {t('lms.markCompleted')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
