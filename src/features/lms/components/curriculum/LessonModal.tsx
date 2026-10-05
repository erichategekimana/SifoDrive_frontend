import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  Headphones,
  Video,
  Image as ImageIcon,
  FileCheck,
  Presentation,
  Palette,
  Globe,
  Lock,
  Users,
  X,
  Edit2,
} from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';
import type { LessonContentType, DocumentFormatType } from '../../../../core/models/Lesson';

interface LessonModalProps {
  isOpen: boolean;
  module: any;
  lesson?: any | null;
  roadSignsList: any[];
  existingLessonsCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export type ContentSelectionType =
  | 'TEXT'
  | 'AUDIO'
  | 'VIDEO'
  | 'IMAGE'
  | 'PDF'
  | 'POWERPOINT'
  | 'CANVA'
  | 'PRESENTATION';

export interface DraftContentItem {
  id: string; // generated client-side key or backend uuid
  backendId?: string;
  title: string;
  contentType: LessonContentType;
  documentType: DocumentFormatType;
  contentText: string;
  mediaUrl: string;
  mediaFile: File | null;
  mediaFileName?: string;
  durationMinutes: number;
  sortOrder: number;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  module,
  lesson,
  existingLessonsCount,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { success, warning, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const isEdit = Boolean(lesson);
  const [lesTitle, setLesTitle] = useState<string>('');
  const [lesDurationMinutes, setLesDurationMinutes] = useState<number>(15);
  const [lesIsFreePreview, setLesIsFreePreview] = useState<boolean>(false);
  const [lesIsStudentOnly, setLesIsStudentOnly] = useState<boolean>(false);
  const [lesIsOutsideResource, setLesIsOutsideResource] = useState<boolean>(false);
  const [lesSortOrder, setLesSortOrder] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Multi-Content Items State
  const [contents, setContents] = useState<DraftContentItem[]>([]);
  const [deletedContentIds, setDeletedContentIds] = useState<string[]>([]);

  // Content Creator / Editor Drawer state
  const [isAddingContent, setIsAddingContent] = useState<boolean>(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);

  // Form fields for single content item being edited/added
  const [selectedFormat, setSelectedFormat] = useState<ContentSelectionType>('TEXT');
  const [contentTitle, setContentTitle] = useState<string>('');
  const [contentText, setContentText] = useState<string>('');
  const [contentMediaUrl, setContentMediaUrl] = useState<string>('');
  const [contentMediaFile, setContentMediaFile] = useState<File | null>(null);
  const [contentDuration, setContentDuration] = useState<number>(5);

  useEffect(() => {
    if (!isOpen) return;

    if (lesson) {
      setLesTitle(lesson.title || '');
      setLesDurationMinutes(lesson.duration_minutes || 15);
      setLesIsFreePreview(!!lesson.is_free_preview);
      setLesIsStudentOnly(!!lesson.is_student_only);
      setLesIsOutsideResource(!!(lesson.is_outside_resource ?? lesson.isOutsideResource));
      setLesSortOrder(lesson.sort_order ?? 1);
      setDeletedContentIds([]);
      setIsAddingContent(false);
      setEditingContentId(null);

      // Load existing contents
      const loadContents = async () => {
        try {
          const remoteContents = await adminService.getLessonContents(lesson.id);
          if (Array.isArray(remoteContents) && remoteContents.length > 0) {
            const mapped: DraftContentItem[] = remoteContents.map((c: any, idx: number) => ({
              id: c.id,
              backendId: c.id,
              title: c.title || '',
              contentType: c.content_type || 'TEXT',
              documentType: c.document_type || 'OTHER',
              contentText: c.content_text || '',
              mediaUrl: c.media_url || '',
              mediaFile: null,
              mediaFileName: c.media_file ? c.media_file.split('/').pop() : undefined,
              durationMinutes: c.duration_minutes || 0,
              sortOrder: c.sort_order ?? idx + 1,
            }));
            setContents(mapped);
          } else {
            // Fallback: convert legacy single-field content if exists
            const initial: DraftContentItem[] = [];
            if (lesson.content_text) {
              initial.push({
                id: `init-text-${Date.now()}`,
                title: 'Overview Notes',
                contentType: 'TEXT',
                documentType: 'OTHER',
                contentText: lesson.content_text,
                mediaUrl: '',
                mediaFile: null,
                durationMinutes: 5,
                sortOrder: 1,
              });
            }
            if (lesson.media_url || lesson.media_file) {
              const cType: LessonContentType = lesson.lesson_type === 'AUDIO' ? 'AUDIO' : 'VIDEO';
              initial.push({
                id: `init-media-${Date.now()}`,
                title: `${lesson.lesson_type || 'Media'} Lecture`,
                contentType: cType,
                documentType: 'OTHER',
                contentText: '',
                mediaUrl: lesson.media_url || '',
                mediaFile: null,
                mediaFileName: lesson.media_file ? String(lesson.media_file).split('/').pop() : undefined,
                durationMinutes: 10,
                sortOrder: initial.length + 1,
              });
            }
            setContents(initial);
          }
        } catch {
          setContents([]);
        }
      };
      loadContents();
    } else {
      setLesTitle('');
      setLesDurationMinutes(15);
      setLesIsFreePreview(false);
      setLesIsStudentOnly(false);
      setLesIsOutsideResource(false);
      setLesSortOrder(existingLessonsCount + 1);
      setContents([]);
      setDeletedContentIds([]);
      setIsAddingContent(false);
      setEditingContentId(null);
    }
  }, [lesson, existingLessonsCount, isOpen]);

  if (!isOpen || !module) return null;

  // Open the content creator
  const handleOpenAddContent = () => {
    setSelectedFormat('TEXT');
    setContentTitle('');
    setContentText('');
    setContentMediaUrl('');
    setContentMediaFile(null);
    setContentDuration(5);
    setEditingContentId(null);
    setIsAddingContent(true);
  };

  // Open the content editor
  const handleOpenEditContent = (item: DraftContentItem) => {
    setEditingContentId(item.id);

    // Determine UI format type
    if (item.contentType === 'TEXT') setSelectedFormat('TEXT');
    else if (item.contentType === 'AUDIO') setSelectedFormat('AUDIO');
    else if (item.contentType === 'VIDEO') setSelectedFormat('VIDEO');
    else if (item.contentType === 'IMAGE') setSelectedFormat('IMAGE');
    else if (item.contentType === 'DOCUMENT') {
      if (item.documentType === 'PDF') setSelectedFormat('PDF');
      else if (item.documentType === 'POWERPOINT') setSelectedFormat('POWERPOINT');
      else if (item.documentType === 'CANVA') setSelectedFormat('CANVA');
      else setSelectedFormat('PRESENTATION');
    }

    setContentTitle(item.title);
    setContentText(item.contentText);
    setContentMediaUrl(item.mediaUrl);
    setContentMediaFile(item.mediaFile);
    setContentDuration(item.durationMinutes);
    setIsAddingContent(true);
  };

  // Save the currently edited/created content item
  const handleSaveContentItem = () => {
    // Validate
    if (selectedFormat === 'TEXT' && !contentText.trim()) {
      warning('Please enter text content for this block.');
      return;
    }
    if (
      (selectedFormat === 'AUDIO' || selectedFormat === 'VIDEO') &&
      !contentMediaFile &&
      !contentMediaUrl.trim()
    ) {
      warning(`Please provide an upload file or streaming URL for ${selectedFormat}.`);
      return;
    }
    if (selectedFormat === 'IMAGE' && !contentMediaFile && !contentMediaUrl.trim()) {
      warning('Please upload an image file or provide an image URL.');
      return;
    }
    if (selectedFormat === 'CANVA' && !contentMediaUrl.trim()) {
      warning('Please provide the Canva design or embed URL.');
      return;
    }

    // Map format to backend models
    let contentType: LessonContentType = 'TEXT';
    let documentType: DocumentFormatType = 'OTHER';

    if (selectedFormat === 'TEXT') {
      contentType = 'TEXT';
    } else if (selectedFormat === 'AUDIO') {
      contentType = 'AUDIO';
    } else if (selectedFormat === 'VIDEO') {
      contentType = 'VIDEO';
    } else if (selectedFormat === 'IMAGE') {
      contentType = 'IMAGE';
    } else if (selectedFormat === 'PDF') {
      contentType = 'DOCUMENT';
      documentType = 'PDF';
    } else if (selectedFormat === 'POWERPOINT') {
      contentType = 'DOCUMENT';
      documentType = 'POWERPOINT';
    } else if (selectedFormat === 'CANVA') {
      contentType = 'DOCUMENT';
      documentType = 'CANVA';
    } else if (selectedFormat === 'PRESENTATION') {
      contentType = 'DOCUMENT';
      documentType = 'PRESENTATION';
    }

    const itemTitle =
      contentTitle.trim() ||
      (selectedFormat === 'TEXT'
        ? 'Reading Notes'
        : selectedFormat === 'AUDIO'
        ? 'Audio Lecture'
        : selectedFormat === 'VIDEO'
        ? 'Video Explanation'
        : selectedFormat === 'IMAGE'
        ? 'Diagram Graphic'
        : selectedFormat === 'PDF'
        ? 'PDF Document'
        : selectedFormat === 'POWERPOINT'
        ? 'MS PowerPoint Presentation'
        : selectedFormat === 'CANVA'
        ? 'Canva Slides'
        : 'Presentation Slides');

    if (editingContentId) {
      // Update existing item
      setContents((prev) =>
        prev.map((c) =>
          c.id === editingContentId
            ? {
                ...c,
                title: itemTitle,
                contentType,
                documentType,
                contentText: contentText.trim(),
                mediaUrl: contentMediaUrl.trim(),
                mediaFile: contentMediaFile,
                mediaFileName: contentMediaFile ? contentMediaFile.name : c.mediaFileName,
                durationMinutes: contentDuration,
              }
            : c
        )
      );
    } else {
      // Add new item
      const newItem: DraftContentItem = {
        id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: itemTitle,
        contentType,
        documentType,
        contentText: contentText.trim(),
        mediaUrl: contentMediaUrl.trim(),
        mediaFile: contentMediaFile,
        mediaFileName: contentMediaFile ? contentMediaFile.name : undefined,
        durationMinutes: contentDuration,
        sortOrder: contents.length + 1,
      };
      setContents((prev) => [...prev, newItem]);
    }

    setIsAddingContent(false);
    setEditingContentId(null);
  };

  // Remove a content item
  const handleRemoveContentItem = (item: DraftContentItem) => {
    if (item.backendId) {
      setDeletedContentIds((prev) => [...prev, item.backendId!]);
    }
    setContents((prev) => prev.filter((c) => c.id !== item.id));
    if (editingContentId === item.id) {
      setIsAddingContent(false);
      setEditingContentId(null);
    }
  };

  // Reorder items
  const handleMoveContent = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= contents.length) return;

