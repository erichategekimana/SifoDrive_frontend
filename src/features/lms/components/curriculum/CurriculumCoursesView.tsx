import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  BookOpen,
  Eye,
  EyeOff,
  Lock,
  Pencil,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import type { CurriculumItem } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';
import { CourseModal } from './CourseModal';

interface CurriculumCoursesViewProps {
  curriculum: CurriculumItem;
  courses: any[];
  curricula: CurriculumItem[];
  isSystemAdmin?: boolean;
  isTrainingAdmin?: boolean;
  onBack: () => void;
  onSelectCourse: (course: any) => void;
  onRefresh: () => void;
}

export const CurriculumCoursesView: React.FC<CurriculumCoursesViewProps> = ({
  curriculum,
  courses,
  curricula,
  isSystemAdmin,
  isTrainingAdmin: _isTrainingAdmin,
  onBack,
  onSelectCourse,
  onRefresh,
}) => {
  const canManageCourse = Boolean(isSystemAdmin);
  const { t, language } = useTranslation();
  const { success, warning, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const [courseSearch, setCourseSearch] = useState<string>('');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (String(c.curriculum) !== String(curriculum.id)) {
        return false;
      }
      if (!courseSearch) return true;
      const q = courseSearch.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.title_rw?.toLowerCase().includes(q) ||
        c.title_kinyarwanda?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    });
  }, [courses, courseSearch, curriculum.id]);

  const handleTogglePublish = async (course: any) => {
    if (!course.is_published && !curriculum.is_published) {
      warning('Cannot publish course under an unpublished curriculum. Please publish the parent curriculum first.');
      return;
    }

    const modCount = course.module_count ?? course.modules_count ?? 0;
    if (!course.is_published && modCount === 0) {
      warning('Cannot publish an empty course. Training admin must add course modules before publishing.');
      return;
    }

    try {
      if (course.is_published) {
        await adminService.unpublishCourse(course.id);
        warning(`Course "${course.title}" unpublished and moved to draft.`);
      } else {
        await adminService.publishCourse(course.id);
        success(`Course "${course.title}" is published and live for learners.`);
      }
      onRefresh();
    } catch (err: any) {
      toastError(err?.message || 'Could not update course publication status.');
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}"?`)) return;
    try {
      await adminService.deleteCourse(courseId);
      success(`Course "${title}" has been deleted.`);
      onRefresh();
    } catch (err: any) {
      toastError(err?.message || 'Could not delete course.');
    }
  };

  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (c: any) => {
    setEditingCourse(c);
    setIsCourseModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Curriculum Header & Breadcrumb */}
      <div
        style={{
          padding: '16px 22px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
          >
            <ArrowLeft size={15} />
            <span>{t('admin.courses.backToCurricula')}</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {language === 'rw' && curriculum.title_kinyarwanda
                  ? curriculum.title_kinyarwanda
                  : curriculum.title}
              </h2>
              {curriculum.is_published ? (
                <Badge variant="success">{t('admin.courses.publishedBadge')}</Badge>
              ) : (
                <Badge variant="warning">{t('admin.courses.draftBadgeUpper')}</Badge>
              )}
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#818cf8',
                  fontFamily: 'monospace',
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                {curriculum.code || 'RW-CURR'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {(language === 'rw' && curriculum.description_kinyarwanda
                ? curriculum.description_kinyarwanda
                : curriculum.description) || t('admin.courses.coursesUnderCurriculum')}
            </p>
          </div>
        </div>

        {canManageCourse && (
          <button
            onClick={handleOpenCreateCourse}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>{t('admin.courses.createCourse')}</span>
          </button>
        )}
      </div>

      {/* Courses under this Curriculum */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={t('admin.courses.searchCoursesPlaceholder')}
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.84rem',
              }}
            />
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {t('admin.courses.noCoursesInCurriculum')}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t('admin.courses.codeCol')}
                  </th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t('admin.courses.titleCol')}
                  </th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t('admin.courses.descCol')}
                  </th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t('admin.courses.statusCol')}
                  </th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t('admin.courses.modulesCol')}
                  </th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {t('admin.courses.actionsCol')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => {
                  const modCount = c.module_count ?? c.modules_count ?? 0;
                  const isEmpty = modCount === 0;
                  const displayCode = c.code || (c.id ? c.id.slice(0, 8).toUpperCase() : 'RW-LMS');

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                        {displayCode}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                        <div>{language === 'rw' && (c.title_rw || c.title_kinyarwanda) ? (c.title_rw || c.title_kinyarwanda) : c.title}</div>
                        {c.estimated_hours ? (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                            ~{c.estimated_hours} {t('admin.courses.hrsStudyTime')}
                          </div>
                        ) : null}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.title_rw || c.description || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {c.is_published ? (
                          <Badge variant="success">{t('admin.courses.publishedBadge')}</Badge>
                        ) : isEmpty ? (
                          <Badge variant="warning">{t('admin.courses.draftEmpty')}</Badge>
                        ) : (
                          <Badge variant="neutral">
                            {t('admin.courses.draftWithMods', { count: modCount })}
                          </Badge>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isEmpty ? (
                          <span style={{ color: 'var(--warning)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                            <AlertCircle size={14} />
                            {t('admin.courses.awaitingContent')}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {modCount} {modCount === 1 ? t('admin.courses.lessonWord') : t('admin.courses.modulesTitle')}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {/* Modules & Lessons button */}
                          <button
                            onClick={() => onSelectCourse(c)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title={t('admin.courses.modulesBtnTitle')}
                          >
                            <BookOpen size={13} />
                            <span>{t('admin.courses.modulesBtn')}</span>
                          </button>

                          {/* Course Publishing, Edit, and Delete for Training and System Admins */}
                          {canManageCourse && (
                            <>
                              {c.is_published ? (
                                <button
                                  onClick={() => handleTogglePublish(c)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  title={t('admin.courses.unpublish')}
                                >
                                  <EyeOff size={13} />
                                  <span>{t('admin.courses.unpublish')}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleTogglePublish(c)}
                                  className="btn btn-secondary btn-sm"
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '4px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    opacity: (!curriculum.is_published || isEmpty) ? 0.65 : 1,
                                    borderColor: (!curriculum.is_published || isEmpty) ? 'rgba(234, 179, 8, 0.4)' : undefined,
                                    color: (!curriculum.is_published || isEmpty) ? 'var(--warning)' : undefined,
                                  }}
                                  title={
                                    !curriculum.is_published
                                      ? 'Cannot publish course under an unpublished curriculum. Please publish the curriculum first.'
                                      : isEmpty
                                      ? 'Cannot publish empty course. Training admin must add modules first.'
                                      : 'Publish course'
                                  }
                                >
                                  {(!curriculum.is_published || isEmpty) ? <Lock size={13} /> : <Eye size={13} />}
                                  <span>{t('admin.courses.publish')}</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditCourse(c)}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-light)' }}
                                title={t('admin.courses.editCourse')}
                              >
                                <Pencil size={13} />
                                <span>{t('admin.courses.editCourse')}</span>
                              </button>

                              <button
                                onClick={() => handleDeleteCourse(c.id, c.title)}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--danger)' }}
                                title={t('admin.courses.deleteCourse')}
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CourseModal
        isOpen={isCourseModalOpen}
        course={editingCourse}
        curricula={curricula}
        defaultCurriculumId={curriculum.id}
        onClose={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
        }}
        onSuccess={() => {
          setIsCourseModalOpen(false);
          setEditingCourse(null);
          onRefresh();
        }}
      />
    </div>
  );
};
