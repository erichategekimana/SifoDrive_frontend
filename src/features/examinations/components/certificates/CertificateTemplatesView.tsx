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
      <div className="glass-panel" style={{ padding: '24px' }}>
        {/* System Admin Notice if user is non-System Admin */}
        {!isSystemAdmin && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.4',
            }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>Notice: </strong>
            {t('admin.examinations.templateRestrictedNotice')}
          </div>
        )}

        {/* Switch Template Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Accreditation Template Category
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
            {(['STUDENT', 'GUEST', 'ENTERPRISE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedTemplateType(type)}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: selectedTemplateType === type ? '2px solid #1E90FF' : '1px solid var(--border-subtle)',
                  background: selectedTemplateType === type ? 'rgba(30, 144, 255, 0.2)' : 'rgba(0,0,0,0.2)',
                  color: selectedTemplateType === type ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {type === 'STUDENT' ? 'Student' : type === 'GUEST' ? 'Guest' : 'Enterprise B2B'}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
            {selectedTemplateType === 'STUDENT' &&
              'Enrolled Student Template: Displays Start Date, Completion Date, Cohort Name, and Theory Accreditation.'}
            {selectedTemplateType === 'GUEST' &&
              'Guest Trial Template: Displays Completion Date only (omits start date & cohort) for diagnostic trials.'}
            {selectedTemplateType === 'ENTERPRISE' &&
              'Enterprise Partner Template: Displays Partner Driving School Name prominently, physical proctoring seal, and dual dates.'}
          </div>
        </div>

        {/* Form Fields: Editable Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Authority Header / Subtitle */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Authority Header / Subtitle
            </label>
            <input
              type="text"
              value={activeTemplateForm.header_subtitle || ''}
              placeholder="e.g. Republic of Rwanda • Sifo Drive Theory Accreditation"
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, header_subtitle: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.85rem',
                marginTop: '4px',
              }}
            />
          </div>

          {/* Certificate Title */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Certificate Title
            </label>
            <input
              type="text"
              value={activeTemplateForm.title || ''}
              placeholder="e.g. Certificate of Theory Competence"
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.85rem',
                marginTop: '4px',
              }}
            />
          </div>

          {/* Conferral Lead-in Text */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Conferral Lead-in Text
            </label>
            <input
              type="text"
              value={activeTemplateForm.conferral_text || ''}
              placeholder="e.g. This official credential is proudly awarded to"
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, conferral_text: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.85rem',
                marginTop: '4px',
              }}
            />
          </div>

          {/* Course Name */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Course / Curriculum Title
            </label>
            <input
              type="text"
              value={activeTemplateForm.course_name || ''}
              placeholder="e.g. Rwanda Driving Theory — Provisional License Preparation"
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, course_name: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.85rem',
                marginTop: '4px',
              }}
            />
          </div>

          {/* Declaration Paragraph */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Declaration Statement (Placeholders: {'{student_name}'}, {'{cohort_name}'}, {'{start_date}'}, {'{completion_date}'}, {'{score}'}, {'{total_questions}'})
            </label>
            <textarea
              rows={4}
              value={activeTemplateForm.declaration_text || ''}
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, declaration_text: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.85rem',
                marginTop: '4px',
                lineHeight: '1.5',
              }}
            />
          </div>

          {/* Confirmation & Legal Notes */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Confirmation, Regulatory & Legal Notes
            </label>
            <textarea
              rows={3}
              value={activeTemplateForm.confirmation_notes || ''}
              onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, confirmation_notes: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.85rem',
                marginTop: '4px',
                lineHeight: '1.4',
              }}
            />
          </div>

          {/* Dual Signatures Setup */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
            {/* Training Admin Signature */}
            <div
              style={{
                padding: '12px',
                background: 'rgba(30, 144, 255, 0.08)',
                border: '1px solid rgba(30, 144, 255, 0.25)',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E90FF', marginBottom: '8px' }}>
                Training Admin Endorsement
              </div>
              <input
                type="text"
                placeholder="Signer Full Name"
                value={activeTemplateForm.training_admin_name || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, training_admin_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  marginBottom: '6px',
                }}
              />
              <input
                type="text"
                placeholder="Signer Title"
                value={activeTemplateForm.training_admin_title || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, training_admin_title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  marginBottom: '6px',
                }}
              />
              <input
                type="text"
                placeholder="Digital Signature (SVG / Data URL)"
                value={activeTemplateForm.training_admin_signature || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, training_admin_signature: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {/* Sifo Director Signature */}
            <div
              style={{
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#EF4444', marginBottom: '8px' }}>
                Sifo Director Endorsement
              </div>
              <input
                type="text"
                placeholder="Signer Full Name"
                value={activeTemplateForm.director_name || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, director_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  marginBottom: '6px',
                }}
              />
              <input
                type="text"
                placeholder="Signer Title"
                value={activeTemplateForm.director_title || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, director_title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  marginBottom: '6px',
                }}
              />
              <input
                type="text"
                placeholder="Digital Signature (SVG / Data URL)"
                value={activeTemplateForm.director_signature || ''}
                onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, director_signature: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          {isSystemAdmin ? (
            <button
              onClick={handleSaveTemplate}
              disabled={isSavingTemplate}
              style={{
                marginTop: '8px',
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Save size={16} /> {isSavingTemplate ? 'Saving Template...' : 'Save & Publish Template'}
            </button>
          ) : (
            <div
              style={{
                marginTop: '8px',
                padding: '10px 14px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
              }}
            >
              Read-only Inspection Mode &bull; Edits restricted to System Admin
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
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f9fafb' }}>
            Live Landscape Preview ({selectedTemplateType})
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.74rem',
              color: '#9ca3af',
            }}
          >
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#1E90FF' }} />
            Dodger Blue
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', marginLeft: '6px' }} />
            Light Red
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#FFFFFF', marginLeft: '6px' }} />
            White
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
