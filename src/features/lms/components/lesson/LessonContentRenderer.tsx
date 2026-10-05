import React, { useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, FileText, Maximize2, Minimize2 } from 'lucide-react';
import type { LessonContentItem } from '../../../../core/models/Lesson';

/* ------------------------------------------------------------------ */
/* URL helpers: normalise whatever link the training admin pasted     */
/* ------------------------------------------------------------------ */

/** YouTube watch / short / youtu.be links -> embed URL */
export const toYouTubeEmbed = (url: string): string | null => {
  const m =
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/[?&]v=([\w-]{6,})/) ||
    url.match(/youtube\.com\/(?:embed|shorts|live)\/([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

/** Google Slides (edit/view/pub/present) -> embeddable URL */
export const toGoogleSlidesEmbed = (url: string): string | null => {
  if (!/docs\.google\.com\/presentation/.test(url)) return null;
  // Keep the slide anchor (#slide=id.xxx) so the deck opens on the intended slide
  const slideAnchor = url.match(/#slide=([\w.-]+)/);
  const slideParam = slideAnchor ? `&slide=${slideAnchor[1]}` : '';
  const params = `start=false&loop=false&delayms=60000${slideParam}`;
  // Published decks: /d/e/<pubId>/pub|embed
  const pub = url.match(/\/presentation\/d\/e\/([\w-]+)/);
  if (pub) return `https://docs.google.com/presentation/d/e/${pub[1]}/embed?${params}`;
  // Regular share links: /d/<id>/edit|view|present|preview
  const id = url.match(/\/presentation\/(?:u\/\d+\/)?d\/([\w-]{20,})/);
  return id ? `https://docs.google.com/presentation/d/${id[1]}/embed?${params}` : null;
};

const isGoogleSlidesUrl = (url: string) => /docs\.google\.com\/presentation/.test(url);

/** Canva design links (/design/<id>/<token>/view|edit) -> ?embed URL */
export const toCanvaEmbed = (url: string): string | null => {
  if (!url.includes('canva.com') && !url.includes('canva.link')) return null;
  const m = url.match(/canva\.com\/design\/([\w-]+)\/([\w-]+)/);
  if (m) return `https://www.canva.com/design/${m[1]}/${m[2]}/view?embed`;
  return url.includes('embed') ? url : `${url.split('#')[0]}${url.includes('?') ? '&' : '?'}embed`;
};

const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(url);

/* ------------------------------------------------------------------ */
/* Shared neutral building blocks                                     */
/* ------------------------------------------------------------------ */

const NEUTRAL_BORDER = '1px solid #E2E8F0';
/** Compact width for slide decks so surrounding lesson content stays in view */
const SLIDES_MAX_WIDTH = '640px';

/** 16:9 responsive lazy iframe with a neutral loading placeholder */
const EmbedFrame: React.FC<{ src: string; title: string; allow?: string }> = ({ src, title, allow }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        borderRadius: '6px',
        overflow: 'hidden',
        border: NEUTRAL_BORDER,
        backgroundColor: '#F8FAFC',
      }}
    >
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94A3B8',
            fontSize: '0.85rem',
          }}
        >
          Loading…
        </div>
      )}
      <iframe
        title={title}
        src={src}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        allow={allow || 'fullscreen; autoplay; encrypted-media; picture-in-picture'}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
};

/**
 * Google Slides viewer — main classroom material.
 * - Sized 16:9 for slides + 29px for Google's built-in control bar (no clipping/letterboxing)
 * - Fullscreen button for presenting in class (keyboard arrows work inside the deck)
 * - Eager load (it is the primary content), with a neutral placeholder
 */
const GoogleSlidesViewer: React.FC<{ src: string; original: string; title: string }> = ({ src, original, title }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFs(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen?.();
  };

  const btn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569',
    background: '#FFFFFF', border: NEUTRAL_BORDER, borderRadius: '4px', padding: '5px 10px',
    cursor: 'pointer', textDecoration: 'none',
  };

  return (
    <div style={{ width: '100%', maxWidth: SLIDES_MAX_WIDTH }}>
      <div
        ref={wrapRef}
        style={{
          position: 'relative',
          width: '100%',
          // 16:9 slide area + Google's 29px toolbar; fills screen in fullscreen
          height: isFs ? '100vh' : undefined,
          paddingTop: isFs ? undefined : 'calc(56.25% + 29px)',
          borderRadius: isFs ? 0 : '6px',
          overflow: 'hidden',
          border: isFs ? 'none' : NEUTRAL_BORDER,
          backgroundColor: isFs ? '#000' : '#F8FAFC',
        }}
      >
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
            Loading slides…
          </div>
        )}
        <iframe
          title={title}
          src={src}
          onLoad={() => setLoaded(true)}
          allow="fullscreen; autoplay"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
        />
        {isFs && (
          <button onClick={toggleFullscreen} style={{ ...btn, position: 'absolute', top: 12, right: 12, opacity: 0.85 }}>
            <Minimize2 size={14} /> Exit
          </button>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
          Not loading? The deck must be shared as “Anyone with the link can view”.
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={toggleFullscreen} style={btn}>
            <Maximize2 size={14} /> Fullscreen
          </button>
          <a href={original} target="_blank" rel="noreferrer" style={btn}>
            <ExternalLink size={14} /> Open in Google Slides
          </a>
        </div>
      </div>
    </div>
  );
};

