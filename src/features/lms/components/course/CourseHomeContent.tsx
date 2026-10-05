import React from 'react';
import {
  Clock,
  Video,
  ArrowRight,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { Course } from '../../../../core/models/Course';
import { RenderCourseHomepage } from './RenderCourseHomepage';

interface CourseHomeContentProps {
  course: Course;
  onNavigateTab: (tab: any, targetId?: string) => void;
  onOpenLesson?: (lessonId: string) => void;
}

export const CourseHomeContent: React.FC<CourseHomeContentProps> = ({
  course,
  onNavigateTab,
  onOpenLesson,
}) => {
  const homeData = course.homepageData || (course as any).homepage_data;
  if (homeData?.blocks && homeData.blocks.length > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <h1
          style={{
            fontSize: '2.35rem',
            fontWeight: 700,
            color: '#133873',
            margin: '0 0 20px 0',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {course.title}
        </h1>
        <RenderCourseHomepage
          course={course}
          homepageData={homeData}
          onNavigateTab={onNavigateTab}
          onOpenLesson={onOpenLesson}
          isPreview={false}
        />
      </div>
    );
  }

  const learningOutcomes = [
    'Configure safe driving habits and master right-of-way priority rules at intersections, roundabouts, and multi-lane junctions according to the Rwanda Highway Code.',
    'Accurately identify and interpret regulatory, danger, warning, priority, and informative traffic signs and road markings.',
    'Calculate safe stopping distances, following intervals, and lawful speed limits across urban, highway, and adverse weather conditions.',
    'Understand critical vehicle mechanical safety requirements, mandatory safety equipment, and emergency breakdown protocols.',
    'Pass the official 20-question driving theory provisional license exam with an 88%+ score (18/20 minimum).',
  ];

  const cohortSchedules = [
    {
      cohort: 'Cohort Alpha (Evening)',
      introSession: 'Monday & Wednesday • 18:00 - 19:30 CAT',
      qaSession: 'Friday • 18:30 - 20:00 CAT',
      instructor: 'Claude Kamanzi (Theory Lead)',
      status: 'Active',
      meetLink: 'https://meet.google.com/sifo-drive-alpha',
    },
    {
      cohort: 'Cohort Beta (Night)',
      introSession: 'Tuesday & Thursday • 19:30 - 21:00 CAT',
      qaSession: 'Saturday • 17:00 - 18:30 CAT',
      instructor: 'Jeanette Mukamana (Road Signs Specialist)',
      status: 'Active',
      meetLink: 'https://meet.google.com/sifo-drive-beta',
    },
    {
      cohort: 'Weekend Intensive',
      introSession: 'Saturday • 09:00 - 12:00 CAT',
      qaSession: 'Sunday • 14:00 - 16:00 CAT',
      instructor: 'Claude Kamanzi & Guest Officers',
      status: 'Enrolling',
      meetLink: 'https://meet.google.com/sifo-drive-weekend',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Authentic Canvas Course Title Heading */}
      <h1
        style={{
          fontSize: '2.35rem',
          fontWeight: 700,
          color: '#133873',
          margin: '0 0 20px 0',
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}
      >
        {course.title || 'Road Regulations & Traffic Signs'}
      </h1>

      {/* 2. Wide Hero Banner matching Canvas LMS reference image */}
      <div
        style={{
          borderRadius: '4px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #07192F 0%, #0D2C54 50%, #173E73 100%)',
          color: '#FFFFFF',
          boxShadow: '0 4px 14px rgba(0, 33, 71, 0.15)',
          border: '1px solid #1E3A5F',
          width: '100%',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            minHeight: '260px',
            position: 'relative',
          }}
        >
          {/* Banner Left: Typography & Badges */}
          <div
            style={{
              padding: '32px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(217, 56, 30, 0.25)',
                border: '1px solid rgba(217, 56, 30, 0.5)',
                color: '#FF6B6B',
                padding: '4px 12px',
                borderRadius: '2px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                width: 'fit-content',
                marginBottom: '12px',
              }}
            >
              <ShieldCheck size={14} />
              <span>Official Driving Theory Curriculum</span>
            </div>

            <h2
              style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0 0 10px 0',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
              }}
            >
              {course.title || 'Road Regulations & Traffic Signs'}
            </h2>

            <p
              style={{
                fontSize: '0.94rem',
                color: '#CBD5E1',
                margin: '0 0 18px 0',
                lineHeight: 1.5,
                maxWidth: '520px',
              }}
            >
              Master Rwanda driving legislation, roundabout circulation, right-of-way priority, and road signage to ensure passing your provisional theory exam on the first attempt.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigateTab('modules')}
                className="canvas-btn"
                style={{
                  backgroundColor: '#D9381E',
                  color: '#FFFFFF',
                  borderColor: '#D9381E',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  borderRadius: '3px',
                }}
              >
                <BookOpen size={16} />
                <span>Go to Modules</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => onNavigateTab('live')}
                className="canvas-btn"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '3px',
                }}
              >
                <Video size={16} />
                <span>Live Class Schedule</span>
              </button>
            </div>
          </div>

          {/* Banner Right: Road Graphics Mockup */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 32px',
              position: 'relative',
              background: 'linear-gradient(90deg, rgba(7, 25, 47, 0) 0%, rgba(13, 44, 84, 0.7) 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%',
                maxWidth: '280px',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '4px',
                    backgroundColor: '#D9381E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    color: '#FFFFFF',
                    flexShrink: 0,
                  }}
                >
                  STOP
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>Regulatory Priority</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Article 34 - Full stop & yield</div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#0055A5',
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Compass size={20} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#FFFFFF' }}>Roundabout Circulation</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Priority to circulating traffic</div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(5, 135, 40, 0.15)',
                  border: '1px solid rgba(5, 135, 40, 0.4)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#86EFAC', fontWeight: 600 }}>Theory Passing Rate</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>88% Minimum</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Red Expectation Statement matching Canvas reference */}
      <p
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#C22B14',
          margin: '18px 0 16px 0',
          lineHeight: 1.5,
        }}
      >
        Students are expected to lead the learning process with 100% engagement, the Instructor ONLY guides the students.
      </p>

      {/* 4. Course Overview Paragraphs */}
      <p
        style={{
          fontSize: '1.02rem',
          color: '#2D3B45',
          lineHeight: 1.65,
          margin: '0 0 14px 0',
        }}
      >
        Welcome to the <strong>Road Regulations and Traffic Signs</strong> course on Sifo Drive. This curriculum is engineered to equip future drivers in Rwanda with rock-solid mastery of traffic safety rules, intersection priorities, and vehicle safety norms under presidential order and standard driving regulations.
      </p>
      <p
        style={{
          fontSize: '1.02rem',
          color: '#2D3B45',
          lineHeight: 1.65,
          margin: '0 0 24px 0',
        }}
      >
        This course aims to equip learners with the knowledge and defensive driving judgment necessary to pass the official computer-based theory examination on their very first attempt.
      </p>

      {/* 5. Learning Outcomes matching Canvas reference */}
      <h3
        style={{
          fontSize: '1.08rem',
          fontWeight: 700,
          color: '#C22B14',
          margin: '0 0 14px 0',
        }}
      >
        After completing this course, students should:
      </h3>

      <ul
        style={{
          paddingLeft: '24px',
          margin: '0 0 28px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {learningOutcomes.map((outcome, idx) => (
          <li
            key={idx}
            style={{
              fontSize: '1rem',
              color: '#2D3B45',
              lineHeight: 1.65,
            }}
          >
            {outcome}
          </li>
        ))}
      </ul>

      {/* 6. Course Logistics matching Canvas reference */}
      <h3
        style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          color: '#133873',
          margin: '8px 0 14px 0',
        }}
      >
        Course Logistics
      </h3>

      <ul
        style={{
          paddingLeft: '24px',
          margin: '0 0 24px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontSize: '1rem',
          color: '#2D3B45',
          lineHeight: 1.65,
        }}
      >
        <li>
          <strong>Intro Sessions: Monday & Wednesday:</strong>
          <ul
            style={{
              paddingLeft: '24px',
              marginTop: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '0.96rem',
              color: '#4B5563',
            }}
          >
            <li>Cohort Alpha: 18:00 - 19:30 CAT (Instructor: Claude Kamanzi)</li>
            <li>Cohort Beta: 19:30 - 21:00 CAT (Instructor: Jeanette Mukamana)</li>
            <li>Weekend Intensive: Saturday 09:00 - 12:00 CAT</li>
          </ul>
        </li>

        <li>
          <strong>Q/A Sessions: Friday & Saturday:</strong>
          <ul
            style={{
              paddingLeft: '24px',
              marginTop: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              fontSize: '0.96rem',
              color: '#4B5563',
            }}
          >
            <li>Cohort Alpha: Friday 18:30 - 20:00 CAT</li>
            <li>Cohort Beta: Saturday 17:00 - 18:30 CAT</li>
            <li>Weekend Intensive: Sunday 14:00 - 16:00 CAT</li>
          </ul>
        </li>
      </ul>

      {/* Cohort Live Meeting Link Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          marginTop: '6px',
        }}
      >
        {cohortSchedules.map((item, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '4px',
              padding: '16px',
              backgroundColor: '#FAFAFA',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B' }}>
                  {item.cohort}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: item.status === 'Active' ? '#DCFCE7' : '#FEF3C7',
                    color: item.status === 'Active' ? '#15803D' : '#92400E',
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  {item.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#4B5563' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <Clock size={14} color="#0055A5" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong>Intro:</strong> {item.introSession}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <Clock size={14} color="#D9381E" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong>Q&A:</strong> {item.qaSession}
                  </div>
                </div>

                <div style={{ marginTop: '4px', fontSize: '0.78rem', color: '#6B7280' }}>
                  Instructor: <strong>{item.instructor}</strong>
                </div>
              </div>
            </div>

            <a
              href={item.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="canvas-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#0055A5',
                color: '#FFFFFF',
                borderColor: '#0055A5',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                padding: '8px 14px',
                borderRadius: '3px',
              }}
            >
              <Video size={15} />
              <span>Join Google Meet</span>
              <ExternalLink size={13} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
