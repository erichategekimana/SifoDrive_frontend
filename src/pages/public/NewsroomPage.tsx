import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowRight,
  Megaphone,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PublicPageBackground } from '../../components/layout/PublicPageBackground';
import { useTranslation } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';

interface NewsArticle {
  id: string;
  category: 'law' | 'safety' | 'police' | 'tech';
  badge: { en: string; rw: string };
  title: { en: string; rw: string };
  summary: { en: string; rw: string };
  date: string;
  readTime: string;
  isFeatured?: boolean;
}

export const NewsroomPage: React.FC = () => {
  const { language } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isRw = language === 'rw';

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const articles: NewsArticle[] = [
    {
      id: 'news-1',
      category: 'law',
      badge: { en: 'Statutory Decree', rw: 'Iteka rya Perezida' },
      title: {
        en: 'Presidential Order No. 85/01: Key Provisions for Commercial Heavy Vehicles and Overtaking Protocols',
        rw: 'Iteka rya Perezida No 85/01: Ingingo z\'ingenzi zireba amakamyo manini no kunyuranaho mu muhanda',
      },
      summary: {
        en: 'A deep-dive regulatory analysis into Article 56 bis and speed limits on Kigali expressways, highlighting candidate compliance for provisional exam questions.',
        rw: 'Isesengura ry\'ingingo ya 56 bis n\'umuvuduko wemewe ku mihanda migari ya Kigali, n\'uburyo abakandida bakwiye kuyitwaramo mu bizamini bya Polisi.',
      },
      date: '2026-10-20',
      readTime: '5 min read',
      isFeatured: true,
    },
    {
      id: 'news-2',
      category: 'police',
      badge: { en: 'Police Dispatch', rw: 'Amatangazo ya Polisi' },
      title: {
        en: 'Rwanda National Police Modernizes Practical Test Sessions with Real-Time Electronic Telemetry',
        rw: 'Polisi y\'u Rwanda itangije ikoranabuhanga rishya ryo gukurikirana ibizamini ngiro byo gutwara',
      },
      summary: {
        en: 'New sensorized dual-control vehicles and automated slot booking through IremboGov streamline testing day at Amahoro and Busanza grounds.',
        rw: 'Imodoka zifite uburyo bwa kijyambere n\'ikoranabuhanga rya IremboGov byoroheje imitangire y\'ibizamini ku bibuga bya Remera na Busanza.',
      },
      date: '2026-10-18',
      readTime: '4 min read',
      isFeatured: true,
    },
    {
      id: 'news-3',
      category: 'safety',
      badge: { en: 'Gerayo Amahoro', rw: 'Gerayo Amahoro' },
      title: {
        en: 'National Road Safety Campaign Expands to Secondary School Campuses Across All Provinces',
        rw: 'Ubukangurambaga bwa Gerayo Amahoro bwegerejwe amashuri yisumbuye mu Turere twose',
      },
      summary: {
        en: 'Collaborative curriculum trains over 45,000 youths on pedestrian rights, helmet usage, and provisional driver licensing before high school graduation.',
        rw: 'Amasomo yo kumenya amategeko y\'umuhanda yagejejwe ku banyeshuri barenga 45,000 mu gihugu cyose mu rwego rwo kugabanya impanuka.',
      },
      date: '2026-10-14',
      readTime: '3 min read',
    },
    {
      id: 'news-4',
      category: 'tech',
      badge: { en: 'Sifo Platform Release', rw: 'Ikoranabuhanga rishya' },
      title: {
        en: 'Sifo Drive Launches Full Trilingual Traffic Law Database with 400+ Interactive Police Exam Questions',
        rw: 'Sifo Drive itangije ububiko bwuzuye bw\'amategeko 161 n\'ibibazo 400+ bya Polisi mu ndimi 3',
      },
      summary: {
        en: 'Complete digital transcription of the official 105-page statutory gazette, featuring audio narration, visual sign diagrams, and instant diagnostic scoring.',
        rw: 'Ububiko bwa mbere bw\'amategeko y\'umuhanda buhuza inyandiko y\'igazeti, amajwi y\'ikinyarwanda, n\'ibibazo by\'ikitegererezo byose byakusanyijwe.',
      },
      date: '2026-10-10',
      readTime: '4 min read',
    },
    {
      id: 'news-5',
      category: 'law',
      badge: { en: 'Road Signs Update', rw: 'Ibyapa bishya' },
      title: {
        en: 'Standardized Classification of 64 Rwanda Road Signs: Priority, Danger & Prohibitory Markings',
        rw: 'Gushyira mu byiciro ibyapa 64 by\'umuhanda mu Rwanda: Iby\'integuza, iby\'ubutware n\'ibibuzwa',
      },
      summary: {
        en: 'Comprehensive visual guide explaining triangular danger signs, octagonal stop signs, and continuous white line markings according to current traffic statutes.',
        rw: 'Igitabo cy\'amashusho gisobanura ibyapa by\'amapembe atatu, ibyapa byo guhagarara (STOP) n\'umurongo umwe wera udacagaguye.',
      },
      date: '2026-10-05',
      readTime: '6 min read',
    },
    {
      id: 'news-6',
      category: 'police',
      badge: { en: 'Exam Advisory', rw: 'Inama ku bizamini' },
      title: {
        en: 'Top 5 Most Common Mistakes Made by Provisional Exam Candidates and How to Avoid Them',
        rw: 'Amakosa 5 akunze gukorwa cyane mu kizamini cy\'agateganyo n\'uburyo bwo kuyirinda',
      },
      summary: {
        en: 'Detailed statistical review of the trickiest questions: right-of-way at roundabouts, tramway tracks, towing regulations, and vehicle illumination.',
        rw: 'Ubushakashatsi ku bibazo bikunze kuremereza abakora ikizamini: ubutware mu ma-rond-point, gukurura ibinyabiziga, n\'amatara y\'ikinyabiziga mu ijoro.',
      },
      date: '2026-09-28',
      readTime: '5 min read',
    },
  ];

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter((a) => a.category === selectedCategory);

  const categories = [
    { id: 'all', label: isRw ? 'Byose' : 'All Updates' },
    { id: 'law', label: isRw ? 'Amategeko y\'Umuhanda' : 'Statutory & Traffic Law' },
    { id: 'police', label: isRw ? 'Amatangazo ya Polisi' : 'Police & Test Grounds' },
    { id: 'safety', label: isRw ? 'Gerayo Amahoro' : 'Road Safety Campaigns' },
    { id: 'tech', label: isRw ? 'Ikoranabuhanga rya Sifo' : 'Platform Innovations' },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
    }
  };

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
            <Megaphone size={16} />
            <span>{isRw ? 'IBIRO BY\'AMAKURU YA SIFO' : 'SIFO DRIVE NEWSROOM'}</span>
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
            {isRw ? 'Amakuru & Amatangazo ku' : 'Official Bulletins, Traffic Law &'}{' '}
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
              {isRw ? 'Mategeko y\'Umuhanda' : 'Road Safety Updates'}
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
              ? 'Komeza umenye amakuru mashya ajyanye n\'ibizamini bya Polisi, impinduka mu mategeko yo mu muhanda mu Rwanda, ibyapa bishya n\'uburyo bwo kwitegura neza.'
              : 'Stay informed with verified announcements on Rwanda National Police driving examinations, statutory amendments, national safety initiatives, and academy insights.'}
          </p>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '0.88rem',
                  fontWeight: selectedCategory === cat.id ? 700 : 500,
                  cursor: 'pointer',
                  border: selectedCategory === cat.id
                    ? '1px solid #0284c7'
                    : isDark
                    ? '1px solid rgba(255, 255, 255, 0.12)'
                    : '1px solid rgba(203, 213, 225, 0.9)',
                  background: selectedCategory === cat.id
                    ? '#0284c7'
                    : isDark
                    ? 'rgba(30, 41, 59, 0.6)'
                    : '#ffffff',
                  color: selectedCategory === cat.id ? '#ffffff' : isDark ? '#cbd5e1' : '#334155',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section style={{ padding: '20px 24px 80px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          {filteredArticles.map((art) => (
            <article
              key={art.id}
              style={{
                borderRadius: '24px',
                padding: '30px',
                background: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.95)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.95)',
                boxShadow: isDark ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)' : '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
                    {isRw ? art.badge.rw : art.badge.en}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    <Clock size={14} />
                    <span>{art.readTime}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: isDark ? '#ffffff' : '#0f172a', lineHeight: 1.4 }}>
                  {isRw ? art.title.rw : art.title.en}
                </h3>

                <p style={{ fontSize: '0.92rem', color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                  {isRw ? art.summary.rw : art.summary.en}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
                  paddingTop: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <Calendar size={14} />
                  <span>{art.date}</span>
                </div>
                <Link
                  to="/pricing"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    textDecoration: 'none',
                  }}
                >
                  <span>{isRw ? 'Soma Byose' : 'Read Article'}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={{ padding: '40px 24px 80px 24px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
        <div
          style={{
            borderRadius: '28px',
            padding: '40px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 132, 199, 0.15) 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
            border: isDark ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid #bae6fd',
            boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.5)' : '0 15px 35px rgba(2, 132, 199, 0.08)',
            textAlign: 'center',
          }}
        >
          <Mail size={36} color="#0284c7" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '8px' }}>
            {isRw ? 'Komeza Kumenya Amakuru Mashya' : 'Subscribe to Traffic Regulatory Bulletins'}
          </h3>
          <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.98rem', maxWidth: '540px', margin: '0 auto 24px auto' }}>
            {isRw
              ? 'Injiza imeri yawe ujye wakira itangazo ako kanya iyo Polisi yashyizeho itariki nshya z\'ibizamini cyangwa iyo hari ingingo yahindutse mu mategeko.'
              : 'Receive instant alerts whenever the Rwanda National Police publishes practical exam dates or when new statutory decrees are gazetted.'}
          </p>

          {subscribed ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '999px',
                background: 'rgba(5, 150, 105, 0.1)',
                border: '1px solid rgba(5, 150, 105, 0.3)',
                color: '#059669',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={18} />
              <span>{isRw ? 'Urakoze! Imeri yawe yanditswe neza.' : 'Thank you! You are now subscribed.'}</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '520px', margin: '0 auto', flexWrap: 'wrap' }}>
              <input
                type="email"
                required
                placeholder={isRw ? 'Injiza imeri yawe...' : 'Enter your email address...'}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="input"
                style={{ flex: 1, minWidth: '240px' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontWeight: 700, borderRadius: 'var(--radius-lg)' }}
              >
                <span>{isRw ? 'Iyandikishe' : 'Subscribe'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
