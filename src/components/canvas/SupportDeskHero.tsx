import React from 'react';

export interface SupportDeskCategory {
  id: string;
  title: string;
  category: 'CONTENT_INQUIRY' | 'TECHNICAL_ISSUE' | 'EXAM_DISPUTE' | 'ACCOUNT_BILLING' | 'ADMINISTRATIVE' | 'OTHER';
  recipientRole: 'TUTOR' | 'TECH_SUPPORT' | 'TRAINING_ADMIN';
  description: string;
}

interface SupportDeskHeroProps {
  onSelectCategory: (item: SupportDeskCategory) => void;
  activeCategoryId?: string | null;
  children?: React.ReactNode;
}

export const SUPPORT_CATEGORIES: SupportDeskCategory[] = [
  {
    id: 'operations',
    title: 'Operations',
    category: 'ADMINISTRATIVE',
    recipientRole: 'TRAINING_ADMIN',
    description: 'Logistics, campus access, operational policies, and administrative scheduling.',
  },
  {
    id: 'technical',
    title: 'Technical',
    category: 'TECHNICAL_ISSUE',
    recipientRole: 'TECH_SUPPORT',
    description: 'System glitches, portal access, LMS issues, and IT support.',
  },
  {
    id: 'finance',
    title: 'Finance',
    category: 'ACCOUNT_BILLING',
    recipientRole: 'TRAINING_ADMIN',
    description: 'Tuition, fees, payment plans, and financial aid inquiries.',
  },
  {
    id: 'registrar',
    title: 'Registrar',
    category: 'ADMINISTRATIVE',
    recipientRole: 'TRAINING_ADMIN',
    description: 'Transcripts, enrollment verification, course registration, and academic records.',
  },
  {
    id: 'studies',
    title: 'Studies',
    category: 'CONTENT_INQUIRY',
    recipientRole: 'TUTOR',
    description: 'Curriculum, lessons, assignments, learning materials, and academic inquiries.',
  },
  {
    id: 'others',
    title: 'Others',
    category: 'OTHER',
    recipientRole: 'TRAINING_ADMIN',
    description: 'General questions, feedback, and miscellaneous support inquiries.',
  },
];

