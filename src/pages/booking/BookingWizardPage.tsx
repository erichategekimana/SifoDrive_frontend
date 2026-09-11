import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Phone, CreditCard, ArrowRight } from 'lucide-react';
import { BookingService, type CategoryPricingItem } from '../../core/services/BookingService';
import type { LicenseCategory } from '../../core/models/Booking';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/I18nContext';
import { Formatter } from '../../core/utils/Formatter';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';

export const BookingWizardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pricing, setPricing] = useState<CategoryPricingItem[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [sites, setSites] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<LicenseCategory>('B');
  const [selectedDistrict, setSelectedDistrict] = useState('KICUKIRO');
  const [selectedSite, setSelectedSite] = useState('BUSANZA AUTOMATED CENTER');
  const [applicantName, setApplicantName] = useState(user?.fullName || '');
  const [applicantPhone, setApplicantPhone] = useState(user?.phoneNumber || '');
  const [applicantNationalId, setApplicantNationalId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadBookingMetadata = async () => {
      try {
        const bookingSvc = BookingService.getInstance();
        const [prices, distMeta] = await Promise.all([
          bookingSvc.getPricing(),
          bookingSvc.getDistricts(),
        ]);
        setPricing(prices);
        setDistricts(distMeta.districts || []);
        setSites(distMeta.sites || {});
      } catch (err) {
        console.error('Failed to load booking meta:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingMetadata();
  }, []);

  const currentPriceItem = pricing.find((p) => p.category === selectedCategory);
  const currentPriceRwf = currentPriceItem ? currentPriceItem.price_rwf : 15000;

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (applicantNationalId.trim().length !== 16) {
      error(t('auth.nationalIdHint'));
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await BookingService.getInstance().submitApplication({
        category: selectedCategory,
        preferred_district: selectedDistrict,
        preferred_site: selectedSite,
        applicant_name: applicantName,
        applicant_national_id: applicantNationalId,
        applicant_phone: applicantPhone,
      });

      success(`${t('common.success')}! ${t('booking.ticketNumber')}: ${booking.ticketNumber}`);
      navigate('/booking/my-bookings');
    } catch (err: any) {
      error(err.message || t('common.errorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Spinner message={t('common.loading')} />;
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Badge variant="warning">{t('booking.badge')}</Badge>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Irembo Concierge Rwanda
          </span>
        </div>
        <h1>{t('booking.title')}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
          {t('booking.subtitle')}
        </p>
      </div>

      {/* Progress Steps */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-elevated)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step >= 1 ? 'var(--primary)' : 'var(--border-subtle)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            1
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: step === 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {t('booking.step1')}
          </span>
        </div>

        <div style={{ width: '40px', height: '1px', background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step >= 2 ? 'var(--primary)' : 'var(--border-subtle)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            2
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: step === 2 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {t('booking.step2')}
          </span>
        </div>

        <div style={{ width: '40px', height: '1px', background: 'var(--border-subtle)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: step >= 3 ? 'var(--primary)' : 'var(--border-subtle)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            3
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: step === 3 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {t('booking.step3')}
          </span>
        </div>
      </div>

      {/* Step 1: Category & Center */}
      {step === 1 && (
        <Card>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>1. {t('booking.step1')}</h2>

          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
              {t('booking.selectCategory')}
            </label>
            <div className="grid grid-cols-2" style={{ gap: '12px' }}>
              {pricing.map((p) => (
                <div
                  key={p.category}
                  onClick={() => setSelectedCategory(p.category)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid',
                    borderColor: selectedCategory === p.category ? 'var(--primary)' : 'var(--border-subtle)',
                    background: selectedCategory === p.category ? 'var(--primary-glow)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      Category {p.category}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>
                      {Formatter.currency(p.price_rwf)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">{t('booking.preferredDistrict')}</label>
              <select
                className="form-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
              >
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('booking.preferredSite')}</label>
              <select
                className="form-select"
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
              >
                {(sites[selectedDistrict] || ['BUSANZA AUTOMATED CENTER', 'KAVUMU TESTING GROUNDS']).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" onClick={() => setStep(2)} icon={<ArrowRight size={18} />}>
              {t('common.continue')}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Applicant Information */}
      {step === 2 && (
        <Card>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>2. {t('booking.step2')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            {t('auth.nationalIdHint')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <Input
              label={t('booking.applicantFullName')}
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              required
            />
            <Input
              label={t('booking.nationalIdLabel')}
              placeholder="1 199X 8 0000000 0 00"
              maxLength={16}
              value={applicantNationalId}
              onChange={(e) => setApplicantNationalId(e.target.value.replace(/\D/g, ''))}
              hint={t('auth.nationalIdHint')}
              required
            />
            <Input
              label={t('booking.applicantPhone')}
              value={applicantPhone}
              onChange={(e) => setApplicantPhone(e.target.value)}
              icon={<Phone size={16} />}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="secondary" onClick={() => setStep(1)}>
              {t('common.back')}
            </Button>
            <Button variant="primary" onClick={() => setStep(3)} icon={<ArrowRight size={18} />}>
              {t('common.continue')}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Review & Payment Confirmation */}
      {step === 3 && (
        <Card>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '16px' }}>3. {t('booking.summaryTitle')}</h2>

          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('booking.selectCategory')}:</span>
              <strong style={{ color: 'var(--text-primary)' }}>Category {selectedCategory}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('booking.district')}:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{selectedDistrict} — {selectedSite}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('booking.applicantFullName')}:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{applicantName}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('booking.nationalIdLabel')}:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{applicantNationalId}</strong>
            </div>
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
              }}
            >
              <span>{t('booking.totalFee')}</span>
              <strong style={{ color: 'var(--primary-light)' }}>{Formatter.currency(currentPriceRwf)}</strong>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              background: 'var(--accent-glow)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <CreditCard size={24} color="var(--accent-500)" />
            <div style={{ fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{t('booking.momoNotice')}</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t('booking.momoNoticeSub')} ({applicantPhone})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="secondary" onClick={() => setStep(2)}>
              {t('common.back')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitApplication}
              isLoading={isSubmitting}
              icon={<CheckCircle2 size={18} />}
            >
              {t('booking.confirmAndPay')} ({Formatter.currency(currentPriceRwf)})
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
