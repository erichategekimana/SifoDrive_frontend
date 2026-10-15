import React, { useState, useMemo } from 'react';
import {
  FileText,
  ExternalLink,
  Download,
  Maximize2,
  Minimize2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export interface PdfViewerProps {
  url: string | null | undefined;
  title?: string;
  minHeight?: string | number;
  maxHeight?: string | number;
  showToolbar?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Normalizes any PDF URL so it can be reliably rendered in an embedded iframe / object.
 * - Converts localhost:8000/media/... to /media/... so it passes through Vite proxy (same origin)
 * - Converts Google Drive view links to embeddable preview links
 * - Ensures relative /media/... paths have leading slash
 */
export function normalizePdfUrl(rawUrl?: string | null): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Blob or Data URLs (e.g. from local file input)
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Google Drive preview link conversion
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  // If backend returned absolute http://localhost:8000/media/... or http://127.0.0.1:8000/media/...
  // In development, routing through /media/... avoids cross-origin iframe restrictions
  if (
    trimmed.startsWith('http://127.0.0.1:8000/media/') ||
    trimmed.startsWith('http://localhost:8000/media/')
  ) {
    return trimmed.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, '');
  }

  // Relative media paths
  if (trimmed.startsWith('/media/')) {
    return trimmed;
  }
  if (trimmed.startsWith('media/')) {
    return `/${trimmed}`;
  }

  return trimmed;
}

/**
 * Resolves absolute URL for external new-tab opening or downloading
 */
