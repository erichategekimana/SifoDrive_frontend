import React, { useState, useEffect } from 'react';
import { BookOpen, Pencil, X } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import type { CurriculumItem } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';

interface CourseModalProps {
  isOpen: boolean;
  course?: any | null; // If provided, edit mode. Else create mode.
  curricula: CurriculumItem[];
  defaultCurriculumId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  course,
  curricula,
  defaultCurriculumId,
  onClose,
  onSuccess,
}) => {
  const { t, language } = useTranslation();
  const { success, warning, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const isEdit = Boolean(course);
  const [courseCurriculumId, setCourseCurriculumId] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('');
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseTitleRw, setCourseTitleRw] = useState<string>('');
  const [courseDescription, setCourseDescription] = useState<string>('');
  const [courseHours, setCourseHours] = useState<number>(10);
  const [courseSortOrder, setCourseSortOrder] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (course) {
      setCourseCurriculumId(course.curriculum || '');
      setCourseCode(course.code || (course.id ? course.id.slice(0, 8).toUpperCase() : ''));
      setCourseTitle(course.title || '');
      setCourseTitleRw(course.title_rw || course.title_kinyarwanda || '');
      setCourseDescription(course.description || '');
      setCourseHours(course.estimated_hours || 10);
      setCourseSortOrder(course.sort_order || 1);
    } else {
      setCourseCurriculumId(defaultCurriculumId || curricula[0]?.id || '');
      setCourseCode('');
      setCourseTitle('');
      setCourseTitleRw('');
      setCourseDescription('');
      setCourseHours(10);
      setCourseSortOrder(1);
    }
  }, [course, defaultCurriculumId, curricula, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      warning('Course Title is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit && course) {
        await adminService.updateCourse(course.id, {
          curriculum: courseCurriculumId || undefined,
          title: courseTitle.trim(),
          title_rw: courseTitleRw.trim() || undefined,
          code: courseCode.trim().toUpperCase() || undefined,
          description: courseDescription.trim() || undefined,
          estimated_hours: Number(courseHours) || 10,
          sort_order: Number(courseSortOrder) || 1,
        });
        success(`Updated course "${courseTitle}".`);
      } else {
        await adminService.createCourse({
          curriculum: courseCurriculumId || undefined,
          title: courseTitle.trim(),
          title_rw: courseTitleRw.trim() || undefined,
          code: courseCode.trim().toUpperCase() || undefined,
          description: courseDescription.trim() || undefined,
          estimated_hours: Number(courseHours) || 10,
          sort_order: Number(courseSortOrder) || 1,
          is_published: false,
        });
        success(`Created draft course "${courseTitle}".`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || (isEdit ? 'Failed to update course.' : 'Failed to create course.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEdit ? <Pencil size={22} color="var(--primary)" /> : <BookOpen size={22} color="var(--primary)" />}
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              {isEdit ? 'Edit Course Details' : 'Create New Course'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {t('admin.courses.selectCurriculum')}
            </label>
            <select
              value={courseCurriculumId}
              onChange={(e) => setCourseCurriculumId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
              }}
            >
              <option value="">-- {t('admin.courses.selectCurriculum')} --</option>
              {curricula.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.code ? `[${curr.code}] ` : ''}
                  {language === 'rw' && curr.title_kinyarwanda ? curr.title_kinyarwanda : curr.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Course Code
            </label>
            <input
              type="text"
              placeholder="RW-TH-01"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Title (English) *
            </label>
            <input
              type="text"
              required
              placeholder="Rwandan Highway Code & Traffic Rules"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
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
              Title (Kinyarwanda)
            </label>
            <input
              type="text"
              placeholder="Amategeko y'Umuhanda mu Rwanda"
              value={courseTitleRw}
              onChange={(e) => setCourseTitleRw(e.target.value)}
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

          {isEdit && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Estimated Hours
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={courseHours}
                onChange={(e) => setCourseHours(parseInt(e.target.value) || 10)}
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
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Course syllabus and preparation..."
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
