import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';

// Protected Pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CourseListPage } from '../pages/lms/CourseListPage';
import { LessonViewPage } from '../pages/lms/LessonViewPage';
import { RoadSignsPage } from '../pages/lms/RoadSignsPage';
import { LiveClassesPage } from '../pages/live-classes/LiveClassesPage';
import { BookingWizardPage } from '../pages/booking/BookingWizardPage';
import { MyBookingsPage } from '../pages/booking/MyBookingsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';

// System Admin Pages & Guard
import { SystemAdminRoute } from './SystemAdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminCoursesPage } from '../pages/admin/AdminCoursesPage';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { AdminLiveClassesPage } from '../pages/admin/AdminLiveClassesPage';
import { AdminSchedulesPage } from '../pages/admin/AdminSchedulesPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';
import { AdminAuditPage } from '../pages/admin/AdminAuditPage';
import { AdminExaminationsPage } from '../pages/admin/AdminExaminationsPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { CertificateVerificationPage } from '../pages/public/CertificateVerificationPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/road-signs" element={<RoadSignsPage />} />
      <Route path="/courses" element={<CourseListPage />} />
      <Route path="/lesson/:id" element={<LessonViewPage />} />
      <Route path="/verify/certificate/:hashOrCode" element={<CertificateVerificationPage />} />

      {/* Protected Learner & Student Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/live-classes" element={<LiveClassesPage />} />
          <Route path="/booking" element={<BookingWizardPage />} />
          <Route path="/booking/my-bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Exclusively Protected System Admin Routes */}
      <Route element={<SystemAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route path="/admin/examinations" element={<AdminExaminationsPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/schedules" element={<AdminSchedulesPage />} />
          <Route path="/admin/live-classes" element={<AdminLiveClassesPage />} />
          <Route path="/admin/classes" element={<AdminLiveClassesPage />} />
          <Route path="/admin/sms" element={<AdminNotificationsPage />} />
          <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
