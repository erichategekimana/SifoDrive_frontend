import React from 'react';
import {
  BookOpen,
  PlayCircle,
  Compass,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  GraduationCap,
  Sparkles,
  Video,
} from 'lucide-react';
import { Course, type CourseHomepageData } from '../../../../core/models/Course';

interface RenderCourseHomepageProps {
  course: Course;
  homepageData: CourseHomepageData;
  onNavigateTab?: (tab: string, targetId?: string) => void;
  onOpenLesson?: (lessonId: string) => void;
  role?: 'STUDENT' | 'TUTOR' | 'PREVIEW';
  isPreview?: boolean;
}

export const RenderCourseHomepage: React.FC<RenderCourseHomepageProps> = ({
  course,
  homepageData,
  onNavigateTab,
  onOpenLesson,
  role = 'STUDENT',
  isPreview = false,
}) => {
  const blocks = homepageData.blocks || [];
  const banner = homepageData.banner;

  const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || course.lessonsCount || 0;
  const totalModules = course.modules?.length || course.modulesCount || 0;

  const hasHeroBannerInBlocks = blocks.some((b) => b.type === 'hero_banner' || b.type === 'banner');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '24px' }}>
      {/* Role Dashboard Perspective Pill in Preview Mode Only (Training Admin Preview) */}
      {isPreview && role === 'STUDENT' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderRadius: '6px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            fontSize: '0.82rem',
            color: '#1D4ED8',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={16} color="#2563EB" />
            <span>Student Dashboard Perspective • Enrolled Learner</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
            <Clock size={13} />
            <span>Estimated completion: ~{course.estimatedHours} hrs</span>
          </div>
        </div>
      )}

      {isPreview && role === 'TUTOR' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderRadius: '6px',
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
            fontSize: '0.82rem',
            color: '#6D28D9',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#7C3AED" />
            <span>Instructor / Tutor Dashboard Perspective • Course Lead</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onNavigateTab && onNavigateTab('announcements')}
              className="canvas-btn canvas-btn-secondary"
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              Post Announcement
            </button>
            <button
              onClick={() => onNavigateTab && onNavigateTab('people')}
              className="canvas-btn canvas-btn-secondary"
              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
            >
              View Learners Roster
            </button>
          </div>
        </div>
      )}

      {/* Legacy Fallback: Only render if NO hero_banner block exists in blocks */}
      {!hasHeroBannerInBlocks && banner && (
        <div
          style={{
            borderRadius: '6px',
            overflow: 'hidden',
            background: banner.gradient || 'linear-gradient(135deg, #07192F 0%, #0D2C54 50%, #173E73 100%)',
            color: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(0, 33, 71, 0.18)',
            border: '1px solid #1E3A5F',
            width: '100%',
          }}
        >
          <div
            style={{
              padding: '36px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {banner.badge && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(217, 56, 30, 0.3)',
                  border: '1px solid rgba(217, 56, 30, 0.6)',
                  padding: '4px 12px',
                  borderRadius: '3px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#FF6B6B',
                  marginBottom: '14px',
                  width: 'fit-content',
                }}
              >
                <ShieldCheck size={14} color="#FF6B6B" />
                <span>{banner.badge.toUpperCase()}</span>
              </div>
            )}

            <h1
              style={{
                fontSize: '2.1rem',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '0 0 10px 0',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
              }}
            >
              {banner.title || course.title}
            </h1>

            <p
              style={{
                fontSize: '0.98rem',
                color: '#E0E7FF',
                margin: '0 0 20px 0',
                maxWidth: '750px',
                lineHeight: 1.5,
              }}
            >
              {banner.subtitle || course.description || 'Welcome to this driving theory curriculum.'}
            </p>

            {banner.showStats !== false && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                  paddingTop: '16px',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} color="#60A5FA" />
                  <span><strong>{totalModules}</strong> Modules</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} color="#34D399" />
                  <span><strong>{totalLessons}</strong> Total Lessons</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#FBBF24" />
                  <span>~<strong>{course.estimatedHours || 12}</strong> Study Hours</span>
                </div>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('modules')}
                  className="canvas-btn"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#0D2C54',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    padding: '6px 16px',
                    borderRadius: '4px',
                    marginLeft: 'auto',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <span>Explore Modules</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Structured Custom Blocks */}
      {blocks.map((block) => {
        // HERO BANNER / BLUE CONTAINER BLOCK (Fully editable, removable, insertable)
        if (block.type === 'hero_banner' || block.type === 'banner') {
          const bg = block.bannerGradient || block.bannerBgColor || block.gradient || 'linear-gradient(135deg, #07192F 0%, #0D2C54 50%, #173E73 100%)';
          const showBadge = block.showBadge !== false;
          const badgeText = block.badgeText || block.badge || 'Official RNP Provisional Curriculum';
          const badgeTextColor = block.badgeTextColor || '#FF6B6B';
          const badgeBgColor = block.badgeBgColor || 'rgba(217, 56, 30, 0.25)';
          const title = block.title || course.title || 'Road Regulations & Traffic Signs';
          const subtitle = block.subtitle || block.content || course.description || 'Master Rwanda driving legislation, roundabout circulation, right-of-way priority, and road signage to ensure passing your provisional theory exam on the first attempt.';
          const showStats = block.showStats !== false;
          const heroCard1Badge = block.heroCard1Badge ?? 'STOP';
          const heroCard1Title = block.heroCard1Title ?? 'Regulatory Priority';
          const heroCard1Subtitle = block.heroCard1Subtitle ?? 'Article 34 - Full stop & yield';
          const showHeroCard1 = block.showHeroCard1 !== false;

          const heroCard2Icon = block.heroCard2Icon || 'compass';
          const heroCard2Title = block.heroCard2Title ?? 'Roundabout Circulation';
          const heroCard2Subtitle = block.heroCard2Subtitle ?? 'Priority to circulating traffic';
          const showHeroCard2 = block.showHeroCard2 !== false;

          const heroPassingRateLabel = block.heroPassingRateLabel ?? 'RNP Passing Rate';
          const heroPassingRateValue = block.heroPassingRateValue ?? '88% Minimum (18/20)';
          const showHeroPassingRate = block.showHeroPassingRate !== false;

          const showHeroStatsSummary = block.showHeroStatsSummary !== false;
          const heroStatsSummaryText = block.heroStatsSummaryText;

          const hasAnyRightCards = showHeroCard1 || showHeroCard2 || showHeroPassingRate || showHeroStatsSummary;

          const buttons = (block.buttons && block.buttons.length > 0)
            ? block.buttons
            : [
                { id: 'btn-mod', label: 'Go to Modules', actionType: 'modules' as const, style: 'red_primary' as const },
                { id: 'btn-live', label: 'Live Class Schedule', actionType: 'live' as const, style: 'glass_outline' as const },
              ];

          return (
            <div
              key={block.id}
              style={{
                borderRadius: '6px',
                overflow: 'hidden',
                background: bg,
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(0, 33, 71, 0.18)',
                border: '1px solid #1E3A5F',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: (showStats && hasAnyRightCards) ? '1.35fr 1fr' : '1fr',
                  minHeight: '260px',
                  position: 'relative',
                }}
              >
                {/* Banner Left: Typography & Badges & Action Buttons */}
                <div
                  style={{
                    padding: '36px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    zIndex: 2,
                  }}
                >
                  {showBadge && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: badgeBgColor,
                        border: `1px solid ${badgeTextColor}66`,
                        padding: '4px 12px',
                        borderRadius: '3px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: badgeTextColor,
                        marginBottom: '14px',
                        width: 'fit-content',
                      }}
                    >
                      <ShieldCheck size={14} color={badgeTextColor} />
                      <span>{badgeText.toUpperCase()}</span>
                    </div>
                  )}

                  <h1
                    style={{
                      fontSize: '2.1rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      margin: '0 0 10px 0',
                      lineHeight: 1.2,
                      letterSpacing: '-0.02em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {title}
                  </h1>

                  <p
                    style={{
                      fontSize: '0.96rem',
                      color: '#E0E7FF',
                      margin: '0 0 20px 0',
                      maxWidth: '700px',
                      lineHeight: 1.5,
                    }}
                  >
                    {subtitle}
                  </p>

                  {/* Configurable Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {buttons.map((btn) => {
                      const isRed = btn.style === 'red_primary';
                      const isBlue = btn.style === 'blue_primary';
                      const isWhite = btn.style === 'white';

                      let bgBtn = 'rgba(255, 255, 255, 0.12)';
                      let colorBtn = '#FFFFFF';
                      let borderBtn = '1px solid rgba(255, 255, 255, 0.3)';

                      if (isRed) {
                        bgBtn = '#D9381E';
                        colorBtn = '#FFFFFF';
                        borderBtn = '1px solid #D9381E';
                      } else if (isBlue) {
                        bgBtn = '#0055A5';
                        colorBtn = '#FFFFFF';
                        borderBtn = '1px solid #0055A5';
                      } else if (isWhite) {
                        bgBtn = '#FFFFFF';
                        colorBtn = '#0D2C54';
                        borderBtn = '1px solid #FFFFFF';
                      }

                      const handleBtnClick = () => {
                        if (btn.actionType === 'modules') {
                          onNavigateTab && onNavigateTab('modules');
                        } else if (btn.actionType === 'live') {
                          onNavigateTab && onNavigateTab('live');
                        } else if (btn.actionType === 'announcements') {
                          onNavigateTab && onNavigateTab('announcements');
                        } else if (btn.actionType === 'syllabus') {
                          onNavigateTab && onNavigateTab('syllabus');
                        } else if (btn.actionType === 'lesson' && btn.target) {
                          onOpenLesson ? onOpenLesson(btn.target) : (onNavigateTab && onNavigateTab('modules'));
                        } else if (btn.actionType === 'url' && btn.target) {
                          window.open(btn.target, '_blank');
                        } else {
                          onNavigateTab && onNavigateTab('modules');
                        }
                      };

                      return (
                        <button
                          key={btn.id}
                          onClick={handleBtnClick}
                          className="canvas-btn"
                          style={{
                            backgroundColor: bgBtn,
                            color: colorBtn,
                            border: borderBtn,
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 18px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {btn.actionType === 'modules' && <BookOpen size={16} />}
                          {btn.actionType === 'live' && <Video size={16} />}
                          {btn.actionType === 'url' && <ExternalLink size={16} />}
                          {btn.actionType === 'lesson' && <PlayCircle size={16} />}
                          <span>{btn.label}</span>
                          {isRed && <ArrowRight size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Banner Right: Road Graphics Mockup & Quick Stats */}
                {showStats && hasAnyRightCards && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '24px 32px',
                      background: 'linear-gradient(90deg, rgba(7, 25, 47, 0) 0%, rgba(13, 44, 84, 0.7) 100%)',
                      gap: '12px',
                    }}
                  >
                    {showHeroCard1 && (
                      <div
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div
                          style={{
                            minWidth: '36px',
                            height: '36px',
                            padding: '0 6px',
                            borderRadius: '4px',
                            backgroundColor: '#D9381E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '0.78rem',
                            color: '#FFFFFF',
                            flexShrink: 0,
                          }}
                        >
                          {heroCard1Badge}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>{heroCard1Title}</div>
                          <div style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>{heroCard1Subtitle}</div>
                        </div>
                      </div>
                    )}

                    {showHeroCard2 && (
                      <div
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '6px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#0055A5',
                            border: '2px solid #FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {heroCard2Icon === 'shield' && <ShieldCheck size={18} color="#FFFFFF" />}
                          {heroCard2Icon === 'check' && <CheckCircle2 size={18} color="#FFFFFF" />}
                          {heroCard2Icon === 'star' && <Sparkles size={18} color="#FFFFFF" />}
                          {heroCard2Icon === 'car' && <Layers size={18} color="#FFFFFF" />}
                          {(heroCard2Icon === 'compass' || !['shield', 'check', 'star', 'car'].includes(heroCard2Icon)) && (
                            <Compass size={18} color="#FFFFFF" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>{heroCard2Title}</div>
                          <div style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>{heroCard2Subtitle}</div>
                        </div>
                      </div>
                    )}

                    {showHeroPassingRate && (
                      <div
                        style={{
                          backgroundColor: 'rgba(5, 135, 40, 0.2)',
                          border: '1px solid rgba(5, 135, 40, 0.45)',
                          borderRadius: '6px',
                          padding: '9px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '0.76rem', color: '#86EFAC', fontWeight: 600 }}>{heroPassingRateLabel}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>{heroPassingRateValue}</span>
                      </div>
                    )}

                    {/* Stats summary bar */}
                    {showHeroStatsSummary && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '8px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                          fontSize: '0.78rem',
                          color: '#CBD5E1',
                        }}
                      >
                        {heroStatsSummaryText ? (
                          <span>{heroStatsSummaryText}</span>
                        ) : (
                          <>
                            <span><strong>{totalModules}</strong> Modules</span>
                            <span>•</span>
                            <span><strong>{totalLessons}</strong> Lessons</span>
                            <span>•</span>
                            <span>~<strong>{course.estimatedHours || 12}</strong> Study Hrs</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }

        // TEXT BLOCK
        if (block.type === 'text') {
          const isCallout = Boolean(block.bgColor);
          const fontFamily = block.fontFamily || 'Inter, -apple-system, sans-serif';
          const fontSize = block.fontSize ? `${block.fontSize}px` : '15px';
          const fontWeight = block.isBold ? 700 : 400;
          const fontStyle = block.isItalic ? 'italic' : 'normal';
          const textDecoration = block.isUnderline ? 'underline' : 'none';
          const textAlign = block.textAlign || 'left';
          const color = block.textColor || '#2D3B45';

          return (
            <div
              key={block.id}
              style={{
                padding: isCallout ? '20px 24px' : '6px 0',
                backgroundColor: block.bgColor || 'transparent',
                borderRadius: isCallout ? '6px' : '0',
                borderLeft: isCallout ? `4px solid ${block.textColor || '#0055A5'}` : 'none',
                boxShadow: isCallout ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {block.title && (
                <h3
                  style={{
                    margin: '0 0 10px 0',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: block.textColor || '#133873',
                    fontFamily,
                  }}
                >
                  {block.title}
                </h3>
              )}
              <div
                style={{
                  fontFamily,
                  fontSize,
                  fontWeight,
                  fontStyle,
                  textDecoration,
                  textAlign,
                  color,
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {block.content}
              </div>
            </div>
          );
        }

        // IMAGE BLOCK (with resize & crop rendering)
        if (block.type === 'image') {
          const widthPct = block.imageWidth || 100;
          const align = block.textAlign || 'center';
          const radius = block.imageCropRatio === 'round' ? '50%' : `${block.imageRadius ?? 8}px`;

          let aspectRatio = 'auto';
          if (block.imageCropRatio === '16:9') aspectRatio = '16 / 9';
          else if (block.imageCropRatio === '4:3') aspectRatio = '4 / 3';
          else if (block.imageCropRatio === '1:1' || block.imageCropRatio === 'round') aspectRatio = '1 / 1';

          return (
            <div
              key={block.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
                width: '100%',
                margin: '12px 0',
              }}
            >
              <div
                style={{
                  width: `${widthPct}%`,
                  maxWidth: '100%',
                  borderRadius: radius,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  aspectRatio,
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {block.imageUrl ? (
                  <img
                    src={block.imageUrl}
                    alt={block.imageCaption || block.title || 'Course Image'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: block.imageCropRatio && block.imageCropRatio !== 'free' ? 'cover' : 'contain',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                    <Compass size={32} style={{ margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Image placeholder</p>
                  </div>
                )}
              </div>
              {block.imageCaption && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: '#64748B',
                    margin: '8px 0 0 0',
                    fontStyle: 'italic',
                    textAlign: align,
                    maxWidth: `${widthPct}%`,
                  }}
                >
                  {block.imageCaption}
                </p>
              )}
            </div>
          );
        }

        // MODULE ATTACHMENT BLOCK
        if (block.type === 'module_attach') {
          const mod = course.modules?.find((m) => m.id === block.moduleId);
          const title = block.title || mod?.title || 'Course Module';
          const lessonsCount = mod?.lessons?.length ?? 0;

          return (
            <div
              key={block.id}
              className="canvas-card"
              style={{
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderLeft: '4px solid #0055A5',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    backgroundColor: '#E0F2FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={20} color="#0055A5" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: '#EDE9FE',
                        color: '#6D28D9',
                      }}
                    >
                      Attached Module
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {lessonsCount} {lessonsCount === 1 ? 'Lesson' : 'Lessons'}
                    </span>
                  </div>
                  <h4 style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>
                    {title}
                  </h4>
                  {block.content && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#64748B' }}>
                      {block.content}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => onNavigateTab && onNavigateTab('modules', block.moduleId)}
                className="canvas-btn canvas-btn-primary"
                style={{ fontSize: '0.82rem', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Open Module</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        }

        // LESSON ATTACHMENT BLOCK
        if (block.type === 'lesson_attach') {
          return (
            <div
              key={block.id}
              className="canvas-card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderLeft: '4px solid #10B981',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#D1FAE5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlayCircle size={20} color="#059669" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '1px 6px', borderRadius: '3px' }}>
                      Featured Lesson Material
                    </span>
                    {block.lessonDuration && (
                      <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        ~{block.lessonDuration} min
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: '3px 0 0 0', fontSize: '0.96rem', fontWeight: 700, color: '#1E293B' }}>
                    {block.lessonTitle || block.title || 'Lesson Resource'}
                  </h4>
                  {block.content && (
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                      {block.content}
                    </p>
                  )}
                </div>
              </div>

              {block.lessonId && (
                <button
                  onClick={() => onOpenLesson ? onOpenLesson(block.lessonId!) : (onNavigateTab && onNavigateTab('modules'))}
                  className="canvas-btn canvas-btn-primary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Start Lesson</span>
                  <ExternalLink size={13} />
                </button>
              )}
            </div>
          );
        }

        // QUICK ACTIONS / RESOURCES BLOCK
        if (block.type === 'resources' && block.links && block.links.length > 0) {
          return (
            <div key={block.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {block.title && (
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#133873' }}>
                  {block.title}
                </h3>
              )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '14px',
                }}
              >
                {block.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      textDecoration: 'none',
                      color: 'inherit',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0055A5';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        backgroundColor: '#F0F9FF',
                        color: '#0284C7',
                        display: 'flex',
                      }}
                    >
                      <ExternalLink size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                        {link.title}
                      </div>
                      {link.description && (
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                          {link.description}
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        }

        // OUTCOMES / CHECKLIST BLOCK
        if (block.type === 'outcomes') {
          const items = (block.content || '').split('\n').filter((l) => l.trim().length > 0);
          return (
            <div
              key={block.id}
              className="canvas-card"
              style={{
                padding: '24px 28px',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
              }}
            >
              <h3
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#133873',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles size={18} color="#D97706" />
                <span>{block.title || 'Course Learning Outcomes'}</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((outcome, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                      {outcome.replace(/^[•\-\*]\s*/, '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
