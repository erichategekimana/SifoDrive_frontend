import type { HelpTicketDTO } from '../../../core/services/SupportTicketService';

export const getRoleBadge = (role?: string) => {
  const r = role ? role.toUpperCase() : 'STUDENT';
  let bgColor = '#DBEAFE';
  let textColor = '#1E40AF';
  let label = 'Student';

  switch (r) {
    case 'TUTOR':
      bgColor = '#D1FAE5';
      textColor = '#065F46';
      label = 'Tutor / Instructor';
      break;
    case 'TRAINING_ADMIN':
      bgColor = '#E0F2FE';
      textColor = '#0369A1';
      label = 'Training Admin';
      break;
    case 'BOARD_REVIEWER':
      bgColor = '#CCFBF1';
      textColor = '#115E59';
      label = 'Board Reviewer';
      break;
    case 'AGENT':
      bgColor = '#FFEDD5';
      textColor = '#9A3412';
      label = 'Agent / Field';
      break;
    case 'ENTERPRISE_ADMIN':
      bgColor = '#DCFCE7';
      textColor = '#166534';
      label = 'Enterprise Admin';
      break;
    case 'SYSTEM_ADMIN':
      bgColor = '#FEE2E2';
      textColor = '#991B1B';
      label = 'Super Admin';
      break;
    default:
      bgColor = '#DBEAFE';
      textColor = '#1E40AF';
      label = 'Student';
  }

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.72rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '4px',
        backgroundColor: bgColor,
        color: textColor,
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </span>
  );
};

export const getStatusBadge = (status: HelpTicketDTO['status']) => {
  switch (status) {
    case 'OPEN':
      return <span className="canvas-badge canvas-badge-open">Open</span>;
    case 'IN_PROGRESS':
      return <span className="canvas-badge canvas-badge-progress">In Progress</span>;
    case 'RESOLVED':
      return <span className="canvas-badge canvas-badge-resolved">Resolved</span>;
    case 'CLOSED':
      return <span className="canvas-badge canvas-badge-closed">Closed</span>;
    case 'REOPENED':
      return <span className="canvas-badge canvas-badge-reopened">Reopened</span>;
    default:
      return <span className="canvas-badge">{status}</span>;
  }
};

export const getPriorityBadge = (prio: HelpTicketDTO['priority']) => {
  switch (prio) {
    case 'URGENT':
      return <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 6px', borderRadius: '3px' }}>URGENT</span>;
    case 'HIGH':
      return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706', backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '3px' }}>HIGH</span>;
    case 'MEDIUM':
      return <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#2563EB', backgroundColor: '#DBEAFE', padding: '2px 6px', borderRadius: '3px' }}>MEDIUM</span>;
    default:
      return <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#6B7280', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '3px' }}>LOW</span>;
  }
};

export const getAnnouncementCategoryBadge = (cat?: string) => {
  switch (cat) {
    case 'PLATFORM_UPDATE':
      return <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '2px 6px', borderRadius: '3px' }}>Platform Update</span>;
    case 'HELP_SUPPORT':
      return <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '3px' }}>Help & Support Message</span>;
    case 'MAINTENANCE':
      return <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#FFE4E6', color: '#E11D48', padding: '2px 6px', borderRadius: '3px' }}>Maintenance Notice</span>;
    default:
      return <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '3px' }}>System Announcement</span>;
  }
};
