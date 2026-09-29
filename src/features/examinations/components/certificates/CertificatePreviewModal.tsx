import React from 'react';
import { X, Printer, ExternalLink } from 'lucide-react';
import type { CertificateItem } from '../../../../core/services/AdminService';
import { CertificateLandscapeDocument } from '../../../../components/common/CertificateLandscapeDocument';

interface CertificatePreviewModalProps {
  isOpen: boolean;
  certificate: CertificateItem | null;
  onClose: () => void;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  isOpen,
  certificate,
  onClose,
}) => {
  if (!isOpen || !certificate) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
        overflowY: 'auto',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1060px',
          maxHeight: '94vh',
          overflowY: 'auto',
          padding: '24px',
          borderRadius: '16px',
          background: '#0B1528',
          border: '1px solid rgba(30, 144, 255, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Modal Actions Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div>
            <span
              style={{
                background: '#1E90FF',
                color: '#ffffff',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
              }}
            >
              OFFICIAL SIFO ACCREDITATION REGISTRY
            </span>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '4px' }}>
              Serial: <strong style={{ color: '#f9fafb' }}>{certificate.certificate_number}</strong> • Issued to {certificate.student_name}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Printer size={15} /> Print / Save PDF
            </button>

            <a
              href={`/verify/certificate/${certificate.verification_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(90deg, #1E90FF 0%, #0F5BB5 100%)',
                color: '#ffffff',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(30, 144, 255, 0.3)',
              }}
            >
              <ExternalLink size={14} /> Open Public Registry
            </a>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '6px',
                color: '#9ca3af',
                padding: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Landscape Certificate Document */}
        <CertificateLandscapeDocument
          headerSubtitle={certificate.template_snapshot?.header_subtitle}
          title={certificate.template_snapshot?.title}
          conferralText={certificate.template_snapshot?.conferral_text}
          courseName={certificate.template_snapshot?.course_name}
          declarationText={certificate.template_snapshot?.declaration_text}
          confirmationNotes={certificate.template_snapshot?.confirmation_notes}
          trainingAdminName={certificate.template_snapshot?.training_admin_name}
          trainingAdminTitle={certificate.template_snapshot?.training_admin_title}
          trainingAdminSignature={certificate.template_snapshot?.training_admin_signature}
          directorName={certificate.template_snapshot?.director_name}
          directorTitle={certificate.template_snapshot?.director_title}
          directorSignature={certificate.template_snapshot?.director_signature}
          certificateNumber={certificate.certificate_number}
          studentName={certificate.student_name}
          studentCode={certificate.student_code}
          trackType={certificate.track_type}
          enterpriseName={certificate.enterprise_name}
          cohortName={certificate.cohort_name}
          startDate={certificate.started_at}
          completedDate={certificate.completed_at}
          score={certificate.score}
          totalQuestions={certificate.total_questions}
          verificationHash={certificate.verification_hash}
          verificationUrl={certificate.verification_url}
          isPreview={false}
        />
      </div>
    </div>
  );
};
