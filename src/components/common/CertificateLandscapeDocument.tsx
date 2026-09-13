import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';

export interface CertificateLandscapeProps {
  // Editable Template Fields
  headerSubtitle?: string;
  title?: string;
  conferralText?: string;
  courseName?: string;
  declarationText?: string;
  confirmationNotes?: string;
  trainingAdminName?: string;
  trainingAdminTitle?: string;
  trainingAdminSignature?: string;
  directorName?: string;
  directorTitle?: string;
  directorSignature?: string;

  // Dynamic / Verified Values (Immutable)
  certificateNumber?: string;
  studentName?: string;
  studentCode?: string;
  trackType?: 'STUDENT' | 'GUEST' | 'ENTERPRISE' | string;
  enterpriseName?: string;
  cohortName?: string;
  startDate?: string | null;
  completedDate?: string | null;
  score?: number;
  totalQuestions?: number;
  verificationHash?: string;
  verificationUrl?: string;

  // Options
  isPreview?: boolean;
  className?: string;
}

export const CertificateLandscapeDocument: React.FC<CertificateLandscapeProps> = ({
  headerSubtitle = 'Republic of Rwanda • Sifo Drive Theory Accreditation',
  title = 'Certificate of Theory Competence',
  conferralText = 'This official credential is proudly awarded to',
  courseName = 'Rwanda Driving Theory — Provisional License Preparation',
  declarationText,
  confirmationNotes = 'Certified in accordance with Rwanda National Police traffic theory regulations and Law No 058/2021 on Personal Data Protection. Scan the embedded QR code to verify authenticity.',
  trainingAdminName = 'Ingabire Diane',
  trainingAdminTitle = 'Head of Training & Pedagogy',
  trainingAdminSignature,
  directorName = 'Mugabo Eric',
  directorTitle = 'Managing Director, Sifo Drive',
  directorSignature,

  certificateNumber = 'SIFO-CERT-2026-RW-DEMO',
  studentName = 'Kagame Alexis',
  studentCode = '+250 788 123 456',
  trackType = 'STUDENT',
  enterpriseName,
  cohortName = 'Cohort 1 — Kigali Class',
  startDate = '2026-07-15',
  completedDate = '2026-09-13',
  score = 18,
  totalQuestions = 20,
  verificationHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  verificationUrl,
  isPreview = false,
}) => {
  // Format dates safely
  const formatDisplayDate = (d?: string | null) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-RW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return d;
    }
  };

  const formattedStart = formatDisplayDate(startDate);
  const formattedCompletion = formatDisplayDate(completedDate);
  const percentScore = Math.round((score / (totalQuestions || 20)) * 100);

  // Render declaration text with placeholders
  const resolvedDeclaration = declarationText
    ? declarationText
        .replace(/{student_name}/g, studentName)
        .replace(/{cohort_name}/g, cohortName || 'Accredited Curriculum')
        .replace(/{start_date}/g, formattedStart || 'Commencement')
        .replace(/{completion_date}/g, formattedCompletion)
        .replace(/{score}/g, String(score))
        .replace(/{total_questions}/g, String(totalQuestions))
        .replace(/{percentage}/g, String(percentScore))
        .replace(/{enterprise_name}/g, enterpriseName || 'Partner Driving School')
    : `This is to certify that ${studentName} has successfully completed the Rwanda Driving Theory Curriculum and demonstrated proficiency in Traffic Regulations, Road Signage, and Highway Code Safety with a certified score of ${score}/${totalQuestions} (${percentScore}%).`;

  const effectiveVerificationUrl =
    verificationUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/verify/certificate/${verificationHash}`
      : `/verify/certificate/${verificationHash}`);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
    effectiveVerificationUrl
  )}`;

  return (
    <div
      className="sifo-certificate-landscape"
      style={{
        width: '100%',
        maxWidth: '1020px',
        margin: '0 auto',
        aspectRatio: '1.414 / 1',
        minHeight: '600px',
        background: '#FFFFFF', // Pure professional white paper (no blue or red border lines around sides)
        color: '#0F172A',
        borderRadius: '8px',
        border: '1px solid #E2E8F0', // Clean subtle sheet edge
        boxShadow: '0 15px 35px -10px rgba(15, 23, 42, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '28px 40px 22px 40px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND: LOW-VISIBILITY ZIGZAG GUILLOCHÉ LINES PATTERN     */}
      {/* ------------------------------------------------------------- */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.035, // Very low visibility to prevent visual clutter
          zIndex: 1,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="sifo-subtle-zigzag" width="48" height="24" patternUnits="userSpaceOnUse">
            {/* Fine horizontal zigzag pattern */}
            <path
              d="M 0 12 L 12 2 L 24 12 L 36 2 L 48 12 L 36 22 L 24 12 L 12 22 Z"
              fill="none"
              stroke="#1E90FF"
              strokeWidth="0.65"
            />
            {/* Faint secondary intersecting diagonal lines */}
            <path
              d="M 0 0 L 24 24 M 24 0 L 48 24 M 0 24 L 24 0 M 24 24 L 48 0"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="0.35"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sifo-subtle-zigzag)" />
      </svg>

      {/* ------------------------------------------------------------- */}
      {/* WATERMARK: ENLARGED CERTIFIED/AWARD MEDAL ICON                */}
      {/* Crossed half of the paper (width 50%), opacity 10% - 20%      */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '50%',
          maxWidth: '460px',
          aspectRatio: '1',
          pointerEvents: 'none',
          opacity: 0.13, // Exactly between 10% and 20% to avoid blocking text
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 240 240"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Upper Medallion Circle (Matching Lucide Award geometry) */}
          <circle
            cx="120"
            cy="84"
            r="60"
            stroke="#1E90FF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner concentric ring */}
          <circle
            cx="120"
            cy="84"
            r="48"
            stroke="#F87171" // Light red inner ring accent
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />
          {/* Delicate centered medallion star */}
          <polygon
            points="120,54 126,71 144,71 130,82 135,99 120,89 105,99 110,82 96,71 114,71"
            fill="#1E90FF"
            opacity="0.75"
          />

          {/* Lower Award Ribbons (Matching Lucide Award: M15.477 12.89 17 22l-5-3-5 3 1.523-9.11) */}
          <path
            d="M 155 133 L 170 224 L 120 194 L 70 224 L 85 133"
            stroke="#1E90FF"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner ribbon fold lines in light red */}
          <path
            d="M 120 194 L 120 144"
            stroke="#F87171"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FOREGROUND CONTENT (HIGH LEGIBILITY, Z-INDEX: 2)              */}
      {/* ------------------------------------------------------------- */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        
        {/* 1. TOP HEADER: AUTHORITY PILL, TITLE, COURSE & SERIAL */}
        <div style={{ textAlign: 'center' }}>
          {/* Authority Header Tag: Colored with Sifo Dodger Blue */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1E90FF', // Dodger Blue only where needed
              color: '#FFFFFF',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 5px rgba(30, 144, 255, 0.25)',
              marginBottom: '6px',
            }}
          >
            <Award size={13} color="#FFFFFF" />
            <span>{headerSubtitle}</span>
          </div>

          {/* Certificate Title: Crisp Authoritative Dark Slate */}
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 900,
              color: '#0F172A',
              margin: '4px 0 3px 0',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              lineHeight: 1.15,
            }}
          >
            {title}
          </h1>

          {/* Course Name & Certificate Number: Clean Neutral Styling */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.92rem', color: '#334155', fontWeight: 700 }}>
              {courseName}
            </span>
            <span style={{ color: '#94A3B8', fontWeight: 700 }}>•</span>
            <span
              style={{
                fontSize: '0.74rem',
                color: '#64748B',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              ID: {certificateNumber}
            </span>
            {isPreview && (
              <span
                style={{
                  background: '#FEF2F2',
                  color: '#EF4444', // Light red preview badge
                  border: '1px solid #FCA5A5',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                }}
              >
                SAMPLE PREVIEW
              </span>
            )}
          </div>
        </div>

        {/* 2. CANDIDATE & CONFERRAL SECTION */}
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          {/* Conferral lead-in text */}
          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 700,
            }}
          >
            {conferralText}
          </div>

          {/* Recipient Full Name */}
          <div
            style={{
              fontSize: '2.15rem',
              fontWeight: 900,
              fontFamily: "'Georgia', 'Cambria', serif",
              color: '#0F172A',
              margin: '3px 0 4px 0',
              letterSpacing: '-0.01em',
            }}
          >
            {studentName}
          </div>

          {/* Candidate ID / Phone & Enterprise partner */}
          <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span>Candidate Record / Phone: <strong>{studentCode}</strong></span>
            {enterpriseName && (
              <>
                <span style={{ color: '#94A3B8' }}>•</span>
                <span style={{ color: '#0F172A', fontWeight: 600 }}>
                  Accredited Partner: {enterpriseName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 3. DECLARATION TEXT BOX: Clean parchment without colored borders */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderLeft: '3px solid #1E90FF', // Single refined accent line
            padding: '12px 20px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            lineHeight: '1.6',
            color: '#1E293B',
            textAlign: 'center',
          }}
        >
          {resolvedDeclaration}
        </div>

        {/* 4. METRICS ROW: Clean neutral cards, color applied ONLY to certified score */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: trackType !== 'GUEST' && startDate ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
            gap: '10px',
            textAlign: 'center',
            margin: '8px 0',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              padding: '6px 8px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
              Accreditation Track
            </div>
            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem', marginTop: '2px' }}>
              {trackType}
            </div>
          </div>

          {trackType !== 'GUEST' && startDate && (
            <div
              style={{
                background: '#FFFFFF',
                padding: '6px 8px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                Curriculum Commenced
              </div>
              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem', marginTop: '2px' }}>
                {formattedStart || '—'}
              </div>
            </div>
          )}

          <div
            style={{
              background: '#FFFFFF',
              padding: '6px 8px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.66rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
              Certified On
            </div>
            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem', marginTop: '2px' }}>
              {formattedCompletion}
            </div>
          </div>

          {/* Official Certified Score: Colored with light red */}
          <div
            style={{
              background: '#FEF2F2',
              padding: '6px 8px',
              border: '1px solid #FECACA',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '0.66rem', color: '#991B1B', textTransform: 'uppercase', fontWeight: 700 }}>
              Official Certified Score
            </div>
            <div style={{ fontWeight: 900, color: '#DC2626', fontSize: '0.86rem', marginTop: '2px' }}>
              {score} / {totalQuestions} ({percentScore}%)
            </div>
          </div>
        </div>

        {/* 5. DUAL SIGNATURES & VERIFICATION QR ROW */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 1fr',
            alignItems: 'flex-end',
            gap: '16px',
            paddingTop: '10px',
            borderTop: '1px dashed #E2E8F0',
          }}
        >
          {/* Training Administrator Signature */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {trainingAdminSignature?.startsWith('data:') ? (
                <img
                  src={trainingAdminSignature}
                  alt="Training Admin Signature"
                  style={{ maxHeight: '32px' }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "'Brush Script MT', 'Dancing Script', cursive",
                    fontSize: '1.35rem',
                    color: '#1E90FF', // Signature stroke colored
                    fontWeight: 700,
                  }}
                >
                  {trainingAdminName}
                </span>
              )}
            </div>
            <div
              style={{
                borderTop: '1px solid #CBD5E1',
                paddingTop: '4px',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#0F172A',
              }}
            >
              {trainingAdminName}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
              {trainingAdminTitle}
            </div>
          </div>

          {/* Central Scannable QR Code & Stamp */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                background: '#FFFFFF',
                padding: '4px',
                borderRadius: '6px',
                border: '1.5px solid #E2E8F0',
                display: 'inline-block',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
              }}
            >
              <img
                src={qrImageUrl}
                alt="Verification QR Code"
                width={70}
                height={70}
                style={{ display: 'block', borderRadius: '4px' }}
              />
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                color: '#0F172A',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
              }}
            >
              <ShieldCheck size={11} color="#1E90FF" />
              <span>Scan to Verify</span>
            </div>
          </div>

          {/* Sifo Director Signature */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {directorSignature?.startsWith('data:') ? (
                <img
                  src={directorSignature}
                  alt="Director Signature"
                  style={{ maxHeight: '32px' }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "'Brush Script MT', 'Dancing Script', cursive",
                    fontSize: '1.35rem',
                    color: '#EF4444', // Light red signature stroke
                    fontWeight: 700,
                  }}
                >
                  {directorName}
                </span>
              )}
            </div>
            <div
              style={{
                borderTop: '1px solid #CBD5E1',
                paddingTop: '4px',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#0F172A',
              }}
            >
              {directorName}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
              {directorTitle}
            </div>
          </div>
        </div>

        {/* 6. LEGAL ACCREDITATION FOOTER & CRYPTOGRAPHIC LEDGER HASH */}
        <div
          style={{
            marginTop: '8px',
            paddingTop: '6px',
            borderTop: '1px solid #F1F5F9',
            textAlign: 'center',
            fontSize: '0.67rem',
            color: '#64748B',
            lineHeight: 1.4,
          }}
        >
          <div>{confirmationNotes}</div>
          <div style={{ fontFamily: 'monospace', fontSize: '0.62rem', color: '#94A3B8', marginTop: '2px' }}>
            National Police Accreditation Registry • Hash: {verificationHash.slice(0, 32)}...
          </div>
        </div>

      </div>
    </div>
  );
};
