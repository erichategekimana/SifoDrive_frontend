import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { AdminService } from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';

interface ModuleModalProps {
  isOpen: boolean;
  courseId: string;
  module?: any | null; // If provided, edit mode
  existingModulesCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModuleModal: React.FC<ModuleModalProps> = ({
  isOpen,
  courseId,
  module,
  existingModulesCount,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { success, warning, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const isEdit = Boolean(module);
  const [modTitle, setModTitle] = useState<string>('');
  const [modDescription, setModDescription] = useState<string>('');
  const [modSortOrder, setModSortOrder] = useState<number>(1);
  const [modIsFoundational, setModIsFoundational] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (module) {
      setModTitle(module.title || '');
      setModDescription(module.description || '');
      setModSortOrder(module.sort_order ?? 1);
      setModIsFoundational(!!module.is_foundational);
    } else {
      setModTitle('');
      setModDescription('');
      setModSortOrder(existingModulesCount + 1);
      setModIsFoundational(false);
    }
  }, [module, existingModulesCount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTitle.trim()) {
      warning('Module title is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit && module) {
        await adminService.updateModule(module.id, {
          title: modTitle.trim(),
          description: modDescription.trim() || undefined,
          sort_order: Number(modSortOrder) || 1,
          is_foundational: modIsFoundational,
        });
        success('Updated module successfully.');
      } else {
        await adminService.createModule({
          course: courseId,
          title: modTitle.trim(),
          description: modDescription.trim() || undefined,
          sort_order: Number(modSortOrder) || existingModulesCount + 1,
          is_foundational: modIsFoundational,
        });
        success('Created new module.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to save module.');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Layers size={22} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>
            {isEdit
              ? t('admin.courses.modalEditModule')
              : t('admin.courses.modalCreateModule')}
          </h3>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {t('admin.courses.moduleTitleLabel')}
            </label>
            <input
              type="text"
              required
              placeholder={t('admin.courses.moduleTitlePlaceholder')}
              value={modTitle}
              onChange={(e) => setModTitle(e.target.value)}
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
              {t('admin.courses.moduleDescLabel')}
            </label>
            <textarea
              rows={3}
              placeholder={t('admin.courses.moduleDescPlaceholder')}
              value={modDescription}
              onChange={(e) => setModDescription(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {t('admin.courses.moduleSortOrderLabel')}
              </label>
              <input
                type="number"
                min={1}
                value={modSortOrder}
                onChange={(e) => setModSortOrder(parseInt(e.target.value) || 1)}
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

            <div style={{ marginTop: '22px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', color: '#ffffff' }}>
                <input
                  type="checkbox"
                  checked={modIsFoundational}
                  onChange={(e) => setModIsFoundational(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>{t('admin.courses.moduleFoundationalLabel')}</span>
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
                : t('admin.courses.createModuleBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
