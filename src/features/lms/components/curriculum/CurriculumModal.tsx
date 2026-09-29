import React, { useState, useEffect } from 'react';
import { Layers, Pencil, X } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import type { CurriculumItem } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';

interface CurriculumModalProps {
  isOpen: boolean;
  curriculum?: CurriculumItem | null; // If provided, edit mode. Else create mode.
  onClose: () => void;
  onSuccess: () => void;
}

export const CurriculumModal: React.FC<CurriculumModalProps> = ({
  isOpen,
  curriculum,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { success, warning, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const isEdit = Boolean(curriculum);
  const [currCode, setCurrCode] = useState<string>('');
  const [currTitle, setCurrTitle] = useState<string>('');
  const [currTitleRw, setCurrTitleRw] = useState<string>('');
  const [currDescription, setCurrDescription] = useState<string>('');
  const [currDescriptionRw, setCurrDescriptionRw] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (curriculum) {
      setCurrCode(curriculum.code || '');
      setCurrTitle(curriculum.title || '');
      setCurrTitleRw(curriculum.title_kinyarwanda || '');
      setCurrDescription(curriculum.description || '');
      setCurrDescriptionRw(curriculum.description_kinyarwanda || '');
    } else {
      setCurrCode('');
      setCurrTitle('');
      setCurrTitleRw('');
      setCurrDescription('');
      setCurrDescriptionRw('');
    }
  }, [curriculum, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currTitle.trim()) {
      warning('Curriculum Title is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        code: currCode.trim().toUpperCase() || undefined,
        title: currTitle.trim(),
        title_kinyarwanda: currTitleRw.trim() || undefined,
        description: currDescription.trim() || undefined,
        description_kinyarwanda: currDescriptionRw.trim() || undefined,
      };

      if (isEdit && curriculum) {
        await adminService.updateCurriculum(curriculum.id, payload);
        success(`Curriculum "${currTitle}" updated.`);
      } else {
        await adminService.createCurriculum(payload);
        success(`Curriculum "${currTitle}" created.`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || (isEdit ? 'Failed to update curriculum.' : 'Failed to create curriculum.'));
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
            {isEdit ? <Pencil size={22} color="var(--primary)" /> : <Layers size={22} color="var(--primary)" />}
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
              {isEdit ? t('admin.courses.editCurriculum') : t('admin.courses.createCurriculum')}
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
              {t('admin.courses.curriculumCodeLabel')}
            </label>
            <input
              type="text"
              placeholder="RW-CURR-CAT-B"
              value={currCode}
              onChange={(e) => setCurrCode(e.target.value)}
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
              {t('admin.courses.curriculumTitleLabel')}
            </label>
            <input
              type="text"
              required
              placeholder="Category B National Curriculum"
              value={currTitle}
              onChange={(e) => setCurrTitle(e.target.value)}
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
              {t('admin.courses.curriculumTitleRwLabel')}
            </label>
            <input
              type="text"
              placeholder="Integanyanyigisho y'Icyiciro B"
              value={currTitleRw}
              onChange={(e) => setCurrTitleRw(e.target.value)}
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
              {t('admin.courses.curriculumDescLabel')}
            </label>
            <textarea
              rows={2}
              placeholder="Curriculum overview and competencies..."
              value={currDescription}
              onChange={(e) => setCurrDescription(e.target.value)}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {t('admin.courses.curriculumDescRwLabel')}
            </label>
            <textarea
              rows={2}
              placeholder="Ibisobanuro by'integanyanyigisho..."
              value={currDescriptionRw}
              onChange={(e) => setCurrDescriptionRw(e.target.value)}
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
              {t('admin.dashboard.cancel')}
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? '...' : isEdit ? t('admin.courses.saveChanges') : t('admin.courses.createCurriculum')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
