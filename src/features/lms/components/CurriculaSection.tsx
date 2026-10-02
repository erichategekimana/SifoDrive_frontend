import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from 'lucide-react';
import { AdminService } from '../../../core/services/AdminService';
import type { CurriculumItem } from '../../../core/services/AdminService';
import { Badge } from '../../../components/common/Badge';
import { useToast } from '../../../context/ToastContext';
import { useTranslation } from '../../../context/I18nContext';
import { CurriculumModal } from './curriculum/CurriculumModal';
import { CurriculumCoursesView } from './curriculum/CurriculumCoursesView';
import { CourseModulesBuilder } from './curriculum/CourseModulesBuilder';

export interface CurriculaSectionProps {
  curricula: CurriculumItem[];
  courses: any[];
  isSystemAdmin?: boolean;
  isTrainingAdmin?: boolean;
  refetch?: () => Promise<void>;
  onRefresh?: () => void;
}

export const CurriculaSection: React.FC<CurriculaSectionProps> = ({
  curricula,
  courses,
  isSystemAdmin,
  isTrainingAdmin,
  refetch,
  onRefresh,
}) => {
  const triggerRefresh = () => {
    if (refetch) refetch();
    else if (onRefresh) onRefresh();
  };
  const { t, language } = useTranslation();
  const { success, warning, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const [curriculumSearch, setCurriculumSearch] = useState<string>('');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Modal State
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState<boolean>(false);
  const [editingCurriculum, setEditingCurriculum] = useState<CurriculumItem | null>(null);

  // Keep selected items in sync with latest props
  const selectedCurriculum = useMemo(() => {
    if (!selectedCurriculumId) return null;
    return curricula.find((c) => c.id === selectedCurriculumId) || null;
  }, [curricula, selectedCurriculumId]);

  const selectedCourse = useMemo(() => {
    if (!selectedCourseId) return null;
    return courses.find((c) => c.id === selectedCourseId) || null;
  }, [courses, selectedCourseId]);

  const filteredCurricula = useMemo(() => {
    return curricula.filter((curr) => {
      if (!curriculumSearch) return true;
      const q = curriculumSearch.toLowerCase();
      return (
        curr.title?.toLowerCase().includes(q) ||
        curr.title_kinyarwanda?.toLowerCase().includes(q) ||
        curr.code?.toLowerCase().includes(q) ||
        curr.description?.toLowerCase().includes(q)
      );
    });
  }, [curricula, curriculumSearch]);

  const handleTogglePublishCurriculum = async (curr: CurriculumItem) => {
    try {
      if (curr.is_published) {
        await adminService.unpublishCurriculum(curr.id);
        warning(`Curriculum "${curr.title}" unpublished and moved to draft.`);
      } else {
        await adminService.publishCurriculum(curr.id);
        success(`Curriculum "${curr.title}" published.`);
      }
      triggerRefresh();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update curriculum status.');
    }
  };

  const handleDeleteCurriculum = async (currId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete curriculum "${title}"?`)) return;
    try {
      await adminService.deleteCurriculum(currId);
      success(`Curriculum "${title}" deleted.`);
      if (selectedCurriculumId === currId) {
        setSelectedCurriculumId(null);
      }
      triggerRefresh();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete curriculum.');
    }
  };

  const handleOpenCreateCurriculum = () => {
    setEditingCurriculum(null);
    setIsCurriculumModalOpen(true);
  };

  const handleOpenEditCurriculum = (curr: CurriculumItem) => {
    setEditingCurriculum(curr);
    setIsCurriculumModalOpen(true);
  };

  // LEVEL 3: Course Modules & Lessons Studio
  if (selectedCourse) {
    return (
      <CourseModulesBuilder
        course={selectedCourse}
        onBack={() => setSelectedCourseId(null)}
        isSystemAdmin={isSystemAdmin}
        isTrainingAdmin={isTrainingAdmin}
        onCourseUpdated={triggerRefresh}
      />
    );
  }

  // LEVEL 2: Curriculum Detail & Courses View
  if (selectedCurriculum) {
    return (
      <CurriculumCoursesView
        curriculum={selectedCurriculum}
        courses={courses}
        curricula={curricula}
        isSystemAdmin={isSystemAdmin}
        isTrainingAdmin={isTrainingAdmin}
        onBack={() => setSelectedCurriculumId(null)}
        onSelectCourse={(course) => setSelectedCourseId(course.id)}
        onRefresh={triggerRefresh}
      />
    );
  }

  // LEVEL 1: Curricula Overview & List
  return (
    <>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={t('admin.courses.searchCurriculaPlaceholder')}
              value={curriculumSearch}
              onChange={(e) => setCurriculumSearch(e.target.value)}
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

        {isSystemAdmin && (
          <button
            onClick={handleOpenCreateCurriculum}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>{t('admin.courses.createCurriculum')}</span>
          </button>
        )}
      </div>

      {filteredCurricula.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {t('admin.courses.noCurriculaFound')}
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
                  {t('admin.courses.coursesCount')}
                </th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {t('admin.courses.actionsCol')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCurricula.map((curr) => {
                const courseCount = curr.course_count || 0;
                return (
                  <tr
                    key={curr.id}
                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button')) return;
                      setSelectedCurriculumId(curr.id);
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                      {curr.code || 'RW-CURR'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ffffff' }}>
                      <div>{language === 'rw' && curr.title_kinyarwanda ? curr.title_kinyarwanda : curr.title}</div>
                      {curr.title_kinyarwanda && language !== 'rw' && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                          {curr.title_kinyarwanda}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: '260px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {(language === 'rw' && curr.description_kinyarwanda ? curr.description_kinyarwanda : curr.description) || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {curr.is_published ? (
                        <Badge variant="success">{t('admin.courses.publishedBadge')}</Badge>
                      ) : (
                        <Badge variant="warning">{t('admin.courses.draftBadgeUpper')}</Badge>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCurriculumId(curr.id);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{
                          fontSize: '0.78rem',
                          padding: '4px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        title={t('admin.courses.viewCourses')}
                      >
                        <BookOpen size={13} color="var(--primary-light)" />
                        <span style={{ fontWeight: 700 }}>{courseCount}</span>
                        <span>{courseCount === 1 ? t('admin.courses.tabCourses') : t('admin.courses.coursesCount')}</span>
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCurriculumId(curr.id);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title={t('admin.courses.viewCourses')}
                        >
                          <BookOpen size={13} />
                          <span>{t('admin.courses.viewCourses')}</span>
                        </button>

                        {isSystemAdmin ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePublishCurriculum(curr);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title={curr.is_published ? t('admin.courses.unpublishCurriculum') : t('admin.courses.publishCurriculum')}
                            >
                              {curr.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                              <span>{curr.is_published ? t('admin.courses.unpublish') : t('admin.courses.publish')}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditCurriculum(curr);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-light)' }}
                              title={t('admin.courses.editCurriculum')}
                            >
                              <Pencil size={13} />
                              <span>{t('admin.courses.edit')}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCurriculum(curr.id, curr.title);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '4px 8px', color: 'var(--danger)' }}
                              title={t('admin.courses.deleteCurriculum')}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        ) : null}
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

      <CurriculumModal
        isOpen={isCurriculumModalOpen}
        curriculum={editingCurriculum}
        onClose={() => {
          setIsCurriculumModalOpen(false);
          setEditingCurriculum(null);
        }}
        onSuccess={() => {
          setIsCurriculumModalOpen(false);
          setEditingCurriculum(null);
          triggerRefresh();
        }}
      />
    </>
  );
};
