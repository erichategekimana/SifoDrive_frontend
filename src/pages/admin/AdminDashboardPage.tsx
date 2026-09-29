import React from 'react';
import { Spinner } from '../../components/common/Spinner';
import {
  useAdminDashboardData,
  DashboardHeader,
  TrainingAdminView,
  SystemAdminView,
} from '../../features/dashboard';

export const AdminDashboardPage: React.FC = () => {
  const {
    isTrainingAdmin,
    isLoading,
    stats,
    bookings,
    liveClasses,
    courses,
    cohorts,
    loadDashboardData,
  } = useAdminDashboardData();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DashboardHeader
        isTrainingAdmin={isTrainingAdmin}
        isLoading={isLoading}
        onRefresh={loadDashboardData}
      />

      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Spinner message="Loading..." />
        </div>
      ) : isTrainingAdmin ? (
        <TrainingAdminView
          stats={stats}
          courses={courses}
          cohorts={cohorts}
          liveClasses={liveClasses}
        />
      ) : (
        <SystemAdminView
          stats={stats}
          liveClasses={liveClasses}
          bookings={bookings}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
