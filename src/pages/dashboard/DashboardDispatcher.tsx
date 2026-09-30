import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StudentCanvasDashboard } from './StudentCanvasDashboard';
import { GuestDashboard } from './GuestDashboard';
import { TutorDashboard } from './TutorDashboard';
import { EnterpriseDashboard } from './EnterpriseDashboard';
import { BoardReviewerDashboard } from './BoardReviewerDashboard';
import { AgentDashboard } from './AgentDashboard';

export const DashboardDispatcher: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Administrators have their dedicated console
  if (user.isSystemAdmin() || user.isTrainingAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  // Dynamic dispatch based on verified platform role
  switch (user.role) {
    case 'STUDENT':
      return <StudentCanvasDashboard />;
    case 'GUEST':
      return <GuestDashboard />;
    case 'TUTOR':
      return <TutorDashboard />;
    case 'ENTERPRISE_ADMIN':
      return <EnterpriseDashboard />;
    case 'BOARD_REVIEWER':
      return <BoardReviewerDashboard />;
    case 'AGENT':
      return <AgentDashboard />;
    default:
      return <StudentCanvasDashboard />;
  }
};
