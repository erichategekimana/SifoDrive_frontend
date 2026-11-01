import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { SystemAdminRoute } from './SystemAdminRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { AdminLayout } from '../components/admin/AdminLayout';
import { PublicRouteGuard } from './PublicRouteGuard';
import { RouteLoadingFallback } from '../components/common/RouteLoadingFallback';
import { lazyLoad } from './lazyLoad';

// ── Public & Marketing Pages (Loaded on demand) ──
const LandingPage = lazyLoad(() => import('../pages/public/LandingPage'), 'LandingPage');
const LoginPage = lazyLoad(() => import('../pages/public/LoginPage'), 'LoginPage');
const RegisterPage = lazyLoad(() => import('../pages/public/RegisterPage'), 'RegisterPage');
const ServiceConciergePage = lazyLoad(() => import('../pages/public/ServiceConciergePage'), 'ServiceConciergePage');
const SchoolProgramPage = lazyLoad(() => import('../pages/public/SchoolProgramPage'), 'SchoolProgramPage');
const NewsroomPage = lazyLoad(() => import('../pages/public/NewsroomPage'), 'NewsroomPage');
const PartnerWithUsPage = lazyLoad(() => import('../pages/public/PartnerWithUsPage'), 'PartnerWithUsPage');
const ContactPage = lazyLoad(() => import('../pages/public/ContactPage'), 'ContactPage');
const CertificateVerificationPage = lazyLoad(() => import('../pages/public/CertificateVerificationPage'), 'CertificateVerificationPage');
const PricingPage = lazyLoad(() => import('../pages/public/PricingPage'), 'PricingPage');
const StartExamPage = lazyLoad(() => import('../pages/public/StartExamPage'), 'StartExamPage');
const RoadSignsPage = lazyLoad(() => import('../pages/lms/RoadSignsPage'), 'RoadSignsPage');
const CandidateExamPage = lazyLoad(() => import('../pages/examinations/CandidateExamPage'), 'CandidateExamPage');
const ExamReviewPage = lazyLoad(() => import('../pages/examinations/ExamReviewPage'), 'ExamReviewPage');

// ── Protected Learner & Role Consoles (Loaded on demand) ──
const DashboardDispatcher = lazyLoad(() => import('../pages/dashboard/DashboardDispatcher'), 'DashboardDispatcher');
const TutorStudioPage = lazyLoad(() => import('../pages/dashboard/TutorStudioPage'), 'TutorStudioPage');
const EnterpriseDashboard = lazyLoad(() => import('../pages/dashboard/EnterpriseDashboard'), 'EnterpriseDashboard');
const BoardReviewerDashboard = lazyLoad(() => import('../pages/dashboard/BoardReviewerDashboard'), 'BoardReviewerDashboard');
const AgentDashboard = lazyLoad(() => import('../pages/dashboard/AgentDashboard'), 'AgentDashboard');
const LessonViewPage = lazyLoad(() => import('../pages/lms/LessonViewPage'), 'LessonViewPage');
const StudentQuizPage = lazyLoad(() => import('../pages/lms/StudentQuizPage'), 'StudentQuizPage');
const StudentQuizReviewPage = lazyLoad(() => import('../pages/lms/StudentQuizReviewPage'), 'StudentQuizReviewPage');
const LiveClassesPage = lazyLoad(() => import('../pages/live-classes/LiveClassesPage'), 'LiveClassesPage');
const BookingWizardPage = lazyLoad(() => import('../pages/booking/BookingWizardPage'), 'BookingWizardPage');
const MyBookingsPage = lazyLoad(() => import('../pages/booking/MyBookingsPage'), 'MyBookingsPage');
const AccountView = lazyLoad(() => import('../pages/canvas/AccountView'), 'AccountView');
const CoursesView = lazyLoad(() => import('../pages/canvas/CoursesView'), 'CoursesView');
const GroupsView = lazyLoad(() => import('../pages/canvas/GroupsView'), 'GroupsView');
const CalendarView = lazyLoad(() => import('../pages/canvas/CalendarView'), 'CalendarView');
const HelpView = lazyLoad(() => import('../pages/canvas/HelpView'), 'HelpView');
const AnnouncementsView = lazyLoad(() => import('../pages/canvas/AnnouncementsView'), 'AnnouncementsView');

