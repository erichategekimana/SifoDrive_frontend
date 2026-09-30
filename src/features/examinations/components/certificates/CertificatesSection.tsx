import React, { useState, useEffect, useCallback } from 'react';
import {
  AdminService,
  type CertificateItem,
  type PaginatedResult,
} from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { CertificateRegistryTable } from './CertificateRegistryTable';
import { CertificateTemplatesView } from './CertificateTemplatesView';
import { CertificatePreviewModal } from './CertificatePreviewModal';

interface CertificatesSectionProps {
  isSystemAdmin: boolean;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({ isSystemAdmin }) => {
  const { showToast } = useToast();
  const adminService = AdminService.getInstance();

  const [certSubTab, setCertSubTab] = useState<'registry' | 'templates'>('registry');

  // Registry state
  const [certificatesData, setCertificatesData] = useState<PaginatedResult<CertificateItem>>({
    count: 0,
    results: [],
  });
  const [isCertificatesLoading, setIsCertificatesLoading] = useState<boolean>(false);
  const [certSearch, setCertSearch] = useState<string>('');
  const [certTrackFilter, setCertTrackFilter] = useState<string>('ALL');

  // Preview Modal state
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const fetchCertificates = useCallback(async () => {
    try {
      setIsCertificatesLoading(true);
      const params: Record<string, any> = {};
      if (certTrackFilter !== 'ALL') params.track_type = certTrackFilter;
      if (certSearch.trim()) params.search = certSearch.trim();

      const res = await adminService.getCertificates(params);
      setCertificatesData(res);
    } catch (err: any) {
      showToast('Failed to load certificates registry: ' + (err.message || ''), 'error');
    } finally {
      setIsCertificatesLoading(false);
    }
  }, [certTrackFilter, certSearch]);

  useEffect(() => {
    if (certSubTab === 'registry') {
      fetchCertificates();
    }
  }, [certSubTab, fetchCertificates]);

  const handleSelectCertificate = (cert: CertificateItem) => {
    setSelectedCert(cert);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedCert(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-tab navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setCertSubTab('registry')}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            background: certSubTab === 'registry' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
            color: certSubTab === 'registry' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderColor: certSubTab === 'registry' ? 'var(--text-muted)' : 'var(--border-subtle)',
          }}
        >
          Issued Certificates ({certificatesData.count})
        </button>
        <button
          onClick={() => setCertSubTab('templates')}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            background: certSubTab === 'templates' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
            color: certSubTab === 'templates' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderColor: certSubTab === 'templates' ? 'var(--text-muted)' : 'var(--border-subtle)',
          }}
        >
          Template Studio
        </button>
      </div>

      {/* Sub-tab 1: Registry */}
      {certSubTab === 'registry' && (
        <>
          <CertificateRegistryTable
            certificatesData={certificatesData}
            isLoading={isCertificatesLoading}
            search={certSearch}
            onSearchChange={setCertSearch}
            trackFilter={certTrackFilter}
            onTrackFilterChange={setCertTrackFilter}
            onSelectCertificate={handleSelectCertificate}
          />
          <CertificatePreviewModal
            isOpen={isPreviewOpen}
            certificate={selectedCert}
            onClose={handleClosePreview}
          />
        </>
      )}

      {/* Sub-tab 2: Templates Studio */}
      {certSubTab === 'templates' && (
        <CertificateTemplatesView isSystemAdmin={isSystemAdmin} />
      )}
    </div>
  );
};