export function getAbsolutePdfUrl(rawUrl?: string | null): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  // If already absolute http/https URL, preserve it directly!
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // If relative path (e.g. /media/...), resolve with current window location
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }
  return trimmed;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  url,
  title = 'PDF Document',
  minHeight = '520px',
  maxHeight,
  showToolbar = true,
  className,
  style,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [useGoogleViewerFallback, setUseGoogleViewerFallback] = useState(false);

  const normalizedUrl = useMemo(() => normalizePdfUrl(url), [url]);
  const absoluteUrl = useMemo(() => getAbsolutePdfUrl(url), [url]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    const downloadTarget = normalizedUrl || absoluteUrl;
    const cleanTitle = (title || 'document').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || 'document';
    const filename = cleanTitle.toLowerCase().endsWith('.pdf') ? cleanTitle : `${cleanTitle}.pdf`;

    try {
      const res = await fetch(downloadTarget);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        return;
      }
    } catch (err) {
      console.warn('Direct blob download failed, falling back to window navigation:', err);
    }

    // Fallback: direct navigation / anchor download
    const a = document.createElement('a');
    a.href = absoluteUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!normalizedUrl) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px dashed #CBD5E1',
          color: '#64748B',
          fontSize: '0.88rem',
        }}
      >
        <FileText size={28} color="#94A3B8" style={{ margin: '0 auto 8px', display: 'block' }} />
        <span>No PDF document provided or file URL is missing.</span>
      </div>
    );
  }

  // Determine embed source URL
  const isGoogleDrive = normalizedUrl.includes('drive.google.com');
  const embedSource = useMemo(() => {
    if (useGoogleViewerFallback && !isGoogleDrive) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
    }
    if (isGoogleDrive) {
      return normalizedUrl;
    }
    // PDF parameters: show toolbar and clean fit
    return `${normalizedUrl}#toolbar=1&navpanes=0&view=FitH`;
  }, [normalizedUrl, absoluteUrl, useGoogleViewerFallback, isGoogleDrive]);

  const heightValue = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;

  const content = (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isFullscreen ? '0px' : '8px',
        border: isFullscreen ? 'none' : '1px solid #CBD5E1',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        boxShadow: isFullscreen ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.06)',
        width: '100%',
        height: isFullscreen ? '100vh' : 'auto',
        ...style,
      }}
    >
      {/* Top Toolbar */}
      {showToolbar && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Document metadata & badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
              }}
            >
              <FileText size={13} />
              PDF
            </span>
            <span
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#1E293B',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '340px',
              }}
              title={title}
            >
              {title}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Fallback viewer toggle */}
            {!isGoogleDrive && (
              <button
                type="button"
                onClick={() => {
                  setUseGoogleViewerFallback((prev) => !prev);
                  setLoadError(false);
                }}
                className="canvas-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: useGoogleViewerFallback ? '#EFF6FF' : '#FFFFFF',
                  color: useGoogleViewerFallback ? '#1D4ED8' : '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                title={useGoogleViewerFallback ? 'Switch to native browser PDF engine' : 'Switch to Google Docs viewer engine'}
              >
                <Eye size={13} />
                <span>{useGoogleViewerFallback ? 'Native View' : 'Google Viewer'}</span>
              </button>
            )}

            {/* Open in new tab */}
            <a
              href={absoluteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="canvas-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 11px',
                fontSize: '0.76rem',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                color: '#0055A5',
                border: '1px solid #BFDBFE',
                borderRadius: '4px',
                textDecoration: 'none',
              }}
              title="Open document in a dedicated browser tab"
            >
              <ExternalLink size={13} />
              <span>Open in Tab</span>
            </a>

            {/* Download */}
            <a
              href={absoluteUrl}
              download={`${(title || 'document').replace(/[^a-zA-Z0-9_\-\s]/g, '')}.pdf`}
              onClick={handleDownload}
              className="canvas-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '4px',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              title="Download PDF document file"
            >
              <Download size={13} />
              <span>Download</span>
            </a>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="canvas-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                backgroundColor: isFullscreen ? '#E2E8F0' : '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title={isFullscreen ? 'Exit full screen' : 'Expand to full screen'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* PDF Viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          flex: isFullscreen ? 1 : 'none',
          height: isFullscreen ? 'calc(100vh - 52px)' : heightValue,
          maxHeight: isFullscreen ? 'none' : maxHeight,
          backgroundColor: '#525659',
          overflow: 'hidden',
        }}
      >
        {loadError ? (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              backgroundColor: '#FEF2F2',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <AlertCircle size={36} color="#DC2626" />
            <div>
              <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#991B1B' }}>
                Unable to render PDF inline
              </div>
              <div style={{ fontSize: '0.82rem', color: '#7F1D1D', marginTop: '4px', maxWidth: '420px' }}>
                Your browser plugin or connection could not load the PDF preview. You can view it in a new tab or download the file directly.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setUseGoogleViewerFallback(true);
                  setLoadError(false);
                }}
                className="canvas-btn"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: '#0055A5',
                  color: '#FFFFFF',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Try Google Docs Viewer
              </button>
              <a
                href={absoluteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="canvas-btn"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  borderRadius: '4px',
                  border: '1px solid #CBD5E1',
                  textDecoration: 'none',
                }}
              >
                Open in Tab
              </a>
            </div>
          </div>
        ) : (
          <object
            data={embedSource}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ display: 'block', width: '100%', height: '100%', border: 'none' }}
          >
            {/* Fallback iframe for browsers where object tag doesn't activate PDF handler */}
            <iframe
              src={embedSource}
              title={title}
              width="100%"
              height="100%"
              style={{ border: 'none', display: 'block', width: '100%', height: '100%' }}
              onError={() => setLoadError(true)}
            >
              {/* Nested fallback for older mobile devices with no PDF support */}
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  color: '#475569',
                }}
              >
                <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem' }}>
                  Your browser does not support embedded PDF viewing.
                </p>
                <a
                  href={absoluteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="canvas-btn canvas-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    color: '#FFFFFF',
                    backgroundColor: '#0055A5',
                    borderRadius: '4px',
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={14} />
                  <span>Open PDF Document</span>
                </a>
              </div>
            </iframe>
          </object>
        )}
      </div>
    </div>
  );

  // If in fullscreen mode, render within a fixed backdrop overlay
  if (isFullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', height: '100%' }}>{content}</div>
      </div>
    );
  }

  return content;
};