export const SupportDeskHero: React.FC<SupportDeskHeroProps> = ({
  onSelectCategory,
  activeCategoryId,
  children,
}) => {
  return (
    <div
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05), 0 10px 25px -5px rgba(15, 23, 42, 0.04)',
        marginBottom: '28px',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* 1. Top Vibrant Banner with Calendar Header Gradient */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #155e75 45%, #2e2870 100%)',
          padding: '26px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#FFFFFF',
            fontSize: '1.68rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          How can we help you?
        </h2>
        <p
          style={{
            margin: '6px 0 0 0',
            color: 'rgba(255, 255, 255, 0.82)',
            fontSize: '0.86rem',
            fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          Select a category below to route your inquiry directly to the right academy department.
        </p>
      </div>

      {/* 2. Category Cards on Soft Off-White Surface (#F8FAFC) */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          padding: '24px 20px',
          borderBottom: children ? '1px solid #E2E8F0' : 'none',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
            gap: '14px',
            maxWidth: '1060px',
            margin: '0 auto',
          }}
        >
          {SUPPORT_CATEGORIES.map((item) => {
            const isSelected = activeCategoryId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCategory(item)}
                style={{
                  backgroundColor: isSelected ? '#F0F6FF' : '#FFFFFF',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #0055A5' : '1px solid #E2E8F0',
                  boxShadow: isSelected
                    ? '0 6px 18px rgba(0, 85, 165, 0.16)'
                    : '0 1px 3px rgba(15, 23, 42, 0.04)',
                  padding: '22px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = isSelected
                    ? '0 8px 22px rgba(0, 85, 165, 0.22)'
                    : '0 6px 16px rgba(15, 23, 42, 0.08)';
                  e.currentTarget.style.borderColor = '#0055A5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = isSelected
                    ? '0 6px 18px rgba(0, 85, 165, 0.16)'
                    : '0 1px 3px rgba(15, 23, 42, 0.04)';
                  e.currentTarget.style.borderColor = isSelected ? '#0055A5' : '#E2E8F0';
                }}
                title={`Click to open ticket for ${item.title}`}
              >
                {/* Rounded Icon Box with soft blue tint */}
                <div
                  style={{
                    width: '62px',
                    height: '62px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #0055A5' : '1.5px solid #CBD5E1',
                    backgroundColor: isSelected ? '#E0EDFE' : '#F0F6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    transition: 'all 0.18s ease',
                  }}
                >
                  {renderCategoryIcon(item.id)}
                </div>

                {/* Category Label */}
                <span
                  style={{
                    color: isSelected ? '#0055A5' : '#0F172A',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  {item.title}
                </span>

                {isSelected && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      backgroundColor: '#0055A5',
                      color: '#FFFFFF',
                      padding: '2px 7px',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0, 85, 165, 0.3)',
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Merged Support Ticket Section on Pure White Surface */}
      {children && (
        <div
          id="ticket-form-section"
          style={{
            backgroundColor: '#FFFFFF',
            padding: '26px 28px',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

function renderCategoryIcon(id: string) {
  const strokeColor = '#0055A5';

  switch (id) {
    case 'operations':
      // Two interlocking gears
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 48 48"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Main Gear */}
          <circle cx="19" cy="28" r="6" />
          <path d="M19 19v3M19 34v3M10 28h3M25 28h3M12.6 21.6l2.1 2.1M23.3 32.3l2.1 2.1M12.6 34.4l2.1-2.1M23.3 23.7l2.1-2.1" />
          {/* Top-Right Secondary Gear */}
          <circle cx="31" cy="17" r="4.5" />
          <path d="M31 10v2M31 22v2M24 17h2M36 17h2M26 12l1.4 1.4M34.6 20.6l1.4 1.4M26 22l1.4-1.4M34.6 13.4l1.4-1.4" />
        </svg>
      );

    case 'technical':
    case 'technology':
      // Crossed wrench and screwdriver
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 48 48"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Screwdriver (slanted) */}
          <line x1="13" y1="35" x2="31" y2="17" strokeWidth="2.6" />
          <path d="M11 37l4-4-2-2-4 4a1.4 1.4 0 0 0 2 2z" fill={strokeColor} />
          <path d="M30 16l4-4 2 2-4 4z" />
          <line x1="33" y1="13" x2="37" y2="9" strokeWidth="3" />
          {/* Wrench (slanted opposing) */}
          <line x1="35" y1="35" x2="17" y2="17" strokeWidth="2.6" />
          <path d="M37 33a2.5 2.5 0 0 1-2.5 2.5c-.8 0-1.5-.4-2-.9l-1.6 1.6 2.5 2.5a3 3 0 0 0 4.2-4.2l-.6-.5z" />
          <path d="M13 19a4 4 0 0 1 1-5.5l3.5 3.5a1.5 1.5 0 0 0 2.1-2.1L16 11.4A4 4 0 0 1 21.5 12l-1 2.5" />
        </svg>
      );

    case 'finance':
      // Stack of coins with front coin
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 48 48"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Top coin in stack */}
          <ellipse cx="29" cy="17" rx="9" ry="4" />
          {/* Middle rim */}
          <path d="M20 17v4c0 2.2 4 4 9 4s9-1.8 9-4v-4" />
          {/* Bottom rim */}
          <path d="M20 21v4c0 2.2 4 4 9 4s9-1.8 9-4v-4" />
          {/* Front coin */}
          <circle cx="17" cy="28" r="7.5" fill="#FFFFFF" />
          {/* Currency mark / sign */}
          <path d="M15.5 25h3.5M15.5 27.5h3M17 25v6" strokeWidth="1.8" />
        </svg>
      );

    case 'registrar':
      // Clipboard with checkmarks
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 48 48"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Board */}
          <rect x="12" y="11" width="24" height="29" rx="3" />
          {/* Clip */}
          <path d="M19 11V8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
          {/* Line 1 & check */}
          <path d="M16 19l2 2 3-3" strokeWidth="2" />
          <line x1="24" y1="20" x2="31" y2="20" />
          {/* Line 2 & check */}
          <path d="M16 25l2 2 3-3" strokeWidth="2" />
          <line x1="24" y1="26" x2="31" y2="26" />
          {/* Line 3 & check */}
          <path d="M16 31l2 2 3-3" strokeWidth="2" />
          <line x1="24" y1="32" x2="31" y2="32" />
        </svg>
      );

    case 'studies':
      // Graduation cap / academic studies
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 48 48"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Mortarboard Diamond */}
          <polygon points="24,10 40,18 24,26 8,18" />
          {/* Cap Base */}
          <path d="M14 21.5v8c0 4.5 4.5 7.5 10 7.5s10-3 10-7.5v-8" />
          {/* Tassel */}
          <path d="M37 19.5v10" />
          <circle cx="37" cy="31" r="1.5" fill={strokeColor} />
        </svg>
      );

    case 'others':
    default:
      // Three horizontal dots
      return (
        <svg
          width="36"
          height="36"
          viewBox="0 0 48 48"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="14" cy="24" r="2.8" fill={strokeColor} />
          <circle cx="24" cy="24" r="2.8" fill={strokeColor} />
          <circle cx="34" cy="24" r="2.8" fill={strokeColor} />
        </svg>
      );
  }
}