    const updated = [...contents];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Refresh sort orders
    const reordered = updated.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    setContents(reordered);
  };

  // Get format icon and badge label
  const getContentFormatDisplay = (item: DraftContentItem) => {
    if (item.contentType === 'TEXT') {
      return {
        icon: <FileText size={16} color="#3B82F6" />,
        label: 'Text (Input)',
        color: '#3B82F6',
        bg: 'rgba(59, 130, 246, 0.12)',
      };
    }
    if (item.contentType === 'AUDIO') {
      return {
        icon: <Headphones size={16} color="#8B5CF6" />,
        label: 'Audio',
        color: '#8B5CF6',
        bg: 'rgba(139, 92, 246, 0.12)',
      };
    }
    if (item.contentType === 'VIDEO') {
      return {
        icon: <Video size={16} color="#EF4444" />,
        label: 'Video',
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.12)',
      };
    }
    if (item.contentType === 'IMAGE') {
      return {
        icon: <ImageIcon size={16} color="#10B981" />,
        label: 'Image',
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.12)',
      };
    }
    if (item.contentType === 'DOCUMENT') {
      switch (item.documentType) {
        case 'PDF':
          return {
            icon: <FileCheck size={16} color="#F97316" />,
            label: 'PDF File',
            color: '#F97316',
            bg: 'rgba(249, 115, 22, 0.12)',
          };
        case 'POWERPOINT':
          return {
            icon: <Presentation size={16} color="#DC2626" />,
            label: 'MS PowerPoint',
            color: '#DC2626',
            bg: 'rgba(220, 38, 38, 0.12)',
          };
        case 'CANVA':
          return {
            icon: <Palette size={16} color="#06B6D4" />,
            label: 'Canva Design',
            color: '#06B6D4',
            bg: 'rgba(6, 182, 212, 0.12)',
          };
        default:
          return {
            icon: <Presentation size={16} color="#EAB308" />,
            label: 'Presentation / Slides',
            color: '#EAB308',
            bg: 'rgba(234, 179, 8, 0.12)',
          };
      }
    }
    return {
      icon: <FileText size={16} color="#6B7280" />,
      label: 'Content',
      color: '#6B7280',
      bg: 'rgba(107, 114, 128, 0.12)',
    };
  };

  // Submit master lesson and all contents
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesTitle.trim()) {
      warning('Lesson title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Prepare master lesson payload
      const lessonPayload: Record<string, any> = {
        module: module.id,
        title: lesTitle.trim(),
        lesson_type: contents.length > 1 ? 'MULTI' : (contents[0]?.contentType || 'TEXT'),
        sort_order: Number(lesSortOrder) || 1,
        duration_minutes: Number(lesDurationMinutes) || 15,
        is_free_preview: Boolean(lesIsFreePreview),
        is_student_only: Boolean(lesIsStudentOnly),
        is_outside_resource: Boolean(lesIsOutsideResource),
        content_text: contents.find((c) => c.contentType === 'TEXT')?.contentText || '',
        media_url: contents.find((c) => c.mediaUrl)?.mediaUrl || '',
      };

      let savedLessonId = lesson?.id;
      if (isEdit && lesson) {
        await adminService.updateLesson(lesson.id, lessonPayload);
      } else {
        const created = await adminService.createLesson(lessonPayload);
        savedLessonId = created.id || created.data?.id;
      }

      if (!savedLessonId) {
        throw new Error('Failed to obtain saved lesson ID.');
      }

      // 2. Delete removed contents
      for (const delId of deletedContentIds) {
        try {
          await adminService.deleteLessonContent(delId);
        } catch (err) {
          console.warn('Failed to delete content block:', err);
        }
      }

      // 3. Save / Upsert contents
      for (let i = 0; i < contents.length; i++) {
        const item = contents[i];
        const itemSortOrder = i + 1;

        if (item.mediaFile) {
          // File upload via FormData
          const fd = new FormData();
          fd.append('lesson', savedLessonId);
          fd.append('title', item.title);
          fd.append('content_type', item.contentType);
          fd.append('document_type', item.documentType);
          fd.append('sort_order', String(itemSortOrder));
          fd.append('duration_minutes', String(item.durationMinutes));
          if (item.contentText) fd.append('content_text', item.contentText);
          if (item.mediaUrl) fd.append('media_url', item.mediaUrl);
          fd.append('media_file', item.mediaFile);

          if (item.backendId) {
            await adminService.updateLessonContent(item.backendId, fd);
          } else {
            await adminService.createLessonContent(savedLessonId, fd);
          }
        } else {
          // Standard JSON payload
          const cPayload = {
            lesson: savedLessonId,
            title: item.title,
            content_type: item.contentType,
            document_type: item.documentType,
            sort_order: itemSortOrder,
            duration_minutes: item.durationMinutes,
            content_text: item.contentText,
            media_url: item.mediaUrl,
          };

          if (item.backendId) {
            await adminService.updateLessonContent(item.backendId, cPayload);
          } else {
            await adminService.createLessonContent(savedLessonId, cPayload);
          }
        }
      }

      success(
        isEdit
          ? `Updated lesson "${lesTitle}" with ${contents.length} content blocks.`
          : `Created lesson "${lesTitle}" with ${contents.length} content blocks.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to save lesson and contents.');
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
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={22} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {isEdit ? 'Edit Lesson & Learning Contents' : 'New Lesson Builder'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {t('admin.courses.modulePrefix')}: <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{module?.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Lesson Primary Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Lesson Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Roundabout Circulation & Right-of-Way Rules"
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
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Total Duration
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  min={1}
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
                <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  min
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Sort Order
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

          {/* Section 2: Multi-Content Items Workspace */}
          <div
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#ffffff' }}>
                  Lesson Contents ({contents.length})
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  A lesson can contain multiple contents: Text, Audio, Video, Image, PDF, PowerPoint, or Canva.
                </p>
              </div>

              {!isAddingContent && (
                <button
                  type="button"
                  onClick={handleOpenAddContent}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px' }}
                >
                  <Plus size={15} />
                  <span>Add Content Item</span>
                </button>
              )}
            </div>

            {/* Content Items List */}
            {contents.length === 0 && !isAddingContent ? (
              <div
                style={{
                  padding: '32px 20px',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.01)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-subtle)',
                }}
              >
                <FileText size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px auto' }} />
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  No contents added to this lesson yet.
                </p>
                <p style={{ margin: '4px 0 16px 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Add text articles, audio, videos, diagrams, PDF slides, or Canva presentations.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddContent}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>Add First Content</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {contents.map((item, idx) => {
                  const format = getContentFormatDisplay(item);
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      {/* Left: Reorder & Number */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveContent(idx, 'UP')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: idx === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                              cursor: idx === 0 ? 'default' : 'pointer',
                              padding: '2px',
                              lineHeight: 1,
                            }}
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === contents.length - 1}
                            onClick={() => handleMoveContent(idx, 'DOWN')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: idx === contents.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                              cursor: idx === contents.length - 1 ? 'default' : 'pointer',
                              padding: '2px',
                              lineHeight: 1,
                            }}
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            color: 'var(--text-muted)',
                            width: '20px',
                            textAlign: 'center',
                          }}
                        >
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Middle: Badge & Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: format.bg,
                            color: format.color,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {format.icon}
                          <span>{format.label}</span>
                        </span>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h5
                            style={{
                              margin: 0,
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              color: '#ffffff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.title}
                          </h5>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              color: 'var(--text-secondary)',
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.contentType === 'TEXT' && (item.contentText ? `${item.contentText.substring(0, 70)}...` : 'Written body')}
                            {item.mediaFileName && `File: ${item.mediaFileName}`}
                            {item.mediaUrl && !item.mediaFileName && `URL: ${item.mediaUrl}`}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditContent(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px' }}
                          title="Edit Content"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveContentItem(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px', color: '#EF4444' }}
                          title="Remove Content"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inline Content Creator / Editor Form */}
            {isAddingContent && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {editingContentId ? 'Edit Content Item' : 'Add Content Item to Lesson'}
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingContent(false);
                      setEditingContentId(null);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Content Type Selector Buttons */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Select Content Format
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '8px',
                    }}
                  >
                    {[
                      { type: 'TEXT', label: 'Text (Input)', icon: <FileText size={15} /> },
                      { type: 'AUDIO', label: 'Audio', icon: <Headphones size={15} /> },
                      { type: 'VIDEO', label: 'Video', icon: <Video size={15} /> },
                      { type: 'IMAGE', label: 'Image', icon: <ImageIcon size={15} /> },
                      { type: 'PDF', label: 'PDF File', icon: <FileCheck size={15} /> },
                      { type: 'POWERPOINT', label: 'MS PowerPoint', icon: <Presentation size={15} /> },
                      { type: 'CANVA', label: 'Canva Design', icon: <Palette size={15} /> },
                      { type: 'PRESENTATION', label: 'Slides / Presentation', icon: <Presentation size={15} /> },
                    ].map((fmt) => {
                      const isSelected = selectedFormat === fmt.type;
                      return (
                        <button
                          key={fmt.type}
                          type="button"
                          onClick={() => setSelectedFormat(fmt.type as ContentSelectionType)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                            background: isSelected ? 'rgba(59, 130, 246, 0.16)' : 'var(--bg-surface-elevated)',
                            color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                        >
                          {fmt.icon}
                          <span>{fmt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Title */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Content Title / Sub-section Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Roundabout Priority Article, Lesson Slides, or Canva Infographic"
                      value={contentTitle}
                      onChange={(e) => setContentTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Est. Minutes
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={contentDuration}
                      onChange={(e) => setContentDuration(parseInt(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.84rem',
                      }}
                    />
                  </div>
                </div>

                {/* Format-specific Inputs */}
                {selectedFormat === 'TEXT' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Text / Article Content (Markdown & Text Supported)
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Write your text article, regulatory rules, or summary here..."
                      value={contentText}
                      onChange={(e) => setContentText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.84rem',
                        fontFamily: 'sans-serif',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                )}

                {selectedFormat === 'AUDIO' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Audio File Upload (.mp3, .wav, .m4a)
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setContentMediaFile(e.target.files?.[0] || null)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>— OR —</div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Audio Streaming URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://audio-cdn.sifodrive.rw/lectures/audio-01.mp3"
                        value={contentMediaUrl}
                        onChange={(e) => setContentMediaUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedFormat === 'VIDEO' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Video Streaming / YouTube / Vimeo / Loom URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                        value={contentMediaUrl}
                        onChange={(e) => setContentMediaUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>— OR —</div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Direct Video File Upload (.mp4, .webm)
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setContentMediaFile(e.target.files?.[0] || null)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedFormat === 'IMAGE' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Image / Diagram File Upload (.png, .jpg, .webp, .svg)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setContentMediaFile(e.target.files?.[0] || null)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>— OR —</div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Image Direct Web URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://cdn.sifodrive.rw/diagrams/roundabout-rules.png"
                        value={contentMediaUrl}
                        onChange={(e) => setContentMediaUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedFormat === 'PDF' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        PDF Document File (.pdf)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => setContentMediaFile(e.target.files?.[0] || null)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>— OR —</div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        PDF Document Link / Storage URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://sifodrive.rw/documents/rnp-driving-code.pdf"
                        value={contentMediaUrl}
                        onChange={(e) => setContentMediaUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedFormat === 'POWERPOINT' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        MS PowerPoint File (.ppt, .pptx)
                      </label>
                      <input
                        type="file"
                        accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        onChange={(e) => setContentMediaFile(e.target.files?.[0] || null)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>— OR —</div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        PowerPoint Online / OneDrive Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://onedrive.live.com/view.aspx?resid=..."
                        value={contentMediaUrl}
                        onChange={(e) => setContentMediaUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedFormat === 'CANVA' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Canva Presentation or Design URL (Embed or View Link)
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.canva.com/design/DAF.../view?embed or share link"
                        value={contentMediaUrl}
                        onChange={(e) => setContentMediaUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                        Tip: In Canva, click "Share" → "More" → "Embed" or copy the public view link to display the interactive presentation.
                      </span>
                    </div>
                  </div>
                )}

                {selectedFormat === 'PRESENTATION' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Google Slides Embed / Presentation Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://docs.google.com/presentation/d/.../embed or link"
                        value={contentMediaUrl}
                        onChange={(e) => setContentMediaUrl(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>— OR —</div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Upload Slide Presentation File
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setContentMediaFile(e.target.files?.[0] || null)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-form action buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingContent(false);
                      setEditingContentId(null);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveContentItem}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>{editingContentId ? 'Update Content Block' : 'Add to Lesson'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Audience & Access Level Management */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.02)',
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
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
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
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
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
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    Accessible to any logged-in user on the learning platform.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Outside Resource Flag */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: lesIsOutsideResource ? 'rgba(0, 85, 165, 0.12)' : 'rgba(255, 255, 255, 0.03)',
              border: lesIsOutsideResource ? '1px solid rgba(0, 85, 165, 0.4)' : '1px solid var(--border-subtle)',
              marginBottom: '16px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={lesIsOutsideResource}
                onChange={(e) => setLesIsOutsideResource(e.target.checked)}
                style={{ width: '16px', height: '16px', marginTop: '2px', cursor: 'pointer' }}
              />
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: lesIsOutsideResource ? '#38BDF8' : '#ffffff' }}>
                  Outside Resource
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                  Flag this lesson as an outside/external resource. In the course Modules view, its title text will be highlighted in blue.
                </span>
              </div>
            </label>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              {t('admin.courses.cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ minWidth: '130px' }}
            >
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
