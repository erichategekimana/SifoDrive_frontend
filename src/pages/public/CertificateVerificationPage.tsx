import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Printer,
  ChevronLeft,
} from 'lucide-react';
import { AdminService } from '../../core/services/AdminService';
import { CertificateLandscapeDocument } from '../../components/common/CertificateLandscapeDocument';

export const CertificateVerificationPage: React.FC = () => {
  const { hashOrCode } = useParams<{ hashOrCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certData, setCertData] = useState<any | null>(null);

  const adminService = AdminService.getInstance();

  useEffect(() => {
    if (!hashOrCode) {
      setError('No certificate identifier provided.');
      setLoading(false);
      return;
    }

    const fetchVerification = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.verifyPublicCertificate(hashOrCode);
        setCertData(data);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            'Certificate verification failed. The provided hash or serial number is invalid or has been revoked.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [hashOrCode]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #111827 0%, #030712 100%)',
        color: '#f9fafb',
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Top Header */}
      <div
        className="no-print"
        style={{
          width: '100%',
          maxWidth: '1040px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#9ca3af',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s',
          }}
        >
          <ChevronLeft size={18} /> Back to Sifo Drive
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#10b981" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', letterSpacing: '0.05em' }}>
            NATIONAL VERIFICATION REGISTRY
          </span>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            padding: '80px 20px',
            textAlign: 'center',
            color: '#9ca3af',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(16, 185, 129, 0.2)',
              borderTopColor: '#10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p>Verifying cryptographic hash against national police accredited database...</p>
        </div>
      ) : error ? (
        <div
          style={{
            width: '100%',
            maxWidth: '650px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}
        >
          <XCircle size={56} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
            Invalid Certificate or Verification Failed
          </h2>
          <p style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
            {error}
          </p>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#9ca3af',
              background: 'rgba(0,0,0,0.3)',
              padding: '12px',
              borderRadius: '8px',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
            }}
          >
            Query ID: {hashOrCode}
          </div>
        </div>
      ) : certData ? (
        <div
          style={{
            width: '100%',
            maxWidth: '1040px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Authenticity Banner */}
          <div
            className="no-print"
            style={{
              background: 'rgba(30, 144, 255, 0.1)',
              border: '1px solid rgba(30, 144, 255, 0.3)',
              borderRadius: '12px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1E90FF 0%, #0F5BB5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1E90FF' }}>
                  Authenticity Verified & Cryptographically Signed
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                  Official Rwanda Traffic Safety accreditation ledger record • Tamper-proof SHA-256 seal.
                </div>
              </div>
            </div>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f9fafb',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                transition: 'all 0.2s',
              }}
            >
              <Printer size={16} /> Print / Save Landscape PDF
            </button>
          </div>

          {/* Certificate Paper Presentation in Landscape */}
          <div id="certificate-print-area" style={{ width: '100%', overflowX: 'auto' }}>
            <CertificateLandscapeDocument
              headerSubtitle={certData.template_snapshot?.header_subtitle}
              title={certData.template_snapshot?.title}
              conferralText={certData.template_snapshot?.conferral_text}
              courseName={certData.template_snapshot?.course_name}
              declarationText={certData.template_snapshot?.declaration_text}
              confirmationNotes={certData.template_snapshot?.confirmation_notes}
              trainingAdminName={certData.template_snapshot?.training_admin_name}
              trainingAdminTitle={certData.template_snapshot?.training_admin_title}
              trainingAdminSignature={certData.template_snapshot?.training_admin_signature}
              directorName={certData.template_snapshot?.director_name}
              directorTitle={certData.template_snapshot?.director_title}
              directorSignature={certData.template_snapshot?.director_signature}
              certificateNumber={certData.certificate_number}
              studentName={certData.student_name}
              studentCode={certData.student_code}
              trackType={certData.track_type}
              enterpriseName={certData.enterprise_name}
              cohortName={certData.cohort_name}
              startDate={certData.started_at}
              completedDate={certData.completed_at}
              score={certData.score}
              totalQuestions={certData.total_questions}
              verificationHash={certData.verification_hash}
              verificationUrl={certData.verification_url}
              isPreview={false}
            />
          </div>

          <style>{`
            @page {
              size: landscape;
              margin: 8mm;
            }
            @media print {
              body {
                background: #FFFFFF !important;
                color: #000000 !important;
              }
              .no-print {
                display: none !important;
              }
              #certificate-print-area {
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
              }
              .sifo-certificate-landscape {
                box-shadow: none !important;
                border: 4px solid #1E90FF !important;
                page-break-inside: avoid;
              }
            }
          `}</style>
        </div>
      ) : null}
    </div>
  );
};
