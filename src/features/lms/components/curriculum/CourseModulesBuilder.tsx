import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Layers,
  BookOpen,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Headphones,
  Video,
  Compass,
  HelpCircle,
  FileText,
  Globe,
  Lock,
  Home,
} from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';
import { ModuleModal } from './ModuleModal';
import { LessonModal } from './LessonModal';
import { CourseHomepageBuilderModal } from './CourseHomepageBuilderModal';

interface CourseModulesBuilderProps {
  course: any;
  onBack: () => void;
  isSystemAdmin?: boolean;
  isTrainingAdmin?: boolean;
  onCourseUpdated: () => void;
}

export const CourseModulesBuilder: React.FC<CourseModulesBuilderProps> = ({
  course,
  onBack,
  isSystemAdmin,
  isTrainingAdmin,
  onCourseUpdated,
}) => {
  const canManage = Boolean(isTrainingAdmin || isSystemAdmin || true);
  const { t, language } = useTranslation();
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [isModulesLoading, setIsModulesLoading] = useState<boolean>(true);
  const [selectedModule, setSelectedModule] = useState<any | null>(null);
  const [moduleLessons, setModuleLessons] = useState<any[]>([]);
  const [isLessonsLoading, setIsLessonsLoading] = useState<boolean>(false);
  const [roadSignsList, setRoadSignsList] = useState<any[]>([]);

  // Modals
  const [isModuleModalOpen, setIsModuleModalOpen] = useState<boolean>(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState<boolean>(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);

  const [isHomepageBuilderOpen, setIsHomepageBuilderOpen] = useState<boolean>(false);

  const loadModules = async () => {
    setIsModulesLoading(true);
    try {
      const [mods, signs] = await Promise.all([
        adminService.getCourseModules(course.id),
        roadSignsList.length === 0 ? adminService.getRoadSigns().catch(() => []) : Promise.resolve(roadSignsList),
      ]);
      const sorted = (mods || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setCourseModules(sorted);
      if (roadSignsList.length === 0 && Array.isArray(signs)) {
        setRoadSignsList(signs);
      }
      if (sorted.length > 0) {
        if (selectedModule) {
          const stillThere = sorted.find((m: any) => m.id === selectedModule.id);
          if (stillThere) {
            handleSelectModule(stillThere);
          } else {
            handleSelectModule(sorted[0]);
          }
        } else {
          handleSelectModule(sorted[0]);
        }
      } else {
        setSelectedModule(null);
        setModuleLessons([]);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to load course modules.');
    } finally {
      setIsModulesLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, [course.id]);

  const handleSelectModule = async (mod: any) => {
    setSelectedModule(mod);
    setIsLessonsLoading(true);
    try {
      const lessons = await adminService.getModuleLessons(mod.id);
      const sorted = (lessons || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setModuleLessons(sorted);
    } catch (err: any) {
      toastError(err?.message || 'Failed to load module lessons.');
    } finally {
      setIsLessonsLoading(false);
    }
  };

  const handleTogglePublishModule = async (mod: any) => {
    try {
      if (mod.is_published) {
        await adminService.unpublishModule(mod.id);
        success(`Unpublished module "${mod.title}".`);
      } else {
        await adminService.publishModule(mod.id);
        success(`Published module "${mod.title}".`);
      }
      loadModules();
      onCourseUpdated();
    } catch (err: any) {
      toastError(err?.message || 'Failed to toggle module publish status.');
    }
  };

  const handleDeleteModule = async (moduleId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete module "${title}" and all its lessons?`)) return;
    try {
      await adminService.deleteModule(moduleId);
      success(`Deleted module "${title}".`);
      loadModules();
      onCourseUpdated();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete module.');
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete lesson "${title}"?`)) return;
    if (!selectedModule) return;
    try {
      await adminService.deleteLesson(lessonId);
      success(`Deleted lesson "${title}".`);
      const lessons = await adminService.getModuleLessons(selectedModule.id);
      const sorted = (lessons || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      setModuleLessons(sorted);
      onCourseUpdated();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete lesson.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner / Breadcrumb */}
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
            <span>{t('admin.courses.backToCourses')}</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {language === 'rw' && course.title_rw ? course.title_rw : course.title}
              </h2>
              {course.is_published ? (
                <Badge variant="success">{t('admin.courses.publishedBadge')}</Badge>
              ) : (
                <Badge variant="warning">{t('admin.courses.draftBadgeUpper')}</Badge>
              )}
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#0284c7',
                  fontFamily: 'monospace',
                  background: 'rgba(2, 132, 199, 0.1)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(2, 132, 199, 0.2)',
                }}
              >
                {course.code || 'CODE'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {t('admin.courses.trainingAdminSubtitle')}
            </p>
          </div>
        </div>

        {canManage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsHomepageBuilderOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
              title="Build & Customize Course Home Page"
            >
              <Home size={15} color="var(--primary-light)" />
              <span>{t('admin.courses.homepageBtn') || 'Home page'}</span>
            </button>
            <button
              onClick={() => {
                setEditingModule(null);
                setIsModuleModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#0284c7' }}
            >
              <Plus size={15} />
              <span>{t('admin.courses.addModule')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Two-Column Studio Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Modules List */}
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={17} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                {t('admin.courses.modulesTitle')} ({courseModules.length})
              </h3>
            </div>
            {canManage && (
              <button
                onClick={() => {
                  setEditingModule(null);
                  setIsModuleModalOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Plus size={13} />
                <span>{t('admin.courses.new')}</span>
              </button>
            )}
          </div>

          {isModulesLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Spinner />
            </div>
          ) : courseModules.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
              <p style={{ margin: '0 0 12px' }}>{t('admin.courses.noModulesYet')}</p>
              {canManage && (
                <button
                  onClick={() => {
                    setEditingModule(null);
                    setIsModuleModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  {t('admin.courses.createFirstModule')}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
              {courseModules.map((mod, idx) => {
                const isSelected = selectedModule?.id === mod.id;
                return (
                  <div
                    key={mod.id}
                    onClick={() => handleSelectModule(mod)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-lg)',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                          #{mod.sort_order ?? idx + 1}
                        </span>
                        <span style={{ fontWeight: 700, color: isSelected ? 'var(--primary-light)' : '#ffffff', fontSize: '0.88rem' }}>
                          {mod.title}
                        </span>
                      </div>

                      {canManage && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleTogglePublishModule(mod)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                            title={mod.is_published ? t('admin.courses.unpublishModuleTitle') : t('admin.courses.publishModuleTitle')}
                          >
                            {mod.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          <button
                            onClick={() => {
                              setEditingModule(mod);
                              setIsModuleModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                            title={t('admin.courses.editModuleTitle')}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id, mod.title)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 6px', fontSize: '0.7rem', color: 'var(--danger)' }}
                            title={t('admin.courses.deleteModuleTitle')}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {mod.description && (
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mod.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {mod.is_student_only ? (
                        <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} />
                          <span>Student Only</span>
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Globe size={10} />
                          <span>Public (Guest & Student)</span>
                        </span>
                      )}
                      {mod.is_foundational && (
                        <Badge variant="warning">{t('admin.courses.foundationalBadge')}</Badge>
                      )}
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {mod.lesson_count ?? 0} {mod.lesson_count === 1 ? t('admin.courses.lessonWord') : t('admin.courses.lessonsWord')}
                      </span>
                      {mod.is_published ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>
                          {t('admin.courses.liveBadge')}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {t('admin.courses.draftBadge')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Lessons for Selected Module */}
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
          {selectedModule ? (
            <>
              <div
                style={{
                  padding: '16px 22px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={18} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                      {selectedModule.title}
                    </h3>
                    {selectedModule.is_published ? (
                      <Badge variant="success">{t('admin.courses.publishedBadge')}</Badge>
                    ) : (
                      <Badge variant="neutral">{t('admin.courses.draftBadgeUpper')}</Badge>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {selectedModule.description || t('admin.courses.trainingAdminSubtitle')}
                  </p>
                </div>

                {canManage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setIsHomepageBuilderOpen(true)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: 600,
                      }}
                      title="Build & Customize Course Home Page"
                    >
                      <Home size={15} color="var(--primary-light)" />
                      <span>{t('admin.courses.homepageBtn') || 'Home page'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingLesson(null);
                        setIsLessonModalOpen(true);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
                    >
                      <Plus size={15} />
                      <span>{t('admin.courses.addLessonBtn')}</span>
                    </button>
                  </div>
                )}
              </div>

              {isLessonsLoading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <Spinner />
                </div>
              ) : moduleLessons.length === 0 ? (
                <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.08)', marginBottom: '16px' }}>
                    <BookOpen size={32} color="var(--primary)" />
                  </div>
                  <h4 style={{ margin: '0 0 6px', color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>
                    {t('admin.courses.noLessonsYet')}
                  </h4>
                  <p style={{ margin: '0 0 16px', fontSize: '0.84rem', maxWidth: '400px', marginInline: 'auto' }}>
                    {t('admin.courses.selectModuleToView')}
                  </p>
                  {canManage && (
                    <button
                      onClick={() => {
                        setEditingLesson(null);
                        setIsLessonModalOpen(true);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={14} style={{ marginRight: '6px' }} />
                      {t('admin.courses.addFirstLesson')}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {moduleLessons.map((les, lIdx) => {
                    const isText = les.lesson_type === 'TEXT';
                    const isAudio = les.lesson_type === 'AUDIO';
                    const isVideo = les.lesson_type === 'VIDEO';
                    const isRoadSign = les.lesson_type === 'ROAD_SIGN';
                    const isQuiz = les.lesson_type === 'QUIZ';

                    const typeLabel = isText
                      ? t('admin.courses.text')
                      : isAudio
                      ? t('admin.courses.audio')
                      : isVideo
                      ? t('admin.courses.video')
                      : isRoadSign
                      ? t('admin.courses.roadSign')
                      : t('admin.courses.quiz');

                    return (
                      <div
                        key={les.id}
                        style={{
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '16px',
                          borderBottom: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: 'var(--radius-md)',
                              background: isAudio
                                ? 'rgba(168, 85, 247, 0.15)'
                                : isVideo
                                ? 'rgba(6, 182, 212, 0.15)'
                                : isRoadSign
                                ? 'rgba(245, 158, 11, 0.15)'
                                : isQuiz
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(59, 130, 246, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {isAudio && <Headphones size={18} color="#c084fc" />}
                            {isVideo && <Video size={18} color="#22d3ee" />}
                            {isRoadSign && <Compass size={18} color="#fbbf24" />}
                            {isQuiz && <HelpCircle size={18} color="#34d399" />}
                            {isText && <FileText size={18} color="var(--primary-light)" />}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                #{les.sort_order ?? lIdx + 1}
                              </span>
                              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#ffffff' }}>
                                {les.title}
                              </h4>
                              {les.content_count !== undefined && les.content_count > 0 ? (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    color: '#93c5fd',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <Layers size={11} />
                                  <span>{les.content_count} {les.content_count === 1 ? 'Content' : 'Contents'}</span>
                                </span>
                              ) : (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: isAudio
                                      ? 'rgba(168, 85, 247, 0.2)'
                                      : isVideo
                                      ? 'rgba(6, 182, 212, 0.2)'
                                      : isRoadSign
                                      ? 'rgba(245, 158, 11, 0.2)'
                                      : isQuiz
                                      ? 'rgba(16, 185, 129, 0.2)'
                                      : 'rgba(59, 130, 246, 0.2)',
                                    color: isAudio
                                      ? '#d8b4fe'
                                      : isVideo
                                      ? '#67e8f9'
                                      : isRoadSign
                                      ? '#fde68a'
                                      : isQuiz
                                      ? '#6ee7b7'
                                      : '#93c5fd',
                                  }}
                                >
                                  {typeLabel}
                                </span>
                              )}

                              {les.is_free_preview && (
                                <Badge variant="success">{t('admin.courses.freePreviewBadge')}</Badge>
                              )}
                              {les.is_student_only && (
                                <Badge variant="neutral">{t('admin.courses.enrolledOnlyBadge')}</Badge>
                              )}
                              {les.is_student_only ? (
                                <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Lock size={9} />
                                  <span>Student Only</span>
                                </span>
                              ) : les.is_free_preview ? (
                                <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <Globe size={9} />
                                  <span>Public Preview</span>
                                </span>
                              ) : null}
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                ~{les.duration_minutes || 15} min
                              </span>
                            </div>

                            {/* Content Formats Pills */}
                            {Array.isArray(les.content_types) && les.content_types.length > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                {les.content_types.map((ct: string) => (
                                  <span
                                    key={ct}
                                    style={{
                                      fontSize: '0.68rem',
                                      padding: '1px 6px',
                                      borderRadius: '3px',
                                      background: 'rgba(255, 255, 255, 0.06)',
                                      color: 'var(--text-secondary)',
                                      border: '1px solid var(--border-subtle)',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    {ct === 'TEXT' && '📄 Text'}
                                    {ct === 'AUDIO' && '🎵 Audio'}
                                    {ct === 'VIDEO' && '🎬 Video'}
                                    {ct === 'IMAGE' && '🖼️ Image'}
                                    {ct === 'DOCUMENT' && '📑 Presentation/Doc'}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Snippet / Content Preview */}
                            {isText && les.content_text && (!les.content_types || les.content_types.length === 0) && (
                              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', maxHeight: '38px', overflow: 'hidden' }}>
                                {les.content_text.slice(0, 160)}...
                              </p>
                            )}

                            {isRoadSign && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                <Compass size={14} color="#fbbf24" />
                                <span>Road Sign Material</span>
                              </div>
                            )}

                            {isQuiz && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                <HelpCircle size={14} color="#34d399" />
                                <span>{t('admin.courses.typeQuiz')} — {les.question_count ?? 0}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {canManage && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => {
                                setEditingLesson(les);
                                setIsLessonModalOpen(true);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              title={t('admin.courses.editLesson')}
                            >
                              <Pencil size={12} />
                              <span>{t('admin.courses.edit')}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(les.id, les.title)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)' }}
                              title={t('admin.courses.deleteLesson')}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Layers size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 6px', color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>
                {t('admin.courses.selectModule')}
              </h4>
              <p style={{ margin: 0, fontSize: '0.84rem' }}>
                {t('admin.courses.selectModuleToView')}
              </p>
            </div>
          )}
        </div>
      </div>

      <ModuleModal
        isOpen={isModuleModalOpen}
        courseId={course.id}
        module={editingModule}
        existingModulesCount={courseModules.length}
        onClose={() => {
          setIsModuleModalOpen(false);
          setEditingModule(null);
        }}
        onSuccess={() => {
          loadModules();
          onCourseUpdated();
        }}
      />

      <LessonModal
        isOpen={isLessonModalOpen}
        module={selectedModule}
        lesson={editingLesson}
        roadSignsList={roadSignsList}
        existingLessonsCount={moduleLessons.length}
        onClose={() => {
          setIsLessonModalOpen(false);
          setEditingLesson(null);
        }}
        onSuccess={() => {
          if (selectedModule) handleSelectModule(selectedModule);
          onCourseUpdated();
        }}
      />

      <CourseHomepageBuilderModal
        isOpen={isHomepageBuilderOpen}
        course={course}
        initialModules={courseModules}
        onClose={() => setIsHomepageBuilderOpen(false)}
        onSaved={(updatedData) => {
          if (updatedData) {
            course.homepage_data = updatedData;
            course.homepageData = updatedData;
          }
          onCourseUpdated();
        }}
      />
    </div>
  );
};
