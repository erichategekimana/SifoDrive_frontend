import React from 'react';
import { Search, Award, QrCode, ExternalLink } from 'lucide-react';
import type { CertificateItem, PaginatedResult } from '../../../../core/services/AdminService';
import { Badge } from '../../../../components/common/Badge';
import { Spinner } from '../../../../components/common/Spinner';

interface CertificateRegistryTableProps {
  certificatesData: PaginatedResult<CertificateItem>;
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  trackFilter: string;
  onTrackFilterChange: (value: string) => void;
  onSelectCertificate: (cert: CertificateItem) => void;
}

export const CertificateRegistryTable: React.FC<CertificateRegistryTableProps> = ({
  certificatesData,
  isLoading,
  search,
  onSearchChange,
  trackFilter,
  onTrackFilterChange,
  onSelectCertificate,
}) => {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        padding: '22px 24px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header & Filter bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Issued Certificates
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
            Official theory credentials generated for candidates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '5px 10px',
              minWidth: '220px',
            }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)', marginRight: '6px' }} />
            <input
              type="text"
              placeholder="Search certificate or name..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <select
            value={trackFilter}
            onChange={(e) => onTrackFilterChange(e.target.value)}
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '5px 10px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          >
            <option value="ALL">All Tracks</option>
            <option value="STUDENT">Student</option>
            <option value="GUEST">Guest</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Certificates List Table */}
      {isLoading ? (
        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
          <Spinner size={28} />
        </div>
      ) : certificatesData.results.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          <Award size={22} style={{ opacity: 0.4, marginBottom: '6px' }} />
          <div>No certificates issued yet.</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Serial Number</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Recipient</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Track</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Score</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600 }}>Issue Date</th>
                <th style={{ padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {certificatesData.results.map((cert) => (
                <tr key={cert.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {cert.certificate_number}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div>{cert.student_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{cert.student_code}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge variant="neutral">{cert.track_type}</Badge>
                    {cert.enterprise_name && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {cert.enterprise_name}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    {cert.score}/{cert.total_questions}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(cert.issue_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => onSelectCertificate(cert)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <QrCode size={12} /> View
                      </button>
                      <a
                        href={`/verify/certificate/${cert.verification_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={12} /> Verify
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

