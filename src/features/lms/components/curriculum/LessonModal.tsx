import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Globe, Lock, Users } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';

interface LessonModalProps {
  isOpen: boolean;
  module: any;
  lesson?: any | null;
  roadSignsList: any[];
  existingLessonsCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  module,
  lesson,
  roadSignsList,
  existingLessonsCount,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { success, warning, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const isEdit = Boolean(lesson);
  const [lesTitle, setLesTitle] = useState<string>('');
  const [lesType, setLesType] = useState<'TEXT' | 'AUDIO' | 'VIDEO' | 'ROAD_SIGN' | 'QUIZ'>('TEXT');
  const [lesContentText, setLesContentText] = useState<string>('');
  const [lesMediaUrl, setLesMediaUrl] = useState<string>('');
  const [lesMediaFile, setLesMediaFile] = useState<File | null>(null);
  const [lesRoadSignId, setLesRoadSignId] = useState<string>('');
  const [lesDurationMinutes, setLesDurationMinutes] = useState<number>(15);
  const [lesIsFreePreview, setLesIsFreePreview] = useState<boolean>(false);
  const [lesIsStudentOnly, setLesIsStudentOnly] = useState<boolean>(false);
  const [lesSortOrder, setLesSortOrder] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (lesson) {
      setLesTitle(lesson.title || '');
      setLesType(lesson.lesson_type || 'TEXT');
      setLesContentText(lesson.content_text || '');
      setLesMediaUrl(lesson.media_url || '');
      setLesMediaFile(null);
      setLesRoadSignId(lesson.road_sign || '');
      setLesDurationMinutes(lesson.duration_minutes || 15);
      setLesIsFreePreview(!!lesson.is_free_preview);
      setLesIsStudentOnly(!!lesson.is_student_only);
      setLesSortOrder(lesson.sort_order ?? 1);
    } else {
      setLesTitle('');
      setLesType('TEXT');
      setLesContentText('');
      setLesMediaUrl('');
      setLesMediaFile(null);
      setLesRoadSignId('');
      setLesDurationMinutes(15);
      setLesIsFreePreview(false);
      setLesIsStudentOnly(false);
      setLesSortOrder(existingLessonsCount + 1);
    }
  }, [lesson, existingLessonsCount, isOpen]);

  if (!isOpen || !module) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesTitle.trim()) {
      warning('Lesson title is required.');
      return;
    }

    if (lesType === 'TEXT' && !lesContentText.trim()) {
      warning('Please enter article / guide content for TEXT lessons.');
      return;
    }
    if (lesType === 'AUDIO' && !lesMediaFile && !lesMediaUrl.trim()) {
      warning('Please upload an audio file or provide a streaming audio URL.');
      return;
    }
    if (lesType === 'VIDEO' && !lesMediaFile && !lesMediaUrl.trim()) {
      warning('Please upload a video file or provide a video streaming / YouTube link.');
      return;
    }

    setIsSubmitting(true);
    try {
      let payload: FormData | Record<string, any>;
      if (lesMediaFile) {
        const fd = new FormData();
        fd.append('module', module.id);
        fd.append('title', lesTitle.trim());
        fd.append('lesson_type', lesType);
        fd.append('sort_order', String(lesSortOrder));
        fd.append('duration_minutes', String(lesDurationMinutes));
        fd.append('is_free_preview', String(lesIsFreePreview));
        fd.append('is_student_only', String(lesIsStudentOnly));
        if (lesContentText.trim()) fd.append('content_text', lesContentText.trim());
        if (lesMediaUrl.trim()) fd.append('media_url', lesMediaUrl.trim());
        fd.append('media_file', lesMediaFile);
        if (lesRoadSignId) fd.append('road_sign', lesRoadSignId);
        payload = fd;
      } else {
        payload = {
          module: module.id,
          title: lesTitle.trim(),
          lesson_type: lesType,
          sort_order: Number(lesSortOrder) || 1,
          duration_minutes: Number(lesDurationMinutes) || 15,
          is_free_preview: Boolean(lesIsFreePreview),
          is_student_only: Boolean(lesIsStudentOnly),
          content_text: lesContentText.trim() || undefined,
          media_url: lesMediaUrl.trim() || undefined,
          road_sign: lesRoadSignId || undefined,
        };
      }

      if (isEdit && lesson) {
        await adminService.updateLesson(lesson.id, payload);
        success('Updated lesson successfully.');
      } else {
        await adminService.createLesson(payload);
        success('Created lesson successfully.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to save lesson.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <BookOpen size={22} color="var(--primary)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              {isEdit
                ? t('admin.courses.modalEditLesson')
                : t('admin.courses.modalAddLesson')}
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {t('admin.courses.modulePrefix')} {module?.title}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('admin.courses.lessonTitleLabel')}
              </label>
              <input
                type="text"
                required
                placeholder={t('admin.courses.lessonTitlePlaceholder')}
                value={lesTitle}
                onChange={(e) => setLesTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('admin.courses.materialTypeLabel')}
              </label>
              <select
                value={lesType}
                onChange={(e) => setLesType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              >
                <option value="TEXT">{t('admin.courses.typeText')}</option>
                <option value="AUDIO">{t('admin.courses.typeAudio')}</option>
                <option value="VIDEO">{t('admin.courses.typeVideo')}</option>
                <option value="ROAD_SIGN">{t('admin.courses.typeRoadSign')}</option>
                <option value="QUIZ">{t('admin.courses.typeQuiz')}</option>
              </select>
            </div>
          </div>

          {/* Dynamic Type Fields */}
          {lesType === 'TEXT' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('admin.courses.lessonTextLabel')}
              </label>
              <textarea
                rows={8}
                required
                placeholder={t('admin.courses.lessonTextPlaceholder')}
                value={lesContentText}
                onChange={(e) => setLesContentText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  resize: 'vertical',
                  fontFamily: 'sans-serif',
                }}
              />
            </div>
          )}

          {lesType === 'AUDIO' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.uploadAudioLabel')}
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setLesMediaFile(file);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                {t('admin.courses.orAudioStream')}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.audioStreamUrlLabel')}
                </label>
                <input
                  type="url"
                  placeholder="https://cdn.example.com/audio/lesson-01.mp3"
                  value={lesMediaUrl}
                  onChange={(e) => setLesMediaUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.audioTranscriptLabel')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('admin.courses.audioTranscriptPlaceholder')}
                  value={lesContentText}
                  onChange={(e) => setLesContentText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {lesType === 'VIDEO' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.uploadVideoLabel')}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setLesMediaFile(file);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                {t('admin.courses.orVideoStream')}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.videoStreamUrlLabel')}
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://cdn.example.com/video.mp4"
                  value={lesMediaUrl}
                  onChange={(e) => setLesMediaUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.videoNotesLabel')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('admin.courses.videoNotesPlaceholder')}
                  value={lesContentText}
                  onChange={(e) => setLesContentText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {lesType === 'ROAD_SIGN' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.chooseRoadSignLabel')}
                </label>
                <select
                  value={lesRoadSignId}
                  onChange={(e) => setLesRoadSignId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                  }}
                >
                  <option value="">{t('admin.courses.chooseRoadSignPlaceholder')}</option>
                  {roadSignsList.map((rs: any) => (
                    <option key={rs.id} value={rs.id}>
                      {rs.code ? `[${rs.code}] ` : ''}
                      {rs.name || rs.title || 'Road Sign'} ({rs.category || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {t('admin.courses.roadSignDescriptionLabel')}
                </label>
                <textarea
                  rows={4}
                  placeholder={t('admin.courses.roadSignDescriptionPlaceholder')}
                  value={lesContentText}
                  onChange={(e) => setLesContentText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          )}

          {lesType === 'QUIZ' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('admin.courses.quizInstructionsLabel')}
              </label>
              <textarea
                rows={4}
                placeholder={t('admin.courses.quizInstructionsPlaceholder')}
                value={lesContentText}
                onChange={(e) => setLesContentText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

          {/* Common Lesson Settings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('admin.courses.estDurationLabel')}
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={lesDurationMinutes}
                onChange={(e) => setLesDurationMinutes(parseInt(e.target.value) || 15)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('admin.courses.sortOrderLabel')}
              </label>
              <input
                type="number"
                min={1}
                value={lesSortOrder}
                onChange={(e) => setLesSortOrder(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                }}
              />
            </div>
          </div>

          {/* Audience & Access Level Management */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Audience & Access Level
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: lesIsFreePreview ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  border: lesIsFreePreview ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                }}
              >
                <input
                  type="radio"
                  name="lessonAccessLevel"
                  checked={lesIsFreePreview}
                  onChange={() => {
                    setLesIsFreePreview(true);
                    setLesIsStudentOnly(false);
                  }}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#10B981' }}>
                    <Globe size={15} />
                    <span>Public / Free Preview (Open to Guests & Students)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    Accessible to public visitors and guest trial accounts as introductory material.
                  </span>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: lesIsStudentOnly ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  border: lesIsStudentOnly ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
                }}
              >
                <input
                  type="radio"
                  name="lessonAccessLevel"
                  checked={lesIsStudentOnly}
                  onChange={() => {
                    setLesIsFreePreview(false);
                    setLesIsStudentOnly(true);
                  }}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#F59E0B' }}>
                    <Lock size={15} />
                    <span>Student Only (Exclusive to Enrolled Students)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    Restricted material. Blocked from guests and requires an active student account.
                  </span>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: !lesIsFreePreview && !lesIsStudentOnly ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  border: !lesIsFreePreview && !lesIsStudentOnly ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                }}
              >
                <input
                  type="radio"
                  name="lessonAccessLevel"
                  checked={!lesIsFreePreview && !lesIsStudentOnly}
                  onChange={() => {
                    setLesIsFreePreview(false);
                    setLesIsStudentOnly(false);
                  }}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#38BDF8' }}>
                    <Users size={15} />
                    <span>Standard Material (All Authenticated Users)</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    Accessible to any logged-in user on the learning platform.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('admin.courses.cancelBtn')}
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting
                ? t('admin.courses.saving')
                : isEdit
                ? t('admin.courses.saveChanges')
                : t('admin.courses.createLessonBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
