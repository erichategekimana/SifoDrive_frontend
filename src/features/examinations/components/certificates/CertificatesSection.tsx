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
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            background: certSubTab === 'registry' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
            color: certSubTab === 'registry' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Issued Certificates Registry ({certificatesData.count})
        </button>
        <button
          onClick={() => setCertSubTab('templates')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            background: certSubTab === 'templates' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
            color: certSubTab === 'templates' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          Certificate Template Studio (Student, Guest, Enterprise)
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