// ── Admin Suite Pages (Isolated from public bundle) ──
const AdminDashboardPage = lazyLoad(() => import('../pages/admin/AdminDashboardPage'), 'AdminDashboardPage');
const AdminUsersPage = lazyLoad(() => import('../pages/admin/AdminUsersPage'), 'AdminUsersPage');
const AdminCoursesPage = lazyLoad(() => import('../pages/admin/AdminCoursesPage'), 'AdminCoursesPage');
const AdminBookingsPage = lazyLoad(() => import('../pages/admin/AdminBookingsPage'), 'AdminBookingsPage');
const AdminLiveClassesPage = lazyLoad(() => import('../pages/admin/AdminLiveClassesPage'), 'AdminLiveClassesPage');
const AdminSchedulesPage = lazyLoad(() => import('../pages/admin/AdminSchedulesPage'), 'AdminSchedulesPage');
const AdminNotificationsPage = lazyLoad(() => import('../pages/admin/AdminNotificationsPage'), 'AdminNotificationsPage');
const AdminAuditPage = lazyLoad(() => import('../pages/admin/AdminAuditPage'), 'AdminAuditPage');
const AdminExaminationsPage = lazyLoad(() => import('../pages/admin/AdminExaminationsPage'), 'AdminExaminationsPage');
const AdminAnalyticsPage = lazyLoad(() => import('../pages/admin/AdminAnalyticsPage'), 'AdminAnalyticsPage');
const AdminSettingsPage = lazyLoad(() => import('../pages/admin/AdminSettingsPage'), 'AdminSettingsPage');
const AdminAgentsStaffPage = lazyLoad(() => import('../pages/admin/AdminAgentsStaffPage'), 'AdminAgentsStaffPage');
const AdminTicketsPage = lazyLoad(() => import('../pages/admin/AdminTicketsPage'), 'AdminTicketsPage');
const AdminQuizBankPage = lazyLoad(() => import('../pages/admin/AdminQuizBankPage'), 'AdminQuizBankPage');
const AdminQuizBuilderPage = lazyLoad(() => import('../pages/admin/quiz-bank/AdminQuizBuilderPage'), 'AdminQuizBuilderPage');
const BroadcastStudioPage = lazyLoad(() => import('../pages/admin/BroadcastStudioPage'), 'BroadcastStudioPage');
const ExamAuditDetailPage = lazyLoad(() => import('../pages/admin/examinations/ExamAuditDetailPage'), 'ExamAuditDetailPage');

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Pages */}
        <Route
          path="/"
          element={
            <PublicRouteGuard tabId="home">
              <LandingPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/services"
          element={
            <PublicRouteGuard tabId="service_concierge">
              <ServiceConciergePage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/concierge"
          element={
            <PublicRouteGuard tabId="service_concierge">
              <ServiceConciergePage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/school-program"
          element={
            <PublicRouteGuard tabId="school_program">
              <SchoolProgramPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/newsroom"
          element={
            <PublicRouteGuard tabId="newsroom">
              <NewsroomPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/news"
          element={
            <PublicRouteGuard tabId="newsroom">
              <NewsroomPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/partner"
          element={
            <PublicRouteGuard tabId="partner">
              <PartnerWithUsPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/partners"
          element={
            <PublicRouteGuard tabId="partner">
              <PartnerWithUsPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/partner-with-us"
          element={
            <PublicRouteGuard tabId="partner">
              <PartnerWithUsPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicRouteGuard tabId="contact">
              <ContactPage />
            </PublicRouteGuard>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/buy-exams" element={<PricingPage />} />
        <Route path="/practice-exams" element={<StartExamPage />} />
        <Route path="/start-exam" element={<StartExamPage />} />
        <Route path="/examinations/start" element={<StartExamPage />} />
        <Route path="/road-signs" element={<RoadSignsPage />} />
        <Route path="/verify/certificate/:hashOrCode" element={<CertificateVerificationPage />} />
        <Route path="/examinations/session/:sessionId" element={<CandidateExamPage />} />
        <Route path="/examinations/review/:sessionId" element={<ExamReviewPage />} />

        {/* Protected Learner, Student & Role Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardDispatcher />} />
            <Route path="/account" element={<AccountView />} />
            <Route path="/courses" element={<CoursesView />} />
            <Route path="/courses/:id" element={<CoursesView />} />
            <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonViewPage />} />
            <Route path="/lesson/:id" element={<LessonViewPage />} />
            <Route path="/groups" element={<GroupsView />} />
            <Route path="/groups/:id" element={<GroupsView />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/announcements" element={<AnnouncementsView />} />
            <Route path="/help" element={<HelpView />} />
            <Route path="/tutor" element={<TutorStudioPage />} />
            <Route path="/enterprise" element={<EnterpriseDashboard />} />
            <Route path="/board-reviewer" element={<BoardReviewerDashboard />} />
            <Route path="/agent" element={<AgentDashboard />} />
            <Route path="/live-classes" element={<LiveClassesPage />} />
            <Route path="/booking" element={<BookingWizardPage />} />
            <Route path="/booking/my-bookings" element={<MyBookingsPage />} />
            <Route path="/profile" element={<AccountView />} />
            {/* Assessment Review & Grade Detail Pages */}
            <Route path="/courses/:courseId/quiz/:quizId/review" element={<StudentQuizReviewPage />} />
            <Route path="/quiz/:quizId/review" element={<StudentQuizReviewPage />} />
            <Route path="/courses/:courseId/activity/:activityId/review" element={<StudentQuizReviewPage />} />
            <Route path="/activity/:activityId/review" element={<StudentQuizReviewPage />} />
          </Route>
          {/* Full-screen distraction-free Quiz Player */}
          <Route path="/quiz/:quizId" element={<StudentQuizPage />} />
          <Route path="/courses/:courseId/quiz/:quizId" element={<StudentQuizPage />} />

          {/* Full-screen Proctored Official Examination Runner */}
          <Route path="/examinations/take/:examId" element={<CandidateExamPage />} />
        </Route>

        {/* Exclusively Protected System Admin Routes */}
        <Route element={<SystemAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/broadcast-studio" element={<BroadcastStudioPage />} />
            <Route path="/admin/broadcasts" element={<BroadcastStudioPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/quizzes" element={<AdminQuizBankPage />} />
            <Route path="/admin/quizzes/create" element={<AdminQuizBuilderPage />} />
            <Route path="/admin/quizzes/:id/edit" element={<AdminQuizBuilderPage />} />
            <Route path="/admin/examinations" element={<AdminExaminationsPage />} />
            <Route path="/admin/examinations/audit/:idOrType" element={<ExamAuditDetailPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/schedules" element={<AdminSchedulesPage />} />
            <Route path="/admin/live-classes" element={<AdminLiveClassesPage />} />
            <Route path="/admin/classes" element={<AdminLiveClassesPage />} />
            <Route path="/admin/sms" element={<AdminNotificationsPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
            <Route path="/admin/agents-staff" element={<AdminAgentsStaffPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
