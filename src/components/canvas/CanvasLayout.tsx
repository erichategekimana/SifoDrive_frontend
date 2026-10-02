import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  HelpCircle,
  Car,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/I18nContext';
import { CanvasChildSidebar, type ChildSidebarItem } from './CanvasChildSidebar';
import { CanvasTopBar } from './CanvasTopBar';
import { ConsentModal } from '../legal/ConsentModal';

import { LmsService } from '../../core/services/LmsService';

export const CanvasLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isDark = theme === 'dark';
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.profilePhoto]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Child-sidebar drawer state
  const [activeDrawer, setActiveDrawer] = useState<'courses' | 'groups' | null>(null);

  const isGuest = user?.role === 'GUEST';

  // Real published course items loaded dynamically from database
  const [coursesList, setCoursesList] = useState<ChildSidebarItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchDrawerCourses = async () => {
      try {
        const courses = await LmsService.getInstance().getCourses();
        if (!isMounted) return;
        setCoursesList(
          courses.map((c) => ({
            id: c.id,
            code: c.code || 'THEORY',
            title: c.title,
            subtitle: c.curriculumTitle || c.description,
            progress: c.progressPercentage || 0,
            badge: c.modulesCount > 0 ? `${c.modulesCount} Modules` : undefined,
            path: `/courses/${c.id}`,
          }))
        );
      } catch (err) {
        console.error('Failed to load drawer courses from DB:', err);
      }
    };
    fetchDrawerCourses();
    return () => {
      isMounted = false;
    };
  }, []);


  // Sample groups for child-sidebar
  const groupsList: ChildSidebarItem[] = [
    {
      id: 'grp-001',
      code: 'KGL-A',
      title: 'Kigali Cohort Alpha 2026',
      subtitle: 'Mwarimu: Claude Kamanzi | 42 Abanyeshuri',
      badge: 'Active Meet',
      path: '/groups/grp-001',
    },
    {
      id: 'grp-002',
      code: 'STUDY-B',
      title: 'Amatsinda yo Kwimenyereza (Mock Team)',
      subtitle: 'Abanyeshuri 18 | Daily 19:00',
      badge: 'Study Group',
      path: '/groups/grp-002',
    },
    {
      id: 'grp-003',
      code: 'WKD-INT',
      title: 'Weekend Intensive Study Cohort',
      subtitle: 'Abanyeshuri 30 | Kuwa Gatandatu 09:00',
      badge: 'Weekend',
      path: '/groups/grp-003',
    },
  ];

  // Base 3 tabs for Guest; Full 6 tabs for Student & Tutor
  const tabs = [
    {
      id: 'account',
      label: t('canvas.account'),
      icon: <UserIcon size={26} className="rail-icon" />,
      path: '/account',
      hasDrawer: false,
    },
    {
      id: 'dashboard',
      label: t('canvas.dashboard'),
      icon: <LayoutDashboard size={26} className="rail-icon" />,
      path: '/dashboard',
      hasDrawer: false,
    },
    {
      id: 'courses',
      label: t('canvas.courses'),
      icon: <BookOpen size={26} className="rail-icon" />,
      path: '/courses',
      hasDrawer: true,
      drawerType: 'courses' as const,
    },
    // The following 3 tabs are ONLY visible to Students & Tutors (never visible to Guest)
    ...(!isGuest
      ? [
          {
            id: 'groups',
            label: t('canvas.groups'),
            icon: <Users size={26} className="rail-icon" />,
            path: '/groups',
            hasDrawer: true,
            drawerType: 'groups' as const,
          },
          {
            id: 'calendar',
            label: t('canvas.calendar'),
            icon: <Calendar size={26} className="rail-icon" />,
            path: '/calendar',
            hasDrawer: false,
          },
          {
            id: 'help',
            label: t('canvas.help'),
            icon: (
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <HelpCircle size={26} className="rail-icon" />
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: '#FFFFFF',
                    color: '#0055A5',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  1
                </span>
              </div>
            ),
            path: '/help',
            hasDrawer: false,
          },
        ]
      : []),
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.hasDrawer && tab.drawerType) {
      if (activeDrawer === tab.drawerType) {
        setActiveDrawer(null);
      } else {
        setActiveDrawer(tab.drawerType);
      }
    } else {
      setActiveDrawer(null);
      navigate(tab.path);
    }
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/account')) {
      return [{ label: t('canvas.account'), href: '/account' }];
    }
    if (path.startsWith('/courses')) {
      const courseId = path.split('/courses/')[1];
      const matchedCourse = coursesList.find((c) => c.id === courseId);
      return [
        { label: t('canvas.courses'), href: '/courses' },
        ...(matchedCourse ? [{ label: matchedCourse.title }] : []),
      ];
    }
    if (path.startsWith('/groups')) {
      return [
        { label: t('canvas.groups'), href: '/groups' },
        ...(path !== '/groups' ? [{ label: 'Kigali Cohort Alpha' }] : []),
      ];
    }
    if (path.startsWith('/calendar')) {
      return [{ label: t('canvas.calendar'), href: '/calendar' }];
    }
    if (path.startsWith('/help')) {
      return [{ label: t('canvas.help'), href: '/help' }];
    }
    return [{ label: t('canvas.dashboard'), href: '/dashboard' }];
  };

  return (
    <div className="canvas-root" style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <ConsentModal />

      {/* 1. Leftmost Canvas Blue Rail (86px) */}
      <nav className="canvas-primary-rail" aria-label="Main Navigation">
        {/* Brand Emblem: Canvas ALU-style red rectangle on blue background */}
        <div
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '12px 0 12px 0',
            width: '100%',
            borderBottom: '1px solid rgba(255,255,255,0.18)',
            marginBottom: '6px',
          }}
          title="Sifo Drive Home"
        >
          <div
            style={{
              width: '54px',
              height: '42px',
              backgroundColor: '#D9381E',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '2px',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '0.92rem',
              letterSpacing: '0.04em',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', lineHeight: 1 }}>
              <Car size={16} strokeWidth={2.5} />
              <span>SIFO</span>
            </div>
          </div>
        </div>

        {/* Tab Icons with labels directly beneath icons */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '2px' }}>
          {tabs.map((tab) => {
            const isTabActive =
              activeDrawer === tab.id ||
              (!activeDrawer && location.pathname.startsWith(tab.path));

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`canvas-rail-tab ${isTabActive ? 'active' : ''}`}
                title={tab.label}
              >
                {tab.id === 'account' ? (
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      border: isTabActive ? (isDark ? '2px solid #38BDF8' : '2px solid #0055A5') : '2px solid #FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isTabActive ? (isDark ? '#1E293B' : '#FFFFFF') : 'rgba(255,255,255,0.12)',
                      color: isTabActive ? (isDark ? '#38BDF8' : '#0055A5') : '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      marginBottom: '5px',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {user?.profilePhoto && !avatarError ? (
                      <img
                        src={user.profilePhoto}
                        alt={user.fullName || 'Account'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onError={() => setAvatarError(true)}
                      />
                    ) : user?.fullName ? (
                      user.fullName.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon size={19} />
                    )}
                  </div>
                ) : (
                  tab.icon
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom indicator for Guest / Student status & Logout Button */}
        <div
          style={{
            marginTop: 'auto',
            textAlign: 'center',
            padding: '12px 4px 14px 4px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* Compact Role Tag — fits comfortably within 86px sidebar across EN & RW */}
          <div
            style={{
              width: '100%',
              maxWidth: '74px',
              padding: '2px 4px',
              borderRadius: '2px',
              backgroundColor: isGuest ? 'rgba(252, 211, 77, 0.22)' : 'rgba(191, 219, 254, 0.22)',
              border: isGuest ? '1px solid rgba(252, 211, 77, 0.45)' : '1px solid rgba(191, 219, 254, 0.45)',
              marginBottom: '6px',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: isGuest ? '#FDE68A' : '#DBEAFE',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.25,
              }}
              title={isGuest ? t('canvas.guestRole') : user?.isTutor() ? t('canvas.tutorRole') : t('canvas.studentRole')}
            >
              {isGuest ? t('canvas.guestRole') : user?.isTutor() ? t('canvas.tutorRole') : t('canvas.studentRole')}
            </span>
          </div>

          {/* Working Canvas Logout Button */}
          <button
            onClick={handleLogout}
            className="canvas-rail-tab"
            style={{
              padding: '6px 4px 8px 4px',
              width: '100%',
              borderRadius: '0px',
            }}
            title={t('canvas.logout')}
            aria-label={t('canvas.logout')}
          >
            <LogOut size={22} className="rail-icon" style={{ marginBottom: '3px' }} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>{t('canvas.logout')}</span>
          </button>
        </div>
      </nav>

      {/* 2. Slide-out Child-Sidebar (Drawer) for Courses or Groups */}
      {activeDrawer === 'courses' && (
        <CanvasChildSidebar
          type="courses"
          onClose={() => setActiveDrawer(null)}
          items={coursesList}
        />
      )}

      {activeDrawer === 'groups' && !isGuest && (
        <CanvasChildSidebar
          type="groups"
          onClose={() => setActiveDrawer(null)}
          items={groupsList}
        />
      )}

      {/* 3. Main Canvas Content Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        <CanvasTopBar breadcrumbs={getBreadcrumbs()} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: 'var(--canvas-bg-root)',
            padding: location.pathname.startsWith('/account') ? 0 : '28px 36px',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
