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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
