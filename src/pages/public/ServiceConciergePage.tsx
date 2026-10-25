import React, { useState } from 'react';
import {
  Sparkles,
  Car,
  CalendarCheck,
  UserCheck,
  ShieldAlert,
  Phone,
  CheckCircle2,
  ArrowRight,
  Send,
  Award,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PublicPageBackground } from '../../components/layout/PublicPageBackground';
import { useTranslation } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';

export const ServiceConciergePage: React.FC = () => {
  const { language } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isRw = language === 'rw';

  const [formState, setFormState] = useState({
    fullName: '',
    phone: '',
    serviceType: 'car_rental',
    category: 'B',
    preferredDate: '',
    testLocation: 'Remera - Amahoro Police Test Center',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const services = [
    {
      id: 'car_rental',
      icon: <Car size={28} color="#0284c7" />,
      badge: isRw ? 'Imodoka Zemewe' : 'Police Certified',
      title: isRw ? 'Gukodesha Imodoka y\'Ikizamini' : 'Police Exam Vehicle Rental',
      subtitle: isRw
        ? 'Imodoka zifite feri ebyiri (Dual-pedal) zemerewe gukorerwaho ikizamini ngiro cya Polisi'
        : 'Dual-pedal certified manual and automatic vehicles approved for official Rwanda National Police practical tests.',
      points: isRw
        ? [
            'Imodoka ziteguye neza Category B (Sedan na SUV)',
            'Guherekezwa n\'umwarimu wabishebuje ku kibuga cy\'ikizamini',
            'Kwimenyereza iminota 30 mbere y\'uko ikizamini gitangira',
            'Ibinyabiziga bifite ubwishingizi bwuzuye bw\'ikizamini',
          ]
        : [
            'Inspection-ready Category B sedans & compact SUVs',
            'Certified instructor accompaniment on test day at Police grounds',
            '30-minute warm-up & familiarization session before test',
            'Comprehensive test-day insurance coverage included',
          ],
    },
    {
      id: 'irembo_booking',
      icon: <CalendarCheck size={28} color="#059669" />,
      badge: isRw ? 'Kwandikisha Vuba' : 'Fast-Track',
      title: isRw ? 'Kwandikisha Ikizamini kuri Irembo' : 'Irembo Practical Slot Concierge',
      subtitle: isRw
        ? 'Gushaka itariki y\'ikizamini cyo gutwara ikinyabiziga no kuzuza dosiye utarinze gutonda umurongo'
        : 'Automated notification & reservation support for scarce practical test slots across Kigali & provinces.',
      points: isRw
        ? [
            'Kumenyeshwa vuba itariki nshya zifunguye kuri IremboGov',
            'Ubufasha bwo guhuza umwirondoro na kode y\'ikizamini cy\'agateganyo',
            'Guhitamo ikigo cyegereye: Remera, Busanza, Huye, Musanze, n\'ahandi',
            'Ubutumwa buhamya itariki kuri SMS na WhatsApp',
          ]
        : [
            'Instant slot alerts when new test dates open on IremboGov',
            'Provisional license code verification and profile linking',
            'Preferred testing venue: Remera, Busanza, Huye, Musanze, Rubavu',
            'SMS and WhatsApp booking confirmations with reminders',
          ],
    },
    {
      id: 'vip_tutor',
      icon: <UserCheck size={28} color="#d97706" />,
      badge: isRw ? 'Aho Uri Hose' : 'Door-to-Door',
      title: isRw ? 'Umwarimu Wihariye (VIP Tutor)' : 'Private VIP Driving Tutor Dispatch',
      subtitle: isRw
        ? 'Kwigishwa gutwara imodoka ku masaha uhisemo, umwarimu akagusanga aho utuye cyangwa aho ukorera'
        : 'Personal instructor dispatched directly to your home or office with flexible morning, evening, or weekend slots.',
      points: isRw
        ? [
            'Gufatwa no kugezwa aho utuye muri Kigali yose',
            'Amasaha yoroshye: mu gitondo kare, nimugoroba, no muri wikendi',
            'Integanyanyigisho yihariye ijyanye n\'umuvuduko wo gufata wawe',
            'Gutoza gupatika (Parallel & Bay Parking) n\'inguni zigoye',
          ]
        : [
            'Pick-up and drop-off anywhere in Kigali province',
            'Flexible scheduling: early mornings, evenings, and weekends',
            'Tailored learning pace adapted to your confidence level',
            'Mastery of difficult maneuvers: hill starts, parallel & reverse bay parking',
          ],
    },
    {
      id: 'defensive_highway',
      icon: <ShieldAlert size={28} color="#7c3aed" />,
      badge: isRw ? 'Kwirinda Impanuka' : 'Safety First',
      title: isRw ? 'Amasomo yo mu Muhanda Mugari & Nijoro' : 'Expressway & Night Driving Masterclass',
      subtitle: isRw
        ? 'Kwigira kwiyemeza gutwara mu muhanda mugari, kunyuranaho, gutwara mu mvura no mu mwijima'
        : 'Post-license mastery: highway merging, heavy rain handling, roundabout navigation, and night visibility.',
      points: isRw
        ? [
            'Gutwara mu muhanda mugari (Expressways & Ring Roads)',
            'Imikoreshereze y\'amatara n\'imyitwarire mu mvura no mu mwijima',
            'Kunyuranaho no kureba intera itekanye hagati y\'ibinyabiziga',
            'Kwirinda impanuka zitunguranye (Defensive Driving Skills)',
          ]
        : [
            'High-speed highway merging & ring road navigation',
            'Night driving lighting rules and heavy downpour safety',
            'Overtaking etiquette and dynamic following distance control',
            'Hazard anticipation and defensive driving reaction drills',
          ],
    },
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicPageBackground />
      <Navbar />

      {/* Hero Section */}
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
            <Sparkles size={16} />
            <span>{isRw ? 'SERIVISI Z\'IMPUGUKE ZA SIFO' : 'SIFO VIP CONCIERGE SUITE'}</span>
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
            {isRw ? 'Serivisi zihariye zo Kwiga no' : 'Seamless Concierge Services for'}{' '}
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
              {isRw ? 'Gutsinda Ikizamini Ngiro' : 'Practical Exam Success'}
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
              ? 'Wifuza imodoka ifite feri ebyiri yo gukoreraho ikizamini cya Polisi, ubufasha bwo kwiyandikisha kuri Irembo, cyangwa umwarimu wihariye ugusanga aho utuye? Sifo Concierge iragufasha kuva ku munsi wa mbere kugeza ubonye perimi.'
              : 'From test-day dual-pedal car rental at Rwanda Police testing grounds to automated IremboGov test reservation and private tutor dispatch, our concierge team handles every logistic detail.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a
              href="#book-concierge"
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 'var(--radius-xl)' }}
            >
              <span>{isRw ? 'Saba Serivisi ya Concierge' : 'Request Concierge Service'}</span>
              <ArrowRight size={18} />
            </a>
            <a
              href="tel:+250788000000"
              className="btn btn-secondary"
              style={{ padding: '14px 28px', fontSize: '1.05rem', fontWeight: 600, borderRadius: 'var(--radius-xl)' }}
            >
              <Phone size={18} />
              <span>{isRw ? 'Hamagara Impuguke' : 'Call Concierge Desk'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '40px 24px 80px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '12px', color: isDark ? '#ffffff' : '#0f172a' }}>
            {isRw ? 'Dore Serivisi Dutanga' : 'Our Specialized Concierge Solutions'}
          </h2>
          <p style={{ color: isDark ? '#94a3b8' : '#64748b', maxWidth: '620px', margin: '0 auto', fontSize: '1.05rem' }}>
            {isRw
              ? 'Buri serivisi iteguranywe ubuhanga n\'ubufatanye n\'inzego zibishinzwe kugira ngo ukore ikizamini wizeye intsinzi.'
              : 'Every solution is designed in full compliance with traffic regulations to give candidates the highest confidence on examination day.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {services.map((svc) => (
            <div
              key={svc.id}
              style={{
                borderRadius: '24px',
                padding: '32px',
                background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.95)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.95)',
                boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)' : '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(2, 132, 199, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {svc.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: 'rgba(2, 132, 199, 0.1)',
                      color: '#0284c7',
                      border: '1px solid rgba(2, 132, 199, 0.2)',
                    }}
                  >
                    {svc.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '10px', color: isDark ? '#ffffff' : '#0f172a' }}>
                  {svc.title}
                </h3>
                <p style={{ fontSize: '0.94rem', color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  {svc.subtitle}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {svc.points.map((pt, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                      <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#book-concierge"
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontWeight: 700, borderRadius: 'var(--radius-lg)' }}
                onClick={() => setFormState((prev) => ({ ...prev, serviceType: svc.id }))}
              >
                <span>{isRw ? 'Hitamo Iyi Serivisi' : 'Select This Service'}</span>
                <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="book-concierge" style={{ padding: '60px 24px 90px 24px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
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
            <Award size={36} color="#0284c7" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '8px' }}>
              {isRw ? 'Kora Gahunda ya Concierge' : 'Book Concierge Consultation'}
            </h3>
            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.98rem' }}>
              {isRw
                ? 'Uzuza iyi myirondoro, impuguke ya Sifo Drive irakuvugisha mu minota 15 ikurangire byose.'
                : 'Fill in your details below. A Sifo Drive concierge specialist will reach out within 15 minutes to confirm arrangements.'}
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
                {isRw ? 'Ubusabe bwawe bwakiriwe neza!' : 'Concierge Request Received!'}
              </h4>
              <p style={{ color: isDark ? '#cbd5e1' : '#334155', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                {isRw
                  ? `Urakoze ${formState.fullName || 'musomyi'}. Impuguke yacu irakwandikira cyangwa ikuhamagare kuri telefone ${formState.phone} mu kanya gato.`
                  : `Thank you ${formState.fullName || 'valued candidate'}. Our dispatch team has logged your booking and will contact you via ${formState.phone} promptly.`}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSubmitted(false)}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                {isRw ? 'Ohereza ubundi busabe' : 'Submit Another Request'}
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
                    placeholder="e.g. Eric Mugisha"
                    value={formState.fullName}
                    onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Nimero ya Telefone (MTN / Airtel)' : 'Phone Number'} *
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
                    {isRw ? 'Serivisi Wifuza' : 'Service Type'} *
                  </label>
                  <select
                    value={formState.serviceType}
                    onChange={(e) => setFormState({ ...formState, serviceType: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="car_rental">{isRw ? 'Gukodesha Imodoka y\'Ikizamini' : 'Police Exam Vehicle Rental'}</option>
                    <option value="irembo_booking">{isRw ? 'Kwandikisha kuri Irembo' : 'Irembo Slot Booking Assistance'}</option>
                    <option value="vip_tutor">{isRw ? 'Umwarimu Wihariye (VIP Tutor)' : 'Private VIP Driving Tutor Dispatch'}</option>
                    <option value="defensive_highway">{isRw ? 'Amasomo yo mu Muhanda Mugari' : 'Expressway & Highway Masterclass'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Icyiciro cy\'Uruhushya' : 'License Category'} *
                  </label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="A">Category A (Moto / Motorcycle)</option>
                    <option value="B">Category B (Imodoka nto / Sedan & SUV)</option>
                    <option value="C">Category C (Ikamyo / Heavy Goods Vehicle)</option>
                    <option value="D">Category D (Bisi / Passenger Bus)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Itariki Yitezwe y\'Ikizamini' : 'Preferred Date / Target Date'}
                  </label>
                  <input
                    type="date"
                    value={formState.preferredDate}
                    onChange={(e) => setFormState({ ...formState, preferredDate: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Ikigo cy\'Ikizamini cyangwa Agace' : 'Testing Center / Preferred Hub'}
                  </label>
                  <input
                    type="text"
                    value={formState.testLocation}
                    onChange={(e) => setFormState({ ...formState, testLocation: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                  {isRw ? 'Ibisobanuro Byiyongereyeho' : 'Additional Requests or Notes'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    isRw
                      ? 'e.g. Nkeneye imodoka yo mu bwoko bwa Automatic kandi nkorera kuri sitade ya Remera...'
                      : 'e.g. I need an automatic transmission vehicle and my test is scheduled at Remera Police Grounds...'
                  }
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
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
                <span>{isRw ? 'Ohereza Ubusabe bwa Concierge' : 'Submit Concierge Request'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
