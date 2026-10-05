import React from 'react';
import {
  Home,
  Layers,
  FileText,
  Award,
  Bell,
  MessageSquare,
  Users,
  Video,
} from 'lucide-react';

export type CourseWorkspaceTab =
  | 'home'
  | 'modules'
  | 'assignments'
  | 'grades'
  | 'announcements'
  | 'discussions'
  | 'people'
  | 'live';

export interface CourseSecondaryNavProps {
  activeTab: CourseWorkspaceTab;
  onTabChange: (tab: CourseWorkspaceTab) => void;
  gradesCount?: number;
  announcementsCount?: number;
  termLabel?: string;
  isCollapsed?: boolean;
  isTutor?: boolean;
}

export const CourseSecondaryNav: React.FC<CourseSecondaryNavProps> = ({
  activeTab,
  onTabChange,
  gradesCount = 7,
  announcementsCount = 3,
  termLabel = '2026 September Term (Sifo Drive)',
  isCollapsed = false,
  isTutor = false,
}) => {
  const allNavItems: { id: CourseWorkspaceTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home size={16} /> },
    { id: 'modules', label: 'Modules', icon: <Layers size={16} /> },
    { id: 'assignments', label: 'Assignments', icon: <FileText size={16} /> },
    { id: 'grades', label: 'Grades', icon: <Award size={16} />, badge: gradesCount },
    { id: 'announcements', label: 'Announcements', icon: <Bell size={16} />, badge: announcementsCount },
    { id: 'discussions', label: 'Discussions', icon: <MessageSquare size={16} /> },
    { id: 'people', label: 'People', icon: <Users size={16} /> },
    { id: 'live', label: 'Live Classes', icon: <Video size={16} /> },
  ];

  // Only students see Grades tab; tutors manage assignments & see student completions directly in Assignments
  const navItems = isTutor ? allNavItems.filter((item) => item.id !== 'grades') : allNavItems;

  if (isCollapsed) return null;

  return (
    <nav
      aria-label="Course navigation"
      style={{
        width: '190px',
        flexShrink: 0,
        paddingRight: '16px',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {/* Term Identifier Label matching Canvas */}
      <div
        style={{
          fontSize: '0.84rem',
          color: '#555555',
          padding: '0 8px 12px 8px',
          fontStyle: 'italic',
          lineHeight: 1.35,
          borderBottom: '1px solid #F3F4F6',
          marginBottom: '8px',
        }}
      >
        {termLabel}
      </div>

      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '2px',
              border: 'none',
              background: 'transparent',
              color: isActive ? '#000000' : '#0055A5',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.96rem',
              cursor: 'pointer',
              textAlign: 'left',
              borderLeft: isActive ? '3px solid #000000' : '3px solid transparent',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
                e.currentTarget.style.textDecoration = 'underline';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.textDecoration = 'none';
              }
            }}
          >
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span
                style={{
                  backgroundColor: '#002147',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  padding: '2px 7px',
                  minWidth: '18px',
                  textAlign: 'center',
                }}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
