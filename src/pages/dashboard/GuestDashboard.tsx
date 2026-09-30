import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';

export const GuestDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useTranslation();

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUpgradePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpgrading(true);
    setTimeout(() => {
      setIsUpgrading(false);
      setShowUpgradeModal(false);
      alert(
        language === 'rw'
          ? 'Ubutumwa bwa MoMo bwo kwemeza bwoherejwe kuri terefone yawe (+250...). Numara kwishyura konti ihita iba iy\'Umunyeshuri!'
          : 'MoMo prompt sent to your phone! Once confirmed, your account will be immediately upgraded to Full Student.'
      );
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome & Trial Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'radial-gradient(ellipse at 80% 50%, rgba(3, 116, 181, 0.15), transparent 70%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                background: 'rgba(234, 88, 12, 0.12)',
                color: '#ea580c',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid rgba(234, 88, 12, 0.25)',
              }}
            >
              {language === 'rw' ? "Umusura w'Igerageza (Guest Trial)" : "Free Trial Account"}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0' }}>
            {language === 'rw' ? `Muraho, ${user?.fullName}!` : `Welcome, ${user?.fullName}!`}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, maxWidth: '600px' }}>
            {language === 'rw'
              ? "Ubu ufite uburyo bwo gusoma amasomo amwe n'ibyapa by'ubuntu. Iyandikishe nk'umunyeshuri wuzuye kugira ngo witabire amasomo ya Google Meet n'ibizamini bya Polisi."
              : "You have free trial access to sample lessons and road signs. Upgrade to full student to attend live classes and take official mock exams."}
          </p>
        </div>

        <button
          onClick={() => setShowUpgradeModal(true)}
          className="btn btn-primary btn-lg"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#058728', borderColor: '#058728' }}
        >
          <Sparkles size={18} />
          <span>{language === 'rw' ? "Kora 'Upgrade' ku Munyeshuri Wuzuye" : "Upgrade to Full Student"}</span>
        </button>
      </div>

      {/* Comparison Grid: Guest vs Enrolled Student */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Guest Features */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            {language === 'rw' ? "Ibyo Ufite Ubu (Guest Trial)" : "Current Trial Features"}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#058728" />
              <span>{language === 'rw' ? "Amasomo y'ibanze y'amategeko (Sample Lessons)" : "Introductory Theory Lessons"}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#058728" />
              <span>{language === 'rw' ? "Ibyapa by'ibanze by'umuhanda" : "Standard Road Signs Guide"}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Lock size={16} />
              <span>{language === 'rw' ? "Amasomo y'imbonankubone (Google Meet) — Ntabyo" : "Live Tutoring (No Google Meet)"}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Lock size={16} />
              <span>{language === 'rw' ? "Nimero y'Umunyeshuri ya Sifo (SIFO-STU-YYYY-XXXX) — Ntabyo" : "Official Student ID — Locked"}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Lock size={16} />
              <span>{language === 'rw' ? "Kwemererwa Ikizamini cya Polisi — Ntabyo" : "Police Exam Eligibility Certificate — Locked"}</span>
            </li>
          </ul>
        </div>

        {/* Student Upgrade Value Proposition */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 51, 102, 0.05) 0%, rgba(3, 116, 181, 0.1) 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '2px solid #0374b5',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-12px',
              right: '24px',
              background: '#0374b5',
              color: '#ffffff',
              padding: '2px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}
          >
            {language === 'rw' ? 'BYIZA CYANE (RECOMMENDED)' : 'RECOMMENDED'}
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0', color: '#003366' }}>
            {language === 'rw' ? "Umunyeshuri Wuzuye (Full Student)" : "Full Enrolled Student"}
          </h3>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            15,000 RWF <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ ukwezi kose</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#058728" />
              <span>{language === 'rw' ? "Amasomo ya buri munsi kuri Google Meet n'Umwarimu" : "Daily live Google Meet classes with certified instructors"}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#058728" />
              <span>{language === 'rw' ? "Ibizamini by'igerageza bitagira umupaka (Unlimited Mock Exams)" : "Unlimited realistic 20-minute mock exams"}</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="#058728" />
              <span>{language === 'rw' ? "Nimero y'Umunyeshuri n'Uruhushya rwo Kwiyandikisha ku Kizamini" : "Student ID & official eligibility clearance for Police Exam"}</span>
            </li>
          </ul>

          <button
            onClick={() => setShowUpgradeModal(true)}
            className="btn btn-primary btn-md"
            style={{ width: '100%', marginTop: '24px', justifyContent: 'center', background: '#003366', borderColor: '#003366' }}
          >
            <span>{language === 'rw' ? "Ishyura Ukoresheje MoMo (15,000 RWF)" : "Pay with MTN / Airtel MoMo"}</span>
          </button>
        </div>
      </div>

      {/* Free Trial Learning Cards */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
          {language === 'rw' ? "Amasomo y'Ubuntu Ushobora Kwigaho Ubu" : "Free Lessons Available Right Now"}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <Link
            to="/courses"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={20} color="#0374b5" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                {language === 'rw' ? "Amategeko Rusange yo Gutwara" : "General Traffic Rules"}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {language === 'rw' ? "Iga amategeko shingiro y'umuhanda mu Rwanda." : "Learn the fundamental traffic laws and regulations in Rwanda."}
            </p>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0374b5', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {language === 'rw' ? "Fungura Isomo" : "Open Lesson"} <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            to="/road-signs"
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={20} color="#058728" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                {language === 'rw' ? "Ibyapa byo Kuburira n'Iby'Umutekano" : "Danger & Warning Road Signs"}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {language === 'rw' ? "Reba ibyapa by'umuhanda n'ibisobanuro byabyo." : "Inspect interactive road signs and safety signals."}
            </p>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#058728', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {language === 'rw' ? "Reba Ibyapa" : "Explore Signs"} <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              {language === 'rw' ? "Kwemeza Kwishyura Ishuri (MoMo)" : "Confirm Tuition Payment (MoMo)"}
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {language === 'rw'
                ? "Shyiramo terefone yawe yo kwishyuriraho. Urahita wakira ubutumwa bwo kwemeza (USSD prompt) kuri telefone yawe."
                : "Enter your mobile money number to receive the USSD prompt for 15,000 RWF."}
            </p>

            <form onSubmit={handleUpgradePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                  {language === 'rw' ? "Nimero ya Telefone (MTN / Airtel)" : "Phone Number (MTN / Airtel)"}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(5, 135, 40, 0.08)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  color: '#058728',
                  fontWeight: 600,
                }}
              >
                {language === 'rw' ? "Amafaranga: 15,000 RWF (Amasomo yose + Google Meet)" : "Amount: 15,000 RWF (Full Access)"}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="btn btn-secondary btn-md"
                >
                  {language === 'rw' ? 'Reka' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUpgrading}
                  className="btn btn-primary btn-md"
                  style={{ background: '#058728', borderColor: '#058728' }}
                >
                  {isUpgrading ? (language === 'rw' ? 'Birimo koherezwa...' : 'Sending Prompt...') : (language === 'rw' ? 'Ohereza Kwishyura' : 'Send Payment Prompt')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