const OpenOriginalLink: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', textDecoration: 'none' }}
    >
      <ExternalLink size={13} />
      <span>{label}</span>
    </a>
  </div>
);

const DownloadRow: React.FC<{ title: string; subtitle: string; href?: string | null }> = ({ title, subtitle, href }) => (
  <div
    style={{
      padding: '14px 16px',
      borderRadius: '6px',
      border: NEUTRAL_BORDER,
      backgroundColor: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <FileText size={22} color="#64748B" />
      <div>
        <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.92rem' }}>{title}</div>
        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{subtitle}</div>
      </div>
    </div>
    {href && (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        download
        className="canvas-btn canvas-btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 14px', textDecoration: 'none' }}
      >
        <Download size={14} />
        <span>Download</span>
      </a>
    )}
  </div>
);

const RichText: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ fontSize: '1rem', lineHeight: 1.75, color: '#1E293B', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {text.split('\n\n').map((p, i) => {
      if (p.startsWith('### ')) {
        return <h4 key={i} style={{ fontSize: '1.1rem', margin: '6px 0 0 0', color: '#1E293B' }}>{p.replace('### ', '')}</h4>;
      }
      if (p.startsWith('* ') || p.startsWith('1. ')) {
        return (
          <div key={i} style={{ paddingLeft: '14px', borderLeft: '2px solid #E2E8F0' }}>
            {p.split('\n').map((line, li) => <div key={li} style={{ marginBottom: '4px' }}>{line}</div>)}
          </div>
        );
      }
      return <p key={i} style={{ margin: 0, whiteSpace: 'pre-line' }}>{p}</p>;
    })}
  </div>
);

/* ------------------------------------------------------------------ */
/* Single content item                                                */
/* ------------------------------------------------------------------ */

const ContentBody: React.FC<{ item: LessonContentItem }> = ({ item }) => {
  const url = item.mediaUrl || item.mediaFile || '';

  // Google Slides is the primary classroom material: render it no matter which content type it was saved under
  if (url && isGoogleSlidesUrl(url)) {
    const embed = toGoogleSlidesEmbed(url);
    if (embed) return <GoogleSlidesViewer src={embed} original={url} title={item.title || 'Google Slides'} />;
  }

  switch (item.contentType) {
    case 'TEXT':
      return item.contentText ? <RichText text={item.contentText} /> : null;

    case 'AUDIO':
      return url ? <audio controls preload="metadata" style={{ width: '100%' }} src={url} /> : null;

    case 'VIDEO': {
      if (!url) return null;
      const yt = toYouTubeEmbed(url);
      return yt ? (
        <EmbedFrame src={yt} title={item.title} />
      ) : (
        <video controls preload="metadata" style={{ width: '100%', maxHeight: '480px', borderRadius: '6px', backgroundColor: '#000' }} src={url} />
      );
    }

    case 'IMAGE':
      return url ? (
        <figure style={{ margin: 0, textAlign: 'center' }}>
          <img
            src={url}
            alt={item.title || 'Lesson image'}
            loading="lazy"
            decoding="async"
            style={{ maxWidth: '100%', maxHeight: '560px', objectFit: 'contain', borderRadius: '6px', border: NEUTRAL_BORDER }}
          />
          {item.contentText && (
            <figcaption style={{ marginTop: '8px', fontSize: '0.84rem', color: '#64748B' }}>{item.contentText}</figcaption>
          )}
        </figure>
      ) : null;

    case 'DOCUMENT': {
      // PDF & PowerPoint: download only
      if (item.documentType === 'PDF') {
        return <DownloadRow title={item.title || 'PDF document'} subtitle="PDF · download to view" href={url || null} />;
      }
      if (item.documentType === 'POWERPOINT') {
        return <DownloadRow title={item.title || 'PowerPoint slides'} subtitle="PowerPoint · download to view" href={url || null} />;
      }

      if (!url) return null;

      // Canva
      const canva = item.documentType === 'CANVA' || url.includes('canva.') ? toCanvaEmbed(url) : null;
      if (canva) {
        return (
          <div style={{ width: '100%', maxWidth: SLIDES_MAX_WIDTH }}>
            <EmbedFrame src={canva} title={item.title || 'Canva presentation'} />
            <OpenOriginalLink href={url} label="Open in Canva" />
          </div>
        );
      }

      // Image accidentally attached as a document
      if (isImageUrl(url)) {
        return (
          <img src={url} alt={item.title} loading="lazy" decoding="async" style={{ maxWidth: '100%', borderRadius: '6px', border: NEUTRAL_BORDER }} />
        );
      }

      // Anything else: plain link / download
      return <DownloadRow title={item.title || 'Document'} subtitle="Attached file" href={url} />;
    }

    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/* Public renderer                                                    */
/* ------------------------------------------------------------------ */

export const LessonContentRenderer: React.FC<{ contents: LessonContentItem[] }> = ({ contents }) => {
  const sorted = [...contents].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {sorted.map((item, idx) => (
        <section
          key={item.id || idx}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '24px', borderBottom: idx < sorted.length - 1 ? NEUTRAL_BORDER : 'none' }}
        >
          {item.title && (
            <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: '#1E293B' }}>
              <span style={{ color: '#64748B', fontWeight: 600, marginRight: '8px' }}>{idx + 1}.</span>
              {item.title}
            </h3>
          )}
          <ContentBody item={item} />
        </section>
      ))}
    </div>
  );
};
