import { useState, useEffect, useCallback } from 'react';
import {
  AdminService,
  type AdminDashboardStats,
  type BookingOrderItem,
  type LiveClassAdminItem,
  type CohortItem,
} from '../../../core/services/AdminService';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../context/I18nContext';

export const useAdminDashboardData = () => {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const isTrainingAdmin = user?.isTrainingAdmin();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<AdminDashboardStats>({
    total_registered_users: 0,
    total_booking_orders: 0,
    enrolled_students: 0,
    total_graduated_students: 0,
    lms_courses: 0,
  });
  const [bookings, setBookings] = useState<BookingOrderItem[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassAdminItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<CohortItem[]>([]);

  const adminService = AdminService.getInstance();

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, bookingsRes, classesRes, coursesRes, cohortsRes] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getBookingOrders(),
        adminService.getLiveClasses(),
        adminService.getCourses(),
        adminService.getCohorts(),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }

      if (bookingsRes.status === 'fulfilled') {
        setBookings(bookingsRes.value.results.slice(0, 5));
      }

      if (classesRes.status === 'fulfilled') {
        const relevant = classesRes.value
          .filter((c) => c.status === 'IN_PROGRESS' || c.status === 'SCHEDULED')
          .sort((a, b) => {
            if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
            if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;
            const timeA = new Date(a.scheduled_at || a.scheduled_date || '').getTime() || 0;
            const timeB = new Date(b.scheduled_at || b.scheduled_date || '').getTime() || 0;
            return timeA - timeB;
          });
        setLiveClasses(relevant.slice(0, 6));
      }

      if (coursesRes.status === 'fulfilled') {
        setCourses(coursesRes.value || []);
      }

      if (cohortsRes.status === 'fulfilled') {
        setCohorts(cohortsRes.value || []);
      }
    } catch (err) {
      console.error('Failed loading dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    user,
    t,
    language,
    isTrainingAdmin,
    isLoading,
    stats,
    bookings,
    liveClasses,
    courses,
    cohorts,
    loadDashboardData,
  };
};
