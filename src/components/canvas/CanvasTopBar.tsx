import React, { useState } from 'react';
import { Bell, Globe, ChevronRight } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CanvasTopBarProps {
  breadcrumbs?: BreadcrumbItem[];
}

export const CanvasTopBar: React.FC<CanvasTopBarProps> = ({ breadcrumbs = [] }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications for demonstration
  const notifications = [
    {
      id: 1,
      title: "Ikizamini cy'Igerageza giteganyijwe",
      desc: "Quiz 3 (Ibimenyetso by'Umuhanda) irashaje kuri uyu wa gatanu.",
      time: 'Minota 15 ishize',
      unread: true,
    },
    {
      id: 2,
      title: 'Ubutumwa bwa Mwarimu Kamanzi',
      desc: 'Yashubije ikibazo cyawe cyo muri ticket #TKT-001.',
      time: 'Amasaha 2 ashize',
      unread: true,
    },
  ];

  return (
    <header className="canvas-top-bar" style={{ position: 'relative' }}>
      {/* Left: Canvas Breadcrumbs on Blue Bar */}
      <nav className="canvas-breadcrumbs" aria-label="Breadcrumb">
        <span style={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.04em', fontSize: '0.96rem' }}>
          SIFO DRIVE
        </span>
        <ChevronRight size={15} className="separator" color="rgba(255,255,255,0.7)" />
        {breadcrumbs.length > 0 ? (
          breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.href && !isLast ? (
                  <a href={crumb.href}>{crumb.label}</a>
                ) : (
                  <span className={isLast ? 'current' : ''}>{crumb.label}</span>
                )}
                {!isLast && <ChevronRight size={15} className="separator" color="rgba(255,255,255,0.7)" />}
              </React.Fragment>
            );
          })
        ) : (
          <span className="current">{t('canvas.dashboard')}</span>
        )}
      </nav>

      {/* Right Controls: Notification Bell next to Language Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Notification Bell next to Language Toggle */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              padding: '5px 9px',
              position: 'relative',
              backgroundColor: showNotifications ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={t('canvas.notifications')}
            aria-label="Notifications"
          >
            <Bell size={18} color="#FFFFFF" />
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '9px',
                height: '9px',
                backgroundColor: '#D9381E',
                borderRadius: '50%',
                border: '1px solid #0055A5',
              }}
            />
          </button>

          {/* Notifications Dropdown Panel (Clean White Modal with Dark Text) */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '38px',
                width: '330px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D0D5DD',
                borderRadius: '2px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                zIndex: 100,
                color: '#2D3B45',
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid #EAEAEA',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <span style={{ color: '#0055A5' }}>{t('canvas.notifications')}</span>
                <span className="canvas-badge canvas-badge-open">{t('canvas.newNotifications')}</span>
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid #F0F0F0',
                      backgroundColor: n.unread ? '#F8FAFC' : '#FFFFFF',
                    }}
                  >
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0055A5', marginBottom: '3px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#555555', marginBottom: '4px', lineHeight: 1.35 }}>
                      {n.desc}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#888888' }}>{n.time}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '8px 14px', borderTop: '1px solid #EAEAEA', textAlign: 'center', backgroundColor: '#FAFAFA' }}>
                <button
                  onClick={() => setShowNotifications(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.78rem',
                    color: '#0055A5',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {t('canvas.close')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language Toggle: Kinyarwanda default / English */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '2px',
            padding: '3px',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <Globe size={15} color="rgba(255, 255, 255, 0.9)" style={{ marginLeft: '4px', marginRight: '3px' }} />
          <button
            onClick={() => setLanguage('rw')}
            style={{
              padding: '3px 9px',
              fontSize: '0.78rem',
              fontWeight: language === 'rw' ? 700 : 500,
              backgroundColor: language === 'rw' ? '#FFFFFF' : 'transparent',
              color: language === 'rw' ? '#0055A5' : '#FFFFFF',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            RW
          </button>
          <button
            onClick={() => setLanguage('en')}
            style={{
              padding: '3px 9px',
              fontSize: '0.78rem',
              fontWeight: language === 'en' ? 700 : 500,
              backgroundColor: language === 'en' ? '#FFFFFF' : 'transparent',
              color: language === 'en' ? '#0055A5' : '#FFFFFF',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            EN
          </button>
        </div>

        {/* User Mini Profile Avatar & Name in White */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingLeft: '12px',
              borderLeft: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#FFFFFF',
                color: '#0055A5',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.82rem',
              }}
            >
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.15 }}>
                {user.fullName || user.phoneNumber}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                {user.getRoleDisplay()}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
