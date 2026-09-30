import React, { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import {
  AdminService,
  type CertificateTemplateItem,
} from '../../../../core/services/AdminService';
import { CertificateLandscapeDocument } from '../../../../components/common/CertificateLandscapeDocument';
import { useToast } from '../../../../context/ToastContext';
import { useTranslation } from '../../../../context/I18nContext';

interface CertificateTemplatesViewProps {
  isSystemAdmin: boolean;
}

export const CertificateTemplatesView: React.FC<CertificateTemplatesViewProps> = ({
  isSystemAdmin,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const adminService = AdminService.getInstance();

  const [templates, setTemplates] = useState<CertificateTemplateItem[]>([]);
  const [selectedTemplateType, setSelectedTemplateType] = useState<'STUDENT' | 'GUEST' | 'ENTERPRISE'>('STUDENT');
  const [activeTemplateForm, setActiveTemplateForm] = useState<Partial<CertificateTemplateItem>>({});
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await adminService.getCertificateTemplates();
      setTemplates(res);
      const current = res.find((t: CertificateTemplateItem) => t.template_type === selectedTemplateType);
      if (current) {
        setActiveTemplateForm(current);
      }
    } catch (err: any) {
      showToast('Failed to load certificate templates: ' + (err.message || ''), 'error');
    }
  }, [selectedTemplateType]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Sync form when category changes
  useEffect(() => {
    if (templates.length > 0) {
      const current = templates.find((t) => t.template_type === selectedTemplateType);
      if (current) {
        setActiveTemplateForm(current);
      }
    }
  }, [selectedTemplateType, templates]);

  const handleSaveTemplate = async () => {
    if (!activeTemplateForm.id) return;
    try {
      setIsSavingTemplate(true);
      const updated = await adminService.updateCertificateTemplate(
        activeTemplateForm.id,
        activeTemplateForm
      );
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setActiveTemplateForm(updated);
      showToast(`${selectedTemplateType} certificate template saved successfully!`, 'success');
    } catch (err: any) {
      showToast('Failed to save template: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 440px) 1fr', gap: '24px', alignItems: 'start' }}>
      {/* Left Column: Template Editor Form */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '22px 24px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {!isSystemAdmin && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>Notice: </strong>
            {t('admin.examinations.templateRestrictedNotice')}
          </div>
        )}

        {/* Switch Template Type */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Template Category
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
            {(['STUDENT', 'GUEST', 'ENTERPRISE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedTemplateType(type)}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '8px',
                  fontSize: '0.8rem',
                  background: selectedTemplateType === type ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                  color: selectedTemplateType === type ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderColor: selectedTemplateType === type ? 'var(--text-muted)' : 'var(--border-subtle)',
                }}
              >
                {type === 'STUDENT' ? 'Student' : type === 'GUEST' ? 'Guest' : 'Enterprise'}
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields: Editable Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Authority Header
            </label>
            <input
              type="text"
              value={activeTemplateForm.header_subtitle || ''}
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, header_subtitle: e.target.value })}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                marginTop: '4px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Certificate Title
            </label>
            <input
              type="text"
              value={activeTemplateForm.title || ''}
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, title: e.target.value })}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                marginTop: '4px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Conferral Lead-in Text
            </label>
            <input
              type="text"
              value={activeTemplateForm.conferral_text || ''}
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, conferral_text: e.target.value })}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                marginTop: '4px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Course Title
            </label>
            <input
              type="text"
              value={activeTemplateForm.course_name || ''}
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, course_name: e.target.value })}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                marginTop: '4px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Declaration Statement
            </label>
            <textarea
              rows={3}
              value={activeTemplateForm.declaration_text || ''}
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, declaration_text: e.target.value })}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                marginTop: '4px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Regulatory Notes
            </label>
            <textarea
              rows={2}
              value={activeTemplateForm.confirmation_notes || ''}
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, confirmation_notes: e.target.value })}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                marginTop: '4px',
              }}
            />
          </div>

          {/* Dual Signatures Setup */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
            <div
              style={{
                padding: '12px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Training Admin Signer
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={activeTemplateForm.training_admin_name || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, training_admin_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  marginBottom: '6px',
                }}
              />
              <input
                type="text"
                placeholder="Title"
                value={activeTemplateForm.training_admin_title || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, training_admin_title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  marginBottom: '6px',
                }}
              />
              <input
                type="text"
                placeholder="Signature URL"
                value={activeTemplateForm.training_admin_signature || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, training_admin_signature: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                }}
              />
            </div>

            <div
              style={{
                padding: '12px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Director Signer
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={activeTemplateForm.director_name || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, director_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  marginBottom: '6px',
                }}
              />
              <input
                type="text"
                placeholder="Title"
                value={activeTemplateForm.director_title || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, director_title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  marginBottom: '6px',
                }}
              />
              <input
                type="text"
                placeholder="Signature URL"
                value={activeTemplateForm.director_signature || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, director_signature: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                }}
              />
            </div>
          </div>

          {isSystemAdmin ? (
            <button
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate}
              className="btn btn-primary btn-sm"
              style={{
                marginTop: '6px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Save size={14} /> {isSavingTemplate ? 'Saving...' : 'Save Template'}
            </button>
          ) : (
            <div
              style={{
                marginTop: '6px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}
            >
              Read-only &bull; System Admin only
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Live Landscape Preview */}
      <div style={{ overflowX: 'auto', minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            padding: '0 4px',
          }}
        >
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Certificate Preview ({selectedTemplateType})
          </div>
        </div>

        <CertificateLandscapeDocument
          headerSubtitle={activeTemplateForm.header_subtitle}
          title={activeTemplateForm.title}
          conferralText={activeTemplateForm.conferral_text}
          courseName={activeTemplateForm.course_name}
          declarationText={activeTemplateForm.declaration_text}
          confirmationNotes={activeTemplateForm.confirmation_notes}
          trainingAdminName={activeTemplateForm.training_admin_name}
          trainingAdminTitle={activeTemplateForm.training_admin_title}
          trainingAdminSignature={activeTemplateForm.training_admin_signature}
          directorName={activeTemplateForm.director_name}
          directorTitle={activeTemplateForm.director_title}
          directorSignature={activeTemplateForm.director_signature}
          certificateNumber="SIFO-CERT-2026-RW-DEMO"
          studentName="Kagame Alexis"
          studentCode="+250 788 123 456"
          trackType={selectedTemplateType}
          enterpriseName={selectedTemplateType === 'ENTERPRISE' ? 'Kigali Premier Driving Academy' : undefined}
          cohortName="Cohort 1 — Kigali Class"
          startDate={selectedTemplateType === 'GUEST' ? null : '2026-07-15'}
          completedDate="2026-09-13"
          score={18}
          totalQuestions={20}
          isPreview={true}
        />
      </div>
    </div>
  );
};

