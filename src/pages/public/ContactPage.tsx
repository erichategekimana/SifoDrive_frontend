import React, { useState } from 'react';
import {
  PhoneCall,
  MapPin,
  Mail,
  Clock,
  MessageSquare,
  CheckCircle2,
  Send,
  Phone,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PublicPageBackground } from '../../components/layout/PublicPageBackground';
import { useTranslation } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';

export const ContactPage: React.FC = () => {
  const { language } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isRw = language === 'rw';

  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactChannels = [
    {
      icon: <MapPin size={26} color="#0284c7" />,
      title: isRw ? 'Ibiro Bikuru (Headquarters)' : 'Kigali Main Campus',
      line1: 'KN 3 Rd, Remera (Near Amahoro Stadium)',
      line2: 'Gasabo District, Kigali, Rwanda',
      badge: isRw ? 'Dusure' : 'Visit Us',
    },
    {
      icon: <Phone size={26} color="#059669" />,
      title: isRw ? 'Telefone z\'Ubufasha' : 'Direct Phone Lines',
      line1: '+250 788 123 456 (General & Admissions)',
      line2: '+250 788 654 321 (Test Day Hotline)',
      badge: isRw ? 'Hamagara' : 'Call 24/7',
    },
    {
      icon: <Mail size={26} color="#d97706" />,
      title: isRw ? 'Imeri Zizewe' : 'Official Email',
      line1: 'support@sifodrive.rw',
      line2: 'partnerships@sifodrive.rw',
      badge: isRw ? 'Tumenyeshe' : 'Write to us',
    },
    {
      icon: <Clock size={26} color="#7c3aed" />,
      title: isRw ? 'Amasaha y\'Akazi' : 'Operating Hours',
      line1: isRw ? 'Kuwa Mbere - Kuwa Gatandatu: 07:00 - 20:00' : 'Monday - Saturday: 07:00 AM - 08:00 PM',
      line2: isRw ? 'Ku Cyumweru: 09:00 - 17:00' : 'Sunday: 09:00 AM - 05:00 PM',
      badge: isRw ? 'Iminsi Yose' : 'Open Daily',
    },
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicPageBackground />
      <Navbar />

      {/* Hero */}
      <section style={{ position: 'relative', padding: '60px 24px 70px 24px', overflow: 'hidden' }}>
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            textAlign: 'center',
            padding: '48px 28px',
            borderRadius: '32px',
            background: isDark ? 'rgba(15, 23, 42, 0.78)' : 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: isDark
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.65)'
              : '0 20px 40px -10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(2, 132, 199, 0.1)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              color: '#0284c7',
              fontSize: '0.84rem',
              fontWeight: 700,
              marginBottom: '20px',
            }}
          >
            <PhoneCall size={16} />
            <span>{isRw ? 'TWANDIKIRE CYANGWA DUHAMAGARE' : 'GET IN TOUCH WITH SIFO DRIVE'}</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.4vw, 3.4rem)',
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f172a',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              marginBottom: '18px',
            }}
          >
            {isRw ? 'Duhari Ku bwawe: ' : 'We Are Here For You: '}{' '}
            <span
              style={{
                display: 'inline-block',
                background: isDark
                  ? 'linear-gradient(135deg, #38bdf8 0%, #34d399 100%)'
                  : 'linear-gradient(135deg, #0284c7 0%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 900,
              }}
            >
              {isRw ? 'Twandikire Uyu Munsi' : 'Connect with our Team'}
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.14rem',
              color: isDark ? '#cbd5e1' : '#334155',
              maxWidth: '760px',
              margin: '0 auto 32px auto',
              lineHeight: 1.7,
            }}
          >
            {isRw
              ? 'Waba ufite ikibazo ku kizamini cy\'agateganyo, ukeneye kumenya ibiciro by\'amasomo, wifuza serivisi ya Concierge, cyangwa ushaka gusura ibiro byacu i Remera — twiteguye kugufasha.'
              : 'Whether you have inquiries regarding the provisional traffic theory tests, package activations, concierge bookings, or institutional partnerships — our dedicated support desk is available.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/250788123456"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 'var(--radius-xl)' }}
            >
              <MessageSquare size={18} />
              <span>{isRw ? 'Vugana Natwe kuri WhatsApp' : 'Chat on WhatsApp'}</span>
            </a>
            <a
              href="tel:+250788123456"
              className="btn btn-secondary"
              style={{ padding: '14px 28px', fontSize: '1.05rem', fontWeight: 600, borderRadius: 'var(--radius-xl)' }}
            >
              <Phone size={18} />
              <span>+250 788 123 456</span>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Cards Grid */}
      <section style={{ padding: '20px 24px 60px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {contactChannels.map((c, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: '24px',
                padding: '28px',
                background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.95)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.95)',
                boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)' : '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(2, 132, 199, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {c.icon}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: 'rgba(2, 132, 199, 0.1)',
                    color: '#0284c7',
                    border: '1px solid rgba(2, 132, 199, 0.2)',
                  }}
                >
                  {c.badge}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px', color: isDark ? '#ffffff' : '#0f172a' }}>
                {c.title}
              </h3>
              <p style={{ fontSize: '0.92rem', color: isDark ? '#cbd5e1' : '#334155', fontWeight: 600, marginBottom: '4px' }}>
                {c.line1}
              </p>
              <p style={{ fontSize: '0.86rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                {c.line2}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section style={{ padding: '20px 24px 90px 24px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
        <div
          style={{
            borderRadius: '28px',
            padding: '40px',
            background: isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(203, 213, 225, 0.9)',
            boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.6)' : '0 15px 35px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <MessageSquare size={36} color="#0284c7" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '8px' }}>
              {isRw ? 'Tumenyeshe Icyo Tugufasha' : 'Send Direct Message'}
            </h3>
            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.98rem' }}>
              {isRw
                ? 'Uzuza ubutumwa bwawe hano munsi, itsinda rishinzwe abakiriya riragusubiza mu mwanya muto.'
                : 'Leave us a note below and our client happiness team will respond via phone or email.'}
            </p>
          </div>

          {submitted ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                borderRadius: '20px',
                background: 'rgba(5, 150, 105, 0.1)',
                border: '1px solid rgba(5, 150, 105, 0.3)',
              }}
            >
              <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 16px auto' }} />
              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginBottom: '8px' }}>
                {isRw ? 'Ubutumwa bwawe bwakiriwe!' : 'Message Sent Successfully!'}
              </h4>
              <p style={{ color: isDark ? '#cbd5e1' : '#334155', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                {isRw
                  ? `Urakoze cyane ${formState.name}. Ubutumwa bwawe bwashyikirijwe itsinda ryacu, turagusubiza vuba kuri ${formState.phone || formState.email}.`
                  : `Thank you ${formState.name}. Your inquiry has been dispatched to our support specialists.`}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSubmitted(false)}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                {isRw ? 'Ohereza ubundi butumwa' : 'Send Another Note'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Amazina Yombi' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Patrick Kwizera"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Telefone (MTN / Airtel)' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0788 123 456"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Imeri (Email)' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="patrick@gmail.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Impamvu y\'Ubutumwa' : 'Inquiry Subject'} *
                  </label>
                  <select
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="general">{isRw ? 'Ibibazo Bisanzwe (General Question)' : 'General Question'}</option>
                    <option value="exam_credits">{isRw ? 'Kugura cyangwa Gukoresha Ibizamini (Exam Credits)' : 'Exam Passes & MoMo Credits'}</option>
                    <option value="concierge">{isRw ? 'Gukodesha Imodoka cyangwa Umwarimu (Concierge)' : 'Vehicle Rental & VIP Concierge'}</option>
                    <option value="school">{isRw ? 'Gahunda y\'Ishuri (School Program)' : 'Auto-School / Institution Inquiry'}</option>
                    <option value="partnership">{isRw ? 'Ubufatanye (Partnership Inquiry)' : 'Partnership & Fleet Solutions'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                  {isRw ? 'Ubutumwa bwawe' : 'Your Message'} *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    isRw
                      ? 'Andika ubutumwa bwawe hano neza...'
                      : 'Please describe how we can assist you...'
                  }
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="input"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', fontWeight: 700, borderRadius: 'var(--radius-xl)', marginTop: '8px' }}
              >
                <Send size={18} />
                <span>{isRw ? 'Ohereza Ubutumwa' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
