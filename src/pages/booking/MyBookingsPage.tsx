import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Clock, MapPin } from 'lucide-react';
import { BookingService } from '../../core/services/BookingService';
import { Booking } from '../../core/models/Booking';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/I18nContext';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();
  const { t } = useTranslation();

  const loadBookings = async () => {
    try {
      const list = await BookingService.getInstance().getMyBookings();
      if (list.length === 0) {
        // Fallback demo ticket
        setBookings([
          new Booking({
            id: 'bk-demo-1',
            ticket_number: 'TK-IREMBO-2026-B88',
            category: 'B',
            preferred_district: 'KICUKIRO',
            preferred_site: 'BUSANZA AUTOMATED CENTER',
            application_fee_rwf: 15000,
            status: 'PROCESSING',
            created_at: new Date().toISOString(),
          }),
        ]);
      } else {
        setBookings(list);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await BookingService.getInstance().cancelBooking(id);
      success(t('common.success'));
      loadBookings();
    } catch (err: any) {
      error(err.message || t('common.errorOccurred'));
    }
  };

  if (isLoading) {
    return <Spinner message={t('common.loading')} />;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Badge variant="info">{t('booking.badge')}</Badge>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('booking.myBookingsSub')}
            </span>
          </div>
          <h1>{t('booking.myBookings')}</h1>
        </div>

        <Link to="/booking" className="btn btn-primary">
          <Plus size={18} />
          <span>{t('booking.newBooking')}</span>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Calendar size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto' }} />
          <h3>{t('booking.noBookings')}</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
            {t('booking.subtitle')}
          </p>
          <Link to="/booking" className="btn btn-primary">
            {t('booking.applyNow')}
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map((booking) => {
            const badge = booking.getStatusBadge();

            return (
              <Card key={booking.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                        {booking.ticketNumber}
                      </span>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>

                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: '10px' }}>
                      {booking.getCategoryDisplay()}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} color="var(--primary)" />
                        <span>{booking.preferredDistrict} ({booking.preferredSite || 'Default Site'})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={16} color="var(--accent-500)" />
                        <span>{t('booking.submittedAt')} {new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        {t('booking.totalFee')}{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>{booking.getFormattedFee()}</strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    {booking.canCancel() && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                      >
                        {t('booking.cancelTicket')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
