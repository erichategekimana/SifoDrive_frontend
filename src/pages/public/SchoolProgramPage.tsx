import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building2,
  CheckCircle2,
  ArrowRight,
  Send,
  School,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PublicPageBackground } from '../../components/layout/PublicPageBackground';
import { useTranslation } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';
import { usePublicSchoolProgram } from '../../hooks/usePublicSchoolProgram';

export const SchoolProgramPage: React.FC = () => {
  const { language } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isRw = language === 'rw';

  const { schoolProgramConfig } = usePublicSchoolProgram();
  const slides = schoolProgramConfig.slides || [];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-advance slideshow
  useEffect(() => {
    if (!schoolProgramConfig.useCustomBackground) return;
    if (schoolProgramConfig.backgroundType !== 'slideshow') return;
    if (slides.length <= 1 || isPaused) return;

    const intervalTime = (schoolProgramConfig.slideshowInterval || 8) * 1000;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [schoolProgramConfig.useCustomBackground, schoolProgramConfig.backgroundType, schoolProgramConfig.slideshowInterval, slides.length, isPaused]);

  // Restart video playback when slide changes if media is video
  useEffect(() => {
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentSlideIndex]);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const [formState, setFormState] = useState({
    institutionName: '',
    contactPerson: '',
    email: '',
    phone: '',
    institutionType: 'auto_school',
    studentVolume: '50-200',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const programs = [
    {
      badge: isRw ? 'Amashuri yo Gutwara' : 'Auto-Schools',
      title: isRw ? 'Guhuza Ishuri n\'Ikoranabuhanga rya Sifo' : 'Driving School Digital Partner Hub',
      desc: isRw
        ? 'Amashuri yo gutwara ibinyabiziga yemewe akoresha sisitemu ya Sifo Drive mu kwigisha amategeko, gutanga ibizamini bya Polisi, no gukurikirana intambwe ya buri munyeshuri.'
        : 'Empower your driving academy with our turnkey digital LMS, standardized police mock tests, real-time student tracking, and automated progress reports.',
      highlights: isRw
        ? [
            'Integanyanyigisho yuzuye y\'amategeko 161 n\'ibyapa 64',
            'Ibizamini 400+ bya Polisi bikorwa kuri telefone cyangwa mudasobwa',
            'Icyemezo (Certificate) cy\'ishuri kigenzurwa ku ikoranabuhanga',
            'Kugabanyirizwa ibiciro ku munyeshuri (Bulk Student Discount)',
          ]
        : [
            'Official 161 Presidential Order articles & 64 standardized road signs',
            '400+ simulated police exam questions with visual diagrams',
            'Tamper-proof verifiable digital academy certificates',
            'Institutional bulk credit pricing for enrolled student cohorts',
          ],
    },
    {
      badge: isRw ? 'Urubyiruko mu Mashuri' : 'Youth Literacy',
      title: isRw ? 'Gahunda y\'Amashuri Yisumbuye na Kaminuza' : 'High School & University Youth Program',
      desc: isRw
        ? 'Gufasha abanyeshuri barangije amashuri yisumbuye na za Kaminuza kubona uruhushya rw\'agateganyo (Provisional) mbere yo kwinjira ku isoko ry\'umurimo.'
        : 'Equipping secondary school graduates and university students across Rwanda with essential road safety knowledge and provisional driver licenses before employment.',
      highlights: isRw
        ? [
            'Amasomo yoroheje ateganyijwe mu biruhuko cyangwa muri wikendi',
            'Ubufatanye n\'inzego z\'uburezi n\'amashuri akomeye mu Rwanda',
            'Gushyigikira ubukangurambaga bwa Gerayo Amahoro',
            'Uburyo bwihariye bwo kwishyura buhoro buhoro',
          ]
        : [
            'Flexible holiday bootcamps & weekend theory crash courses',
            'Direct partnership with secondary schools and higher learning institutes',
            'Full alignment with the national Gerayo Amahoro safety curriculum',
            'Subsidized installment tuition for student associations',
          ],
    },
    {
      badge: isRw ? 'Ibigo n\'Inganda' : 'Corporate Fleet',
      title: isRw ? 'Amahugurwa y\'Abashoferi b\'Ibigo n\'Imishinga' : 'Corporate Fleet & Defensive Safety',
      desc: isRw
        ? 'Gutoza no gusuzuma abashoferi b\'ibigo by\'ubucuruzi, imiryango itegamiye kuri Leta (NGOs), na za Minisiteri mu kwirinda impanuka no kubungabunga ibinyabiziga.'
        : 'Custom enterprise programs for transport fleets, NGOs, and corporate teams focused on defensive driving, hazard prevention, fuel economics, and risk audits.',
      highlights: isRw
        ? [
            'Isuzumabushobozi ry\'abashoferi mbere yo kubaha akazi',
            'Amasomo yo kwirinda impanuka no gutwara mu bihe bitoroshye',
            'Uburyo bwo kuzigama lisanzi no kubungabunga moteri',
            'Raporo irambuye y\'imyitwarire y\'umushoferi (Driver Risk Audit)',
          ]
        : [
            'Pre-employment driving competency and reaction assessments',
            'Defensive road safety, extreme weather, and night driving drills',
            'Eco-driving techniques to optimize fuel efficiency & maintenance',
            'Comprehensive corporate driver safety and compliance audit report',
          ],
    },
    {
      badge: isRw ? 'Abarimu b\'Umwuga' : 'Master Instructors',
      title: isRw ? 'Kunoza Ubushobozi bw\'Abarimu (Instructor Academy)' : 'Instructor Pedagogy & Certification',
      desc: isRw
        ? 'Amahugurwa ku barimu basanzwe bigisha gutwara ibinyabiziga ku buryo bwo kwigisha bugezweho, imyitwarire n\'ubutabazi bw\'ibanze.'
        : 'Continuing professional education for driving tutors covering modern pedagogical methods, road psychology, candidate stress management, and first aid.',
      highlights: isRw
        ? [
            'Uburyo bwo gusobanurira amategeko abanyeshuri bafite ingorane zo gusoma',
            'Ubutabazi bw\'ibanze mu gihe cy\'impanuka (First Aid Certification)',
            'Imikoreshereze y\'ibikoresho bigezweho by\'ikoranabuhanga',
            'Kwandikwa mu gitabo cy\'abarimu bemewe na Sifo Drive',
          ]
        : [
            'Inclusive teaching strategies for non-literate candidates',
            'Emergency road first-aid and trauma response certification',
            'Digital teaching tool mastery: simulators, tablet logs, video analysis',
            'Listing in the official Sifo Drive Verified Master Instructor directory',
          ],
    },
  ];

  // Determine media for background
  const hasCustomBg = Boolean(schoolProgramConfig.useCustomBackground);
  const bgType = schoolProgramConfig.backgroundType || 'slideshow';

  const isVideoMedia =
    hasCustomBg &&
    (bgType === 'video' || (bgType === 'slideshow' && activeSlide?.mediaType === 'video'));

  const activeVideoSrc =
    bgType === 'video' ? schoolProgramConfig.videoUrl : (activeSlide?.mediaUrl || schoolProgramConfig.videoUrl);

  const activeImageSrc =
    bgType === 'image'
      ? (schoolProgramConfig.imageBgUrl || '/default-public-bg.jpg')
      : (activeSlide?.mediaType === 'image' ? activeSlide.mediaUrl : (activeSlide?.posterUrl || schoolProgramConfig.videoPosterUrl || '/default-public-bg.jpg'));

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: isDark ? '#0b0f17' : '#f8fafc' }}>
      {/* If custom independent background is NOT enabled, render the standard platform background */}
      {!hasCustomBg && <PublicPageBackground />}

      <Navbar />

      {/* ── HERO SECTION WITH ALU-STYLE INDEPENDENT BACKGROUND ── */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: hasCustomBg ? 'clamp(580px, 82vh, 760px)' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          padding: hasCustomBg ? '0' : '60px 24px 70px 24px',
        }}
      >
        {/* Background Media Layer (Looping Video or High-Res Slide) */}
        {hasCustomBg && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              zIndex: 0,
            }}
          >
            {isVideoMedia && !videoError ? (
              <video
                key={activeVideoSrc}
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                onError={() => setVideoError(true)}
                poster={activeSlide?.posterUrl || schoolProgramConfig.videoPosterUrl || '/default-public-bg.jpg'}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transform: 'scale(1.02)',
                  transition: 'opacity 0.6s ease-in-out',
                }}
              >
                <source src={activeVideoSrc} type="video/mp4" />
              </video>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${activeImageSrc})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: 'scale(1.02)',
                  transition: 'background-image 0.6s ease-in-out',
                }}
              />
            )}

            {/* Dark Scrim / Tint Overlay for Crisp Readability */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: `rgba(11, 15, 23, ${schoolProgramConfig.overlayOpacity ?? 0.60})`,
                zIndex: 1,
              }}
            />

            {/* Vignette / Bottom Gradient */}
            {schoolProgramConfig.overlayGradient && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to bottom, rgba(11, 15, 23, 0.4) 0%, rgba(11, 15, 23, 0.1) 40%, rgba(11, 15, 23, 0.95) 100%)',
                  zIndex: 2,
                }}
              />
            )}
          </div>
        )}

        {/* Carousel Navigation Arrows (Left & Right) */}
        {hasCustomBg && bgType === 'slideshow' && slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevSlide}
              aria-label="Previous Slide"
              style={{
                position: 'absolute',
                top: '48%',
                left: '20px',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronLeft size={26} />
            </button>

            <button
              type="button"
              onClick={handleNextSlide}
              aria-label="Next Slide"
              style={{
                position: 'absolute',
                top: '48%',
                right: '20px',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              <ChevronRight size={26} />
            </button>
          </>
        )}

        {/* Hero Content Area */}
        <div
          style={{
            position: 'relative',
            zIndex: 5,
            maxWidth: '1240px',
            width: '100%',
            margin: '0 auto',
            padding: hasCustomBg ? '90px 32px 40px 32px' : '0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          {hasCustomBg ? (
            /* Immersive ALU Style Hero Layout */
            <div style={{ maxWidth: '860px', animation: 'fadeIn 0.5s ease-in-out' }}>
              {/* Partner / Recognition Badge */}
              {(activeSlide?.badge || activeSlide?.badgeRw) && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.14)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#34d399',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    marginBottom: '22px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <Sparkles size={16} color="#34d399" />
                  <span>{isRw ? (activeSlide.badgeRw || activeSlide.badge) : (activeSlide.badge || activeSlide.badgeRw)}</span>
                </div>
              )}

              {/* ALU Style Giant Bold Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.3rem, 5.2vw, 4.4rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  marginBottom: '22px',
                  textShadow: '0 3px 18px rgba(0, 0, 0, 0.6)',
                }}
              >
                {isRw ? (activeSlide?.titleRw || activeSlide?.title) : (activeSlide?.title || activeSlide?.titleRw)}
              </h1>

              {/* Description Paragraph */}
              <p
                style={{
                  fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                  color: 'rgba(255, 255, 255, 0.92)',
                  maxWidth: '740px',
                  lineHeight: 1.65,
                  marginBottom: '36px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                  fontWeight: 500,
                }}
              >
                {isRw ? (activeSlide?.descriptionRw || activeSlide?.description) : (activeSlide?.description || activeSlide?.descriptionRw)}
              </p>

              {/* Call To Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href={activeSlide?.primaryBtnLink || '#enroll-institution'}
                  className="btn btn-primary"
                  style={{
                    padding: '16px 36px',
                    fontSize: '1.08rem',
                    fontWeight: 800,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 10px 25px rgba(5, 150, 105, 0.4)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                  }}
                >
                  <span>{isRw ? (activeSlide?.primaryBtnTextRw || 'Iyandikishe nk\'Ishuri') : (activeSlide?.primaryBtnText || 'Register Your School')}</span>
                  <ArrowRight size={18} />
                </a>

                <a
                  href={activeSlide?.secondaryBtnLink || '#pillars'}
                  style={{
                    padding: '16px 30px',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  }}
                >
                  <span>{isRw ? (activeSlide?.secondaryBtnTextRw || 'Reba Gahunda z\'Amasomo') : (activeSlide?.secondaryBtnText || 'Explore Academic Pillars')}</span>
                </a>
              </div>
            </div>
          ) : (
            /* Fallback Card Hero when independent background is disabled */
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
                  background: 'rgba(5, 150, 105, 0.1)',
                  border: '1px solid rgba(5, 150, 105, 0.25)',
                  color: '#059669',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  marginBottom: '20px',
                }}
              >
                <GraduationCap size={16} />
                <span>{isRw ? 'GAHUNDA Y\'AMASHURI N\'IBIGO' : 'INSTITUTIONAL & ACADEMY PROGRAMS'}</span>
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
                {isRw ? 'Guteza Imbere Amashuri yo Gutwara n\'' : 'Standardizing Road Safety Across'}{' '}
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
                  {isRw ? 'Ubumenyi bw\'Urubyiruko' : 'Schools & Enterprises'}
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
                  ? 'Sifo Drive ifatanya n\'amashuri yo gutwara ibinyabiziga (Auto-écoles), amashuri yisumbuye, za kaminuza n\'ibigo by\'ubucuruzi mu gutanga amasomo meza, gukoresha ibizamini bya Polisi, no kubaka abashoferi bafite umuco wo kubaha umuhanda.'
                  : 'Partnering with driving academies, educational institutions, and enterprise fleets to deliver accredited curriculum, automated testing infrastructure, and national road safety certification.'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <a
                  href="#enroll-institution"
                  className="btn btn-primary"
                  style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 'var(--radius-xl)' }}
                >
                  <span>{isRw ? 'Injiza Ishuri ryawe muri Sifo' : 'Partner Your School or Fleet'}</span>
                  <ArrowRight size={18} />
                </a>
                <Link
                  to="/pricing"
                  className="btn btn-secondary"
                  style={{ padding: '14px 28px', fontSize: '1.05rem', fontWeight: 600, borderRadius: 'var(--radius-xl)' }}
                >
                  <span>{isRw ? 'Reba Ibiciro by\'Amashuri' : 'View Institutional Pricing'}</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Bottom ALU-Style Brand Ribbon & Slide Indicators */}
        {hasCustomBg && (
          <div style={{ position: 'relative', zIndex: 6, width: '100%' }}>
            {/* Slide Pagination Dots / Progress Bars */}
            {bgType === 'slideshow' && slides.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  paddingBottom: '20px',
                }}
              >
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    style={{
                      height: '8px',
                      width: currentSlideIndex === idx ? '38px' : '12px',
                      borderRadius: '999px',
                      background: currentSlideIndex === idx ? '#34d399' : 'rgba(255, 255, 255, 0.4)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: currentSlideIndex === idx ? '0 0 12px rgba(52, 211, 153, 0.6)' : 'none',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Bottom Accent Strip (Inspired by ALU's Bottom Graphic Banner) */}
            <div
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #059669 0%, #047857 50%, #0284c7 100%)',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '16px',
                color: '#ffffff',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <School size={20} color="#ffffff" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                  {isRw ? 'Amashuri 40+ Yemewe mu Gihugu' : '40+ Accredited Driving Academies'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={20} color="#ffffff" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                  {isRw ? 'Abanyeshuri 15,000+ Biyandikishije' : '15,000+ Candidates Enrolled'}
                </span>
              </div>

              <a
                href="#enroll-institution"
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  textDecoration: 'none',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '6px 16px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{isRw ? 'Iyandikishe Ubu' : 'Register Now'}</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Program Pillars */}
      <section id="pillars" style={{ padding: '60px 24px 80px 24px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '12px', color: isDark ? '#ffffff' : '#0f172a' }}>
            {isRw ? 'Gahunda Zihariye z\'Amashuri' : 'Our Academic & Enterprise Pillars'}
          </h2>
          <p style={{ color: isDark ? '#94a3b8' : '#64748b', maxWidth: '620px', margin: '0 auto', fontSize: '1.05rem' }}>
            {isRw
              ? 'Buri gahunda itegurwa hashingiwe ku Iteka rya Perezida No 85/01 n\'amabwiriza ya Polisi y\'Igihugu.'
              : 'Every program is built directly on Presidential Order No. 85/01 and official Rwanda National Police testing standards.'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          {programs.map((prog, idx) => (
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
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '999px',
                    background: 'rgba(5, 150, 105, 0.1)',
                    color: '#059669',
                    border: '1px solid rgba(5, 150, 105, 0.2)',
                  }}
                >
                  {prog.badge}
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '10px', color: isDark ? '#ffffff' : '#0f172a' }}>
                {prog.title}
              </h3>
              <p style={{ fontSize: '0.94rem', color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                {prog.desc}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {prog.highlights.map((pt, pIdx) => (
                  <li key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                    <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional Partnership Registration Form (Applying Page Portal) */}
      <section id="enroll-institution" style={{ padding: '60px 24px 90px 24px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
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
            <Building2 size={36} color="#059669" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '8px' }}>
              {isRw ? 'Injiza Ishuri cyangwa Ikigo cyawe' : 'Register Your Institution or School'}
            </h3>
            <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.98rem' }}>
              {isRw
                ? 'Tuzaguha konti y\'ishuri (School Admin Dashboard), aho uzajya winjiza abanyeshuri bawe bakanakora ibizamini bya Polisi.'
                : 'Connect your driving academy or organization to receive dedicated admin credentials, student seats, and official reporting.'}
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
                {isRw ? 'Kwiyandikisha kwakiriwe neza!' : 'Registration Successfully Received!'}
              </h4>
              <p style={{ color: isDark ? '#cbd5e1' : '#334155', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                {isRw
                  ? `Urakoze cyane. Umuyobozi ushinzwe amashuri n'ibigo azakuvugisha kuri telefone ${formState.phone} aguhe uburyo bwo gutangira.`
                  : `Thank you for choosing Sifo Drive. Our institutional partnership director will contact you via ${formState.phone} to finalize onboarding.`}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSubmitted(false)}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                {isRw ? 'Ohereza ukundi kwiyandikisha' : 'Submit Another Registration'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Izina ry\'Ishuri cyangwa Ikigo' : 'Institution / Academy Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sifo Auto-Ecole Kigali"
                    value={formState.institutionName}
                    onChange={(e) => setFormState({ ...formState, institutionName: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Amazina y\'Uhagarariye Ikigo' : 'Contact Person & Title'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jean Paul Habimana (Director)"
                    value={formState.contactPerson}
                    onChange={(e) => setFormState({ ...formState, contactPerson: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Telefone y\'Akazi' : 'Phone Number'} *
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Imeri (Email)' : 'Official Email'} *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="director@school.rw"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Ubwoko bw\'Ikigo' : 'Institution Type'} *
                  </label>
                  <select
                    value={formState.institutionType}
                    onChange={(e) => setFormState({ ...formState, institutionType: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="auto_school">{isRw ? 'Ishuri ryigisha gutwara (Driving Academy)' : 'Licensed Driving School'}</option>
                    <option value="high_school">{isRw ? 'Ishuri ryisumbuye (High School / TVET)' : 'Secondary / TVET School'}</option>
                    <option value="university">{isRw ? 'Kaminuza cyangwa Ishuri Rikuru' : 'University / Higher Institute'}</option>
                    <option value="corporate">{isRw ? 'Ikigo cy\'Ubucuruzi cyangwa NGO (Corporate Fleet)' : 'Corporate Company or NGO'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                    {isRw ? 'Umubare w\'Abanyeshuri ku Kwezi' : 'Estimated Monthly Students'} *
                  </label>
                  <select
                    value={formState.studentVolume}
                    onChange={(e) => setFormState({ ...formState, studentVolume: e.target.value })}
                    className="input"
                    style={{ width: '100%' }}
                  >
                    <option value="10-50">10 - 50 {isRw ? 'banyeshuri' : 'students'}</option>
                    <option value="50-200">50 - 200 {isRw ? 'banyeshuri' : 'students'}</option>
                    <option value="200-500">200 - 500 {isRw ? 'banyeshuri' : 'students'}</option>
                    <option value="500+">500+ {isRw ? 'banyeshuri (Large Network)' : 'students'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '6px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                  {isRw ? 'Icyo Wifuza By\'umwihariko' : 'Specific Needs or Integration Inquiries'}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    isRw
                      ? 'e.g. Twifuza guhuza amashami yacu 3 y\'i Kigali n\'i Musanze...'
                      : 'e.g. We have 3 branch campuses across Kigali and Musanze and wish to deploy digital theory classrooms...'
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
                <span>{isRw ? 'Ohereza Dosiye y\'Ikigo' : 'Submit Institutional Registration'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
