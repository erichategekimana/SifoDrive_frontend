import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { useTranslation } from '../../context/I18nContext';

export interface ChildSidebarItem {
  id: string;
  code?: string;
  title: string;
  subtitle?: string;
  progress?: number;
  badge?: string;
  path: string;
}

interface CanvasChildSidebarProps {
  type: 'courses' | 'groups';
  onClose: () => void;
  items: ChildSidebarItem[];
  selectedId?: string;
}

export const CanvasChildSidebar: React.FC<CanvasChildSidebarProps> = ({
  type,
  onClose,
  items,
  selectedId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const isCourses = type === 'courses';
  const drawerTitle = isCourses ? t('canvas.courses') : t('canvas.groups');

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (item: ChildSidebarItem) => {
    navigate(item.path);
    onClose();
  };

  return (
    <aside className="canvas-child-sidebar">
      {/* Header: Red Title + Boxed Square Close Button matching Canvas LMS */}
      <div
        className="canvas-child-sidebar-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 12px 20px',
          borderBottom: 'none',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#C82333',
            fontSize: '1.3rem',
            fontWeight: 700,
            letterSpacing: '0.01em',
          }}
        >
          {drawerTitle}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: '#FFFFFF',
            border: '1px solid #767676',
            borderRadius: '2px',
            cursor: 'pointer',
            padding: '2px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333333',
          }}
          title={t('canvas.close')}
          aria-label={t('canvas.close')}
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* "All Courses" / "All Groups" Link matching Canvas */}
      <div style={{ padding: '0 20px 10px 20px', borderBottom: '1px solid #E5E7EB' }}>
        <button
          onClick={() => {
            navigate(isCourses ? '/courses' : '/groups');
            onClose();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '4px 0',
            color: '#0055A5',
            fontSize: '0.92rem',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'block',
            width: '100%',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          {isCourses ? t('canvas.allCourses') : t('canvas.allGroups')}
        </button>
      </div>

      {/* Optional Search Input */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid #F0F0F0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid #D0D5DD',
            padding: '5px 8px',
            borderRadius: '2px',
          }}
        >
          <Search size={13} color="#888888" />
          <input
            type="text"
            placeholder={isCourses ? t('canvas.searchCourse') : t('canvas.searchGroup')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '0.8rem',
              width: '100%',
              color: '#2D3B45',
            }}
          />
        </div>
      </div>

      {/* Items List */}
      <ul className="canvas-child-list" style={{ flex: 1, padding: '4px 0' }}>
        {filteredItems.length === 0 ? (
          <li style={{ padding: '24px 20px', textAlign: 'center', color: '#888888', fontSize: '0.85rem' }}>
            {t('canvas.noResults')}
          </li>
        ) : (
          filteredItems.map((item) => {
            const isActive = selectedId === item.id || location.pathname === item.path;
            return (
              <li
                key={item.id}
                className={`canvas-child-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(item)}
                style={{ padding: '12px 20px', borderBottom: '1px solid #F3F4F6' }}
              >
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#0055A5',
                    marginBottom: '3px',
                    lineHeight: 1.3,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {item.title}
                </div>

                {item.subtitle && (
                  <div style={{ fontSize: '0.74rem', color: '#666666', lineHeight: 1.35 }}>
                    {item.subtitle}
                  </div>
                )}

                {item.code && (
                  <div style={{ fontSize: '0.7rem', color: '#888888', marginTop: '2px' }}>
                    SIS ID: {item.code}
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>

      {/* Canvas Authentic Guidance Footer matching Screenshot 2 */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          fontSize: '0.78rem',
          color: '#555555',
          lineHeight: 1.45,
        }}
      >
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#555555' }}>
          {t('canvas.welcomeCourseBlurb')}
        </p>
      </div>
    </aside>
  );
};
