import React, { useState } from 'react';
import { Users, Video, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/I18nContext';

interface GroupMember {
  id: string;
  name: string;
  studentId: string;
  category: string;
  attendanceRate: number;
}

interface GroupPost {
  id: string;
  author: string;
  role: string;
  date: string;
  content: string;
}

export const GroupsView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [activeGroup, setActiveGroup] = useState<'kigali-alpha' | 'study-team'>('kigali-alpha');
  const [newPostText, setNewPostText] = useState('');
  const [posts, setPosts] = useState<GroupPost[]>([
    {
      id: 'p-1',
      author: 'Claude Kamanzi (Mwarimu)',
      role: 'Tutor',
      date: t('canvasGroups.yesterdayTime'),
      content: 'Muraho neza banyeshuri bo muri Cohort Alpha! Twibukiranye ko live session y\'uyu munsi kuri Google Meet itangira saa 19:00. Turarebera hamwe amategeko yo gutambuka mbere (Right of way).',
    },
    {
      id: 'p-2',
      author: 'Alice Uwase',
      role: 'Umunyeshuri',
      date: t('canvasGroups.todayTime'),
      content: 'Ese hari umuntu ufite notes z\'icyapa cy\'ibara ry\'umweru n\'umutuku cy\'urukiramende? Nifuzaga kubaza ku kizamini cya Quiz 2.',
    },
  ]);

  const members: GroupMember[] = [
    { id: 'm-1', name: 'Jean Mugisha', studentId: 'SF-2026-0891', category: 'Cat B', attendanceRate: 95 },
    { id: 'm-2', name: 'Alice Uwase', studentId: 'SF-2026-0904', category: 'Cat B', attendanceRate: 90 },
    { id: 'm-3', name: 'Patrick Ndayisaba', studentId: 'SF-2026-0912', category: 'Cat A', attendanceRate: 85 },
    { id: 'm-4', name: 'Diane Mukamana', studentId: 'SF-2026-0925', category: 'Cat B', attendanceRate: 100 },
    { id: 'm-5', name: 'Eric Bizimana', studentId: 'SF-2026-0940', category: 'Cat C', attendanceRate: 80 },
  ];

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: GroupPost = {
      id: `p-${Date.now()}`,
      author: user?.fullName || 'Umunyeshuri',
      role: user?.isTutor() ? 'Tutor' : 'Umunyeshuri',
      date: t('canvasGroups.justNow'),
      content: newPostText.trim(),
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0055A5', margin: 0 }}>
          {t('canvasGroups.title')}
        </h1>
        <p style={{ color: '#666666', fontSize: '0.9rem', marginTop: '4px' }}>
          {t('canvasGroups.subtitle')}
        </p>
      </div>

      {/* Cohort Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E0E0E0', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveGroup('kigali-alpha')}
          className="canvas-btn"
          style={{
            borderBottom: activeGroup === 'kigali-alpha' ? '3px solid #0055A5' : 'none',
            backgroundColor: activeGroup === 'kigali-alpha' ? '#FFFFFF' : 'transparent',
            fontWeight: activeGroup === 'kigali-alpha' ? 700 : 500,
            color: activeGroup === 'kigali-alpha' ? '#0055A5' : '#555555',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            padding: '10px 18px',
          }}
        >
          <Users size={16} />
          <span>Kigali Cohort Alpha 2026</span>
        </button>

        <button
          onClick={() => setActiveGroup('study-team')}
          className="canvas-btn"
          style={{
            borderBottom: activeGroup === 'study-team' ? '3px solid #0055A5' : 'none',
            backgroundColor: activeGroup === 'study-team' ? '#FFFFFF' : 'transparent',
            fontWeight: activeGroup === 'study-team' ? 700 : 500,
            color: activeGroup === 'study-team' ? '#0055A5' : '#555555',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            padding: '10px 18px',
          }}
        >
          <Users size={16} />
          <span>Amatsinda yo Kwimenyereza (Mock Study Group)</span>
        </button>
      </div>

      {/* Group Detail Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: Group Discussions & Announcements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Post box */}
          <div className="canvas-card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2D3B45', marginBottom: '12px' }}>
              {t('canvasGroups.shareThought')}
            </h3>
            <form onSubmit={handleAddPost}>
              <textarea
                rows={3}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder={t('canvasGroups.placeholder')}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D0D5DD',
                  borderRadius: '2px',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  marginBottom: '10px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="canvas-btn canvas-btn-primary" style={{ fontSize: '0.8rem' }}>
                  <Send size={14} />
                  <span>{t('canvasGroups.postToGroup')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Discussion Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {posts.map((post) => (
              <div key={post.id} className="canvas-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0055A5' }}>{post.author}</span>
                    <span className="canvas-badge canvas-badge-open" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
                      {post.role}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#888888' }}>{post.date}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#333333', lineHeight: 1.5, margin: 0 }}>
                  {post.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Tutor Card & Peers Roster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Assigned Tutor Card with Google Meet */}
          <div className="canvas-card" style={{ borderTop: '4px solid #058728 !important' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#058728', letterSpacing: '0.04em' }}>
              {t('canvasGroups.assignedTutor')}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  backgroundColor: '#0055A5',
                  color: '#FFFFFF',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                }}
              >
                CK
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2D3B45' }}>Claude Kamanzi</div>
                <div style={{ fontSize: '0.78rem', color: '#666666' }}>Senior Theory Instructor</div>
                <div style={{ fontSize: '0.75rem', color: '#0055A5', marginTop: '2px' }}>+250 788 333 444</div>
              </div>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#F0FFF4', border: '1px solid #C6F6D5', borderRadius: '2px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22543D', marginBottom: '2px' }}>
                {t('canvasGroups.nextMeet')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#2F855A' }}>
                {t('canvasGroups.nextMeetTime')}
              </div>
            </div>

            <a
              href="https://meet.google.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="canvas-btn canvas-btn-accent"
              style={{ width: '100%', textDecoration: 'none', justifyContent: 'center', fontSize: '0.82rem' }}
            >
              <Video size={16} />
              <span>{t('canvasGroups.joinMeet')}</span>
            </a>
          </div>

          {/* Enrolled Peers Roster */}
          <div className="canvas-card" style={{ padding: 0 }}>
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #EAEAEA',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0055A5' }}>
                {t('canvasGroups.cohortPeers')}
              </span>
              <span className="canvas-badge canvas-badge-open">{t('canvasGroups.enrolledCount', { count: members.length })}</span>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {members.map((member) => (
                <div
                  key={member.id}
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid #F0F0F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2D3B45' }}>{member.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#888888' }}>
                      {member.studentId} • {member.category}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: member.attendanceRate >= 85 ? '#058728' : '#D9381E' }}>
                      {member.attendanceRate}% {t('canvasGroups.attendance')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
