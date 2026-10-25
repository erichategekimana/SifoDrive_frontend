import React, { useState } from 'react';
import {
  Handshake,
  Building2,
  Users,
  Car,
  CreditCard,
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

export const PartnerWithUsPage: React.FC = () => {
  const { language } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isRw = language === 'rw';

  const [formState, setFormState] = useState({
    partnerType: 'driving_school',
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    district: 'Kigali - Gasabo',
    proposal: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const partnerTiers = [
    {
      icon: <Building2 size={28} color="#0284c7" />,
      badge: isRw ? 'Amashuri yo Gutwara' : 'Driving Schools',
      title: isRw ? 'Amashuri yo Gutwara Ibinyabiziga (Auto-Écoles)' : 'Licensed Driving Academies',
      desc: isRw
        ? 'Guhuza ishuri ryawe n\'ikoranabuhanga rya Sifo Drive rigufasha kwigisha abanyeshuri amategeko 161, gukoresha ibizamini bya Polisi, no kongera umubare w\'abatsinda kugera kuri 98%.'
        : 'Elevate your school’s pass rate to 98% with turnkey digital LMS, standardized police mock tests, real-time student tracking, and automated progress reports.',
      benefits: isRw
        ? [
            'Uburyo bw\'ishuri (School Admin Dashboard) bwo gukurikirana abanyeshuri bose',
            'Ibizamini 400+ bya Polisi bikorwa mu Kinyarwanda no mu Gifaransa',
            'Kugabanyirizwa ibiciro bya sisitemu ku banyeshuri benshi (Bulk rates)',
            'Kwamamazwa ku rubuga rwa Sifo Drive rukoreshwa n\'ibihumbi by\'abanyarwanda',
          ]
        : [
            'Dedicated School Admin Dashboard with multi-branch management',
            '400+ police mock exam bank with visual road diagrams',
            'Wholesale volume credit pricing for student cohorts',
            'Featured placement on Sifo Drive public academy directory',
          ],
    },
    {
      icon: <Users size={28} color="#059669" />,
      badge: isRw ? 'Abarimu b\'Umwuga' : 'Certified Instructors',
      title: isRw ? 'Abarimu Bigenga b\'Umwuga (Instructors)' : 'Independent Driving Instructors',
      desc: isRw
        ? 'Kwinjiza amafaranga menshi no guhabwa abanyeshuri bakeneye kwigishwa gutwara imodoka aho batuye (VIP Tutor Dispatch) no kubaherekeza ku kibuga cy\'ikizamini.'
        : 'Monetize your instructional expertise by receiving direct student referrals, private VIP lesson bookings, and test-day candidate dispatch.',
      benefits: isRw
        ? [
            'Guhabwa abanyeshuri biteguye kwishyura mu gace utuyemo muri Kigali',
            'Gukoresha porogaramu yacu mu gupima intambwe y\'umunyeshuri (GPS log)',
            'Amahugurwa ahoraho ku myigishirize igezweho n\'ubutabazi bw\'ibanze',
            'Ubwishingizi n\'ubufasha bwa tekiniki mu mikorere ya buri munsi',
          ]
        : [
            'Guaranteed candidate dispatch across Kigali districts',
            'Digital session logging with GPS route verification',
            'Regular pedagogy bootcamps and first-aid certification',
            'Instructor liability protection and operational support',
          ],
    },
    {
      icon: <Car size={28} color="#d97706" />,
      badge: isRw ? 'Ibigo n\'Imodoka z\'Akazi' : 'Corporate Fleets',
      title: isRw ? 'Ibigo By\'Ubucuruzi & Imishinga (Corporate Fleets)' : 'Corporate Fleets & Transport Operators',
      desc: isRw
        ? 'Gutoza abashoferi b\'ikigo cyawe kugira imyitwarire itekanye mu muhanda, kugabanya impanuka, no kubungabunga ibinyabiziga (Eco-driving).'
        : 'Protect your enterprise assets and brand reputation with rigorous driver safety screening, defensive driving workshops, and periodic risk audits.',
      benefits: isRw
        ? [
            'Gupima ubumenyi n\'imyitwarire y\'abashoferi mbere yo kubaha akazi',
            'Amahugurwa yo kwirinda impanuka no gutwara mu muhanda mugari nijoro',
            'Kugabanya ikoreshwa rya peteroli n\'amavuta binyuze muri Eco-driving',
            'Raporo y\'umutekano (Safety Audit Certificate) yemewe n\'ibigo by\'ubwishingizi',
          ]
        : [
            'Pre-hire driver skills auditing and reaction profiling',
            'Tailored defensive driving and heavy downpour safety workshops',
            'Eco-driving protocols to minimize fuel consumption & vehicle wear',
            'Official institutional Safety Compliance Certificate for insurers',
          ],
    },
    {
      icon: <CreditCard size={28} color="#7c3aed" />,
      badge: isRw ? 'Banki & Ubwishingizi' : 'FinTech & Insurance',
      title: isRw ? 'Ibigo by\'Imari & Ubwishingizi (FinTech & Insurers)' : 'Financial, Banking & Insurance Partners',
      desc: isRw
        ? 'Gufasha abanyeshuri kubona inguzanyo zo kwiga gutwara, kwishyura byoroshye na MoMo/Airtel Money, no gutanga ubwishingizi bw\'ikizamini.'
        : 'Integrate seamless tuition installment micro-financing, digital MoMo/Card payments, and specialized test-day driver insurance products.',
      benefits: isRw
        ? [
            'Kwinjiza serivisi zanyu z\'imari mu buryo bwo kwishyura bwa Sifo Drive',
            'Gutanga inguzanyo ntoya zo kwiga gutwara (Student Tuition Financing)',
            'Gukorana n\'isoko ry\'abanyeshuri bashya barenga 15,000 buri mwaka',
            'Kugabanya ingaruka z\'impanuka ku banyamuryango banyu bahawe perimi',
          ]
        : [
            'Native checkout integration for mobile money and banking apps',
            'Driver education installment micro-loans tailored for youth',
            'Direct access to over 15,000+ new license seekers annually',
            'Actuarially proven lower claim ratios among Sifo-certified drivers',
          ],
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
            <Handshake size={16} />
            <span>{isRw ? 'UBUFATANYE BURAMBYE' : 'STRATEGIC PARTNERSHIP ECOSYSTEM'}</span>
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
            {isRw ? 'Fatanya na Sifo Drive Kwagura' : 'Partner with Sifo Drive to Modernize'}{' '}
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
              {isRw ? 'Umutekano wo mu Muhanda' : 'Road Safety in Rwanda'}
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
              ? 'Waba uhagarariye ishuri ryo gutwara ibinyabiziga, uri umwarimu w\'umwuga, ukuriye imodoka z\'akazi mu kigo, cyangwa uhagarariye ikigo cy\'imari — dufatanye kubaka u Rwanda rufite abashoferi bazi amategeko kandi batekanye.'
              : 'Whether you represent a driving school, an accredited tutor, an enterprise fleet director, or a financial institution — collaborate with Rwanda’s premier road safety technology platform.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a
              href="#apply-partner"
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 'var(--radius-xl)' }}
            >
              <span>{isRw ? 'Tanga Ubusabe bwo Gufatanya' : 'Apply for Partnership'}</span>
              <ArrowRight size={18} />
            </a>
            <a
              href="#partner-tiers"
              className="btn btn-secondary"
              style={{ padding: '14px 28px', fontSize: '1.05rem', fontWeight: 600, borderRadius: 'var(--radius-xl)' }}
            >
              <span>{isRw ? 'Reba Ibyiciro by\'Ubufatanye' : 'Explore Partner Tiers'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section
        style={{
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          background: isDark ? 'rgba(15, 23, 42, 0.4)' : '#f8fafc',
          padding: '36px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0284c7' }}>15,000+</div>
            <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              {isRw ? 'Abanyeshuri bamaze gutozwa' : 'Candidates Trained'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#059669' }}>98.4%</div>
            <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              {isRw ? 'Igipimo cy\'Abatsinda Ikizamini' : 'Provisional Pass Rate'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#d97706' }}>35+</div>
            <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              {isRw ? 'Amashuri n\'Abarimu b\'Abafatanyabikorwa' : 'Partner Driving Schools'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#7c3aed' }}>100%</div>
            <div style={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b' }}>
              {isRw ? 'Ubwubahirize bw\'Iteka rya Perezida' : 'Statutory Law Compliance'}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Tiers */}
      <section id="partner-tiers" style={{ padding: '60px 24px 80px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '12px', color: isDark ? '#ffffff' : '#0f172a' }}>
            {isRw ? 'Ibyiciro by\'Ubufatanye Dutanga' : 'Partnership Opportunities'}
          </h2>
          <p style={{ color: isDark ? '#94a3b8' : '#64748b', maxWidth: '620px', margin: '0 auto', fontSize: '1.05rem' }}>
            {isRw
              ? 'Twakira amashuri yo gutwara ibinyabiziga, abarimu bigenga, ibigo bifite imodoka n\'inzego z\'imari.'
              : 'Choose the partnership pathway that fits your institutional or professional profile.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {partnerTiers.map((tier, idx) => (
            <div
              key={idx}
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
                    {tier.icon}
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
                    {tier.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '10px', color: isDark ? '#ffffff' : '#0f172a' }}>
                  {tier.title}
                </h3>
                <p style={{ fontSize: '0.94rem', color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  {tier.desc}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {tier.benefits.map((b, bIdx) => (
                    <li key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                      <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#apply-partner"
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontWeight: 700, borderRadius: 'var(--radius-lg)' }}
              >
                <span>{isRw ? 'Injira muri iki Cyiciro' : 'Apply for this Tier'}</span>
                <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Partner Application Form */}
      <section id="apply-partner" style={{ padding: '60px 24px 90px 24px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
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
              {isRw ? 'Inyandiko yo Gusaba Ubufatanye' : 'Strategic Partner Expression of Interest'}
            </h3>
            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.98rem' }}>
              {isRw
                ? 'Uzuza iyi fomu, Umuyobozi w\'Ubufatanye muri Sifo Drive azagusubiza mu masaha 24.'
                : 'Complete the form below. Our institutional partnerships team will review your proposal and respond within 24 hours.'}
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
                {isRw ? 'Dosiye y\'Ubufatanye Yakiriwe Neza!' : 'Partnership Application Received!'}
              </h4>
              <p style={{ color: isDark ? '#cbd5e1' : '#334155', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                {isRw
                  ? `Urakoze ${formState.contactName || 'mufatanyabikorwa'}. Dosiye yawe yashyikirijwe ubuyobozi bwa Sifo Drive, tuzaguhamagara kuri ${formState.phone}.`
                  : `Thank you ${formState.contactName || 'Partner'}. Your proposal has been transmitted to executive management. We look forward to collaborating.`}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSubmitted(false)}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                {isRw ? 'Ohereza ubundi busabe' : 'Submit Another Application'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Icyiciro cy\'Ubufatanye' : 'Partnership Category'} *
                  </label>
                  <select
                    value={formState.partnerType}
                    onChange={(e) => setFormState({ ...formState, partnerType: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="driving_school">{isRw ? 'Ishuri ryo Gutwara (Auto-École)' : 'Licensed Driving School'}</option>
                    <option value="instructor">{isRw ? 'Umwarimu Wihariye (Certified Instructor)' : 'Independent Certified Instructor'}</option>
                    <option value="corporate">{isRw ? 'Ikigo cy\'Ubucuruzi cyangwa NGO (Corporate Fleet)' : 'Corporate Fleet / NGO Operator'}</option>
                    <option value="financial">{isRw ? 'Banki / Ubwishingizi (FinTech & Insurance)' : 'Financial & Insurance Partner'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Izina ry\'Ishuri cyangwa Ikigo' : 'Organization / Brand Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kigali Safe Drivers Association"
                    value={formState.organizationName}
                    onChange={(e) => setFormState({ ...formState, organizationName: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Amazina y\'Uhagarariye Ikigo' : 'Contact Person & Title'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marie Claire Mukamana"
                    value={formState.contactName}
                    onChange={(e) => setFormState({ ...formState, contactName: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Telefone yo Kuvuganiraho' : 'Direct Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0788 000 000"
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
                    {isRw ? 'Imeri (Email)' : 'Official Email'} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@organization.rw"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Akarere n\'Intara' : 'District / Operational Territory'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Kigali - Gasabo"
                    value={formState.district}
                    onChange={(e) => setFormState({ ...formState, district: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                  {isRw ? 'Ibisobanuro ku Mishinga cyangwa Ubufatanye' : 'Partnership Proposal & Scope'} *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    isRw
                      ? 'e.g. Dufite amakamyo 20 akora mu turere dutandukanye, twifuza ko abashoferi bacu bakorerwa isuzuma ryo kwirinda impanuka...'
                      : 'e.g. We operate a commercial logistics fleet of 20 heavy trucks and wish to implement ongoing defensive safety audits for our drivers...'
                  }
                  value={formState.proposal}
                  onChange={(e) => setFormState({ ...formState, proposal: e.target.value })}
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
                <span>{isRw ? 'Ohereza Icyifuzo cy\'Ubufatanye' : 'Submit Partnership Application'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
