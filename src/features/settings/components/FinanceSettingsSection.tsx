import React from 'react';
import { Car, Award, Briefcase, Clock } from 'lucide-react';
import type { PricingSettings } from '../types';

interface FinanceSettingsSectionProps {
  pricing: PricingSettings;
  setPricing: React.Dispatch<React.SetStateAction<PricingSettings>>;
  formatRwf: (val: number) => string;
}

export const FinanceSettingsSection: React.FC<FinanceSettingsSectionProps> = ({
  pricing,
  setPricing,
  formatRwf,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Note */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '0.86rem', color: '#94a3b8' }}>
          Base fees apply across learner registration, practical booking calendar, and Mobile Money checkout. All figures in <strong style={{ color: '#ffffff' }}>RWF</strong>.
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
          Updated rates apply immediately to new student checkouts.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Student & Course Tuition Fees */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Car size={18} color="#94a3b8" />
            <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Student Courses & Lessons</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Complete Driving Course Tuition
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.fullTuitionCourse)}
                </span>
              </div>
              <input
                type="number"
                step={5000}
                value={pricing.fullTuitionCourse}
                onChange={(e) => setPricing({ ...pricing, fullTuitionCourse: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Theory Only Course Package
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.theoryOnlyCourse)}
                </span>
              </div>
              <input
                type="number"
                step={2500}
                value={pricing.theoryOnlyCourse}
                onChange={(e) => setPricing({ ...pricing, theoryOnlyCourse: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Practical Driving Lesson (Hourly Rate)
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.practicalLessonPerHour)}
                </span>
              </div>
              <input
                type="number"
                step={1000}
                value={pricing.practicalLessonPerHour}
                onChange={(e) => setPricing({ ...pricing, practicalLessonPerHour: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Exam Day Academy Car Rental
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.examCarRental)}
                </span>
              </div>
              <input
                type="number"
                step={2500}
                value={pricing.examCarRental}
                onChange={(e) => setPricing({ ...pricing, examCarRental: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Examinations & Certificate Issuance */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Award size={18} color="#94a3b8" />
            <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Exams & Certifications</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Police Mock Exam Sitting (Per Test)
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.policeMockExamSitting)}
                </span>
              </div>
              <input
                type="number"
                step={500}
                value={pricing.policeMockExamSitting}
                onChange={(e) => setPricing({ ...pricing, policeMockExamSitting: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                Proctored simulation timed against Rwanda National Police 20-question format.
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Official Certificate & QR Verification Hash
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.certificateVerificationFee)}
                </span>
              </div>
              <input
                type="number"
                step={1000}
                value={pricing.certificateVerificationFee}
                onChange={(e) => setPricing({ ...pricing, certificateVerificationFee: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Express Certificate Dispatch (Same-Day)
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.expressCertProcessing)}
                </span>
              </div>
              <input
                type="number"
                step={1000}
                value={pricing.expressCertProcessing}
                onChange={(e) => setPricing({ ...pricing, expressCertProcessing: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Corporate & Enterprise Fleet Rates */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Briefcase size={18} color="#94a3b8" />
            <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Corporate & Enterprise</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Corporate Driver Training (Per Driver)
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.corporatePerDriver)}
                </span>
              </div>
              <input
                type="number"
                step={10000}
                value={pricing.corporatePerDriver}
                onChange={(e) => setPricing({ ...pricing, corporatePerDriver: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Fleet Defensive Driving Workshop (Group)
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.fleetDefensiveWorkshop)}
                </span>
              </div>
              <input
                type="number"
                step={25000}
                value={pricing.fleetDefensiveWorkshop}
                onChange={(e) => setPricing({ ...pricing, fleetDefensiveWorkshop: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Commercial / Heavy Vehicle Category Course
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.commercialHeavyVehicleCourse)}
                </span>
              </div>
              <input
                type="number"
                step={10000}
                value={pricing.commercialHeavyVehicleCourse}
                onChange={(e) => setPricing({ ...pricing, commercialHeavyVehicleCourse: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Surcharges & Cancellation Penalties */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Clock size={18} color="#94a3b8" />
            <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>Surcharges & Penalties</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Weekend / Holiday Practical Surcharge
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  +{formatRwf(pricing.weekendHolidaySurcharge)}
                </span>
              </div>
              <input
                type="number"
                step={500}
                value={pricing.weekendHolidaySurcharge}
                onChange={(e) => setPricing({ ...pricing, weekendHolidaySurcharge: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                Added automatically when students book slots on Saturdays or official holidays.
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                  Late Cancellation / No-Show Fee
                </label>
                <span style={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700 }}>
                  {formatRwf(pricing.lateCancellationPenalty)}
                </span>
              </div>
              <input
                type="number"
                step={1000}
                value={pricing.lateCancellationPenalty}
                onChange={(e) => setPricing({ ...pricing, lateCancellationPenalty: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                Deducted from student credit balance if cancelled within the lockout window.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
