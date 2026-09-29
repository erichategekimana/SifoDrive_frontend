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
    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Filter bar */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
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
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px 12px',
              minWidth: '240px',
            }}
          >
            <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Search certificate # or name..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>

          <select
            value={trackFilter}
            onChange={(e) => onTrackFilterChange(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          >
            <option value="ALL">All Tracks</option>
            <option value="STUDENT">Enrolled Student</option>
            <option value="GUEST">Guest Trial</option>
            <option value="ENTERPRISE">Enterprise Partner</option>
          </select>
        </div>
      </div>

      {/* Certificates List Table */}
      {isLoading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Spinner size={36} />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading certificates...</p>
        </div>
      ) : certificatesData.results.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Award size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No certificates issued yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Serial Number</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Recipient</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Track & School</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Score</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Issue Date</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificatesData.results.map((cert) => (
                <tr key={cert.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-light)' }}>
                      {cert.certificate_number}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cert.student_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: {cert.student_code}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant="neutral">{cert.track_type}</Badge>
                    {cert.enterprise_name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '3px' }}>
                        {cert.enterprise_name}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontWeight: 800, color: '#10b981' }}>
                      {cert.score} / {cert.total_questions}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {new Date(cert.issue_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => onSelectCertificate(cert)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-primary)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <QrCode size={13} /> View & QR
                      </button>
                      <a
                        href={`/verify/certificate/${cert.verification_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          background: 'transparent',
                          color: 'var(--primary-light)',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                        }}
                      >
                        <ExternalLink size={13} /> Verify
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
