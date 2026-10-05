import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  ShieldAlert,
  Send,
  ArrowLeft,
  Crown,
  Info,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { Course } from '../../../../core/models/Course';

interface CourseUser {
  id: string;
  name: string;
  role: 'Instructor' | 'Student';
  studentId?: string;
  category: string;
  avatarColor: string;
  lastActive: string;
}

interface CourseGroup {
  id: string;
  name: string;
  description: string;
  creatorName: string;
  creatorRole: 'Tutor' | 'Student';
  category: string;
  members: string[]; // user IDs or names
  createdAt: string;
  messages: GroupMessage[];
}

interface GroupMessage {
  id: string;
  senderName: string;
  senderRole: 'Tutor' | 'Student';
  avatarColor: string;
  timestamp: string;
  text: string;
}

interface CoursePeopleTabProps {
  course: Course;
  initialGroupId?: string | null;
}

export const CoursePeopleTab: React.FC<CoursePeopleTabProps> = ({
  course,
  initialGroupId,
}) => {
  const { user } = useAuth();
  const currentUserName = user?.fullName || (user?.isTutor() ? 'Instructor' : 'Learner');
  const isCurrentUserTutor = user?.isTutor() || false;

  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'groups'>('groups');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(initialGroupId || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Instructor' | 'Student'>('ALL');

  // Modal State for Group Creation (allowed for BOTH students and tutors)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('General Road Rules & Highway Code');

  // Chat Composer State
  const [chatInput, setChatInput] = useState('');

  // Course Enrolled Users Roster
  const [roster] = useState<CourseUser[]>([
    {
      id: 'u-1',
      name: 'Claude Kamanzi',
      role: 'Instructor',
      category: 'Theory Lead Instructor',
      avatarColor: '#0055A5',
      lastActive: 'Active now',
    },
    {
      id: 'u-2',
      name: 'Jeanette Mukamana',
      role: 'Instructor',
      category: 'Road Signs Specialist',
      avatarColor: '#7C3AED',
      lastActive: '15m ago',
    },
    {
      id: 'u-3',
      name: 'Alice Uwase',
      role: 'Student',
      studentId: 'SF-2026-0904',
      category: 'General Road Rules & Highway Code',
      avatarColor: '#058728',
      lastActive: '5m ago',
    },
    {
      id: 'u-4',
      name: 'Jean Mugisha',
      role: 'Student',
      studentId: 'SF-2026-0891',
      category: 'National Mock Exam Prep',
      avatarColor: '#D97706',
      lastActive: 'Active now',
    },
    {
      id: 'u-5',
      name: 'Patrick Ndayisaba',
      role: 'Student',
      studentId: 'SF-2026-0912',
      category: 'Road Signs & Markings',
      avatarColor: '#2563EB',
      lastActive: '1h ago',
    },
    {
      id: 'u-6',
      name: 'Diane Mukamana',
      role: 'Student',
      studentId: 'SF-2026-0925',
      category: 'Intersections & Priorities',
      avatarColor: '#DB2777',
      lastActive: '30m ago',
    },
    {
      id: 'u-7',
      name: 'Eric Bizimana',
      role: 'Student',
      studentId: 'SF-2026-0940',
      category: 'General Road Rules & Highway Code',
      avatarColor: '#4F46E5',
      lastActive: '2h ago',
    },
    {
      id: 'u-8',
      name: 'Sandrine Uwitonze',
      role: 'Student',
      studentId: 'SF-2026-0955',
      category: 'National Mock Exam Prep',
      avatarColor: '#0D9488',
      lastActive: 'Active now',
    },
  ]);

  // Course Groups with Chat History
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([
    {
      id: 'grp-1',
      name: 'Kigali Theory Study Group 1',
      description: 'Collaborative revision on priority rules (Article 34), roundabouts, and police hand signals.',
      creatorName: 'Claude Kamanzi',
      creatorRole: 'Tutor',
      category: 'Intersections & Priorities',
      members: ['Claude Kamanzi', 'Alice Uwase', 'Jean Mugisha', 'Diane Mukamana', 'Eric Bizimana'],
      createdAt: 'Sep 22, 2026',
      messages: [
        {
          id: 'm-1',
          senderName: 'Claude Kamanzi',
          senderRole: 'Tutor',
          avatarColor: '#0055A5',
          timestamp: 'Yesterday at 18:00',
          text: 'Muraho banyeshuri! Please review the roundabouts simulation before tomorrow\'s quiz. Remember that circulating vehicles always hold right-of-way unless a traffic light specifies otherwise.',
        },
        {
          id: 'm-2',
          senderName: 'Alice Uwase',
          senderRole: 'Student',
          avatarColor: '#058728',
          timestamp: 'Yesterday at 18:24',
          text: 'Murakoze mwarimu! On question 14 of the mock exam regarding triangular signs with red border pointing down, is that always Yield (Tanga Inzira)?',
        },
        {
          id: 'm-3',
          senderName: 'Jean Mugisha',
          senderRole: 'Student',
          avatarColor: '#D97706',
          timestamp: 'Yesterday at 18:30',
          text: 'Yes Alice! Inverted triangle with red border is exclusively Yield / Cédez le passage. Stop is octagonal.',
        },
        {
          id: 'm-4',
          senderName: 'Claude Kamanzi',
          senderRole: 'Tutor',
          avatarColor: '#0055A5',
          timestamp: 'Yesterday at 18:35',
          text: 'Exactement Jean! Great peer support. Keep practicing questions together here.',
        },
      ],
    },
    {
      id: 'grp-2',
      name: 'Roundabout Mastery Circle',
      description: 'Students preparing specifically for complex multi-lane junction questions in the national police theory test.',
      creatorName: 'Jean Mugisha',
      creatorRole: 'Student',
      category: 'Intersections & Priorities',
      members: ['Jean Mugisha', 'Patrick Ndayisaba', 'Sandrine Uwitonze'],
      createdAt: 'Sep 26, 2026',
      messages: [
        {
          id: 'rm-1',
          senderName: 'Jean Mugisha',
          senderRole: 'Student',
          avatarColor: '#D97706',
          timestamp: 'Today at 09:15',
          text: 'Welcome to the circle everyone! Let\'s post any tricky junction scenarios we encounter in the mock test here.',
        },
        {
          id: 'rm-2',
          senderName: 'Sandrine Uwitonze',
          senderRole: 'Student',
          avatarColor: '#0D9488',
          timestamp: 'Today at 10:02',
          text: 'I just finished Mock 3 and scored 19/20. The only question I missed was lane selection when turning left in a 3-lane roundabout.',
        },
      ],
    },
    {
      id: 'grp-3',
      name: 'Weekend Theory Learners',
      description: 'Weekend revision group for students balancing work and provisional driving license preparation.',
      creatorName: 'Diane Mukamana',
      creatorRole: 'Student',
      category: 'General Road Rules & Highway Code',
      members: ['Diane Mukamana', 'Eric Bizimana', 'Alice Uwase'],
      createdAt: 'Sep 28, 2026',
      messages: [
        {
          id: 'wb-1',
          senderName: 'Diane Mukamana',
          senderRole: 'Student',
          avatarColor: '#DB2777',
          timestamp: 'Oct 1 at 14:00',
          text: 'Who is free this Saturday morning at 10:00 to do a synchronized 20-minute timed mock test together?',
        },
      ],
    },
  ]);

  // Filtered Roster
  const filteredRoster = roster.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.studentId && u.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle Group Creation (Students + Tutors can both create)
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: CourseGroup = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || 'Course study group for provisional license candidates.',
      creatorName: currentUserName,
      creatorRole: isCurrentUserTutor ? 'Tutor' : 'Student',
      category: newGroupCategory,
      members: [currentUserName],
      createdAt: 'Just now',
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: currentUserName,
          senderRole: isCurrentUserTutor ? 'Tutor' : 'Student',
          avatarColor: isCurrentUserTutor ? '#0055A5' : '#058728',
          timestamp: 'Just now',
          text: `Welcome to ${newGroupName.trim()}! This group was created to study and prepare together for ${course.title}.`,
        },
      ],
    };

    setCourseGroups([newGroup, ...courseGroups]);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setActiveGroupId(newGroup.id);
  };

  // Handle Sending a Message in the Active Group
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeGroupId) return;

    const activeGroup = courseGroups.find((g) => g.id === activeGroupId);
    if (!activeGroup) return;

    const newMessage: GroupMessage = {
      id: `msg-${Date.now()}`,
      senderName: currentUserName,
      senderRole: isCurrentUserTutor ? 'Tutor' : 'Student',
      avatarColor: isCurrentUserTutor ? '#0055A5' : '#10B981',
      timestamp: 'Just now',
      text: chatInput.trim(),
    };

    // Ensure user is added to members if not already
    const updatedMembers = activeGroup.members.includes(currentUserName)
      ? activeGroup.members
      : [...activeGroup.members, currentUserName];

    const updatedGroups = courseGroups.map((g) => {
      if (g.id === activeGroupId) {
        return {
          ...g,
          members: updatedMembers,
          messages: [...g.messages, newMessage],
        };
      }
      return g;
    });

    setCourseGroups(updatedGroups);
    setChatInput('');
  };

  const selectedGroup = courseGroups.find((g) => g.id === activeGroupId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Policy Alert Banner: No direct 1-to-1 DMs; group chat only */}
      <div
        style={{
          borderLeft: '4px solid #0055A5',
          backgroundColor: '#F0F9FF',
          padding: '14px 18px',
          borderRadius: '0 4px 4px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <ShieldAlert size={20} color="#0055A5" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: '#0369A1', lineHeight: 1.45 }}>
          <strong>Course Communication Policy:</strong> Direct 1-on-1 private messaging between students is disabled to safeguard learner privacy and maintain academic integrity. All discussions happen inside <strong>Course Groups</strong>, where both students and instructors can collaborate openly.
        </div>
      </div>

      {/* 2. Group Chat Room View (when a group is selected) */}
      {selectedGroup ? (
        <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Chat Room Top Navigation */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setActiveGroupId(null)}
                className="canvas-btn"
                style={{ padding: '5px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <ArrowLeft size={14} />
                <span>All Groups</span>
              </button>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    {selectedGroup.name}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: selectedGroup.creatorRole === 'Tutor' ? '#DBEAFE' : '#EDE9FE',
                      color: selectedGroup.creatorRole === 'Tutor' ? '#1D4ED8' : '#6B21A8',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {selectedGroup.creatorRole === 'Tutor' ? 'Instructor Group' : 'Student Group'}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                  {selectedGroup.description}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: '#475569' }}>
              <Users size={15} color="#0055A5" />
              <span>
                <strong>{selectedGroup.members.length}</strong> members in group
              </span>
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div
            style={{
              padding: '20px',
              height: '380px',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {selectedGroup.messages.map((msg) => {
              const isInstructor = msg.senderRole === 'Tutor';
              const isMine = msg.senderName === currentUserName;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    maxWidth: '85%',
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    flexDirection: isMine ? 'row-reverse' : 'row',
                  }}
                >
                  {/* Sender Avatar */}
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: msg.avatarColor || '#0055A5',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {msg.senderName.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Message Bubble */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E293B' }}>
                        {msg.senderName}
                      </span>
                      {isInstructor && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            backgroundColor: '#002147',
                            color: '#FFFFFF',
                            padding: '1px 5px',
                            borderRadius: '2px',
                          }}
                        >
                          Instructor
                        </span>
                      )}
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{msg.timestamp}</span>
                    </div>

                    <div
                      style={{
                        backgroundColor: isMine
                          ? '#0055A5'
                          : isInstructor
                          ? '#F0F9FF'
                          : '#F1F5F9',
                        color: isMine ? '#FFFFFF' : '#1E293B',
                        border: isInstructor && !isMine ? '1px solid #BAE6FD' : 'none',
                        padding: '10px 14px',
                        borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        fontSize: '0.85rem',
                        lineHeight: 1.45,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Message Input Composer */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '12px 16px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E5E7EB',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder={`Message ${selectedGroup.name}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                padding: '9px 14px',
                border: '1px solid #CBD5E1',
                borderRadius: '4px',
                fontSize: '0.86rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            />
            <button
              type="submit"
              className="canvas-btn canvas-btn-primary"
              disabled={!chatInput.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                fontSize: '0.82rem',
                opacity: !chatInput.trim() ? 0.6 : 1,
              }}
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </div>
      ) : (
        /* 3. Main People Navigation: Subtabs for Groups vs Classmates Roster */
        <div>
          {/* Sub Navigation Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #E5E7EB',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveSubTab('groups')}
                style={{
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeSubTab === 'groups' ? '3px solid #0055A5' : '3px solid transparent',
                  color: activeSubTab === 'groups' ? '#0055A5' : '#6B7280',
                  fontWeight: activeSubTab === 'groups' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={16} />
                <span>Course Groups ({courseGroups.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('roster')}
                style={{
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeSubTab === 'roster' ? '3px solid #0055A5' : '3px solid transparent',
                  color: activeSubTab === 'roster' ? '#0055A5' : '#6B7280',
                  fontWeight: activeSubTab === 'roster' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UserCheck size={16} />
                <span>Classmates & Instructors ({roster.length})</span>
              </button>
            </div>

            {/* "Create Group" Button - Available to BOTH students and tutors */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="canvas-btn canvas-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                fontSize: '0.8rem',
              }}
            >
              <Plus size={15} />
              <span>{isCurrentUserTutor ? 'Create Student Group' : 'Create Study Group'}</span>
            </button>
          </div>

          {/* Subtab: Course Groups */}
          {activeSubTab === 'groups' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {courseGroups.map((grp) => (
                  <div
                    key={grp.id}
                    className="canvas-card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderTop: grp.creatorRole === 'Tutor' ? '4px solid #0055A5' : '4px solid #7C3AED',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', margin: 0, lineHeight: 1.3 }}>
                          {grp.name}
                        </h4>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            backgroundColor: grp.creatorRole === 'Tutor' ? '#DBEAFE' : '#EDE9FE',
                            color: grp.creatorRole === 'Tutor' ? '#1D4ED8' : '#6B21A8',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {grp.creatorRole === 'Tutor' ? 'Instructor Created' : 'Student Group'}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.83rem', color: '#4B5563', lineHeight: 1.45, marginBottom: '14px' }}>
                        {grp.description}
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid #F1F5F9',
                          fontSize: '0.76rem',
                          color: '#64748B',
                          marginBottom: '14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Users size={14} color="#0055A5" />
                          <span><strong>{grp.members.length}</strong> members</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <MessageSquare size={14} color="#058728" />
                          <span><strong>{grp.messages.length}</strong> messages</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setActiveGroupId(grp.id)}
                          className="canvas-btn canvas-btn-primary"
                          style={{
                            flex: 1,
                            padding: '7px 12px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <MessageSquare size={14} />
                          <span>Open Group Chat</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab: Classmates Roster */}
          {activeSubTab === 'roster' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Roster Filter Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D0D5DD',
                    borderRadius: '2px',
                    padding: '6px 12px',
                    width: '300px',
                  }}
                >
                  <Search size={15} color="#94A3B8" />
                  <input
                    type="text"
                    placeholder="Search by name or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.82rem', background: 'transparent' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['ALL', 'Instructor', 'Student'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className="canvas-btn"
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.76rem',
                        fontWeight: roleFilter === r ? 700 : 500,
                        backgroundColor: roleFilter === r ? '#0055A5' : '#FFFFFF',
                        color: roleFilter === r ? '#FFFFFF' : '#374151',
                        borderColor: roleFilter === r ? '#0055A5' : '#D0D5DD',
                      }}
                    >
                      {r === 'ALL' ? 'All Roles' : `${r}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roster Cards List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {filteredRoster.map((u) => (
                  <div
                    key={u.id}
                    className="canvas-card"
                    style={{
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: u.avatarColor,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
                            {u.name}
                          </span>
                          {u.role === 'Instructor' && (
                            <Crown size={14} color="#0055A5" />
                          )}
                        </div>

                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                          {u.studentId ? `${u.studentId} • ` : ''}{u.category}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#058728', marginTop: '2px' }}>
                          {u.lastActive}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          backgroundColor: u.role === 'Instructor' ? '#EFF6FF' : '#F8FAFC',
                          color: u.role === 'Instructor' ? '#0055A5' : '#475569',
                          border: '1px solid #E2E8F0',
                          padding: '2px 8px',
                          borderRadius: '2px',
                        }}
                      >
                        {u.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Group Creation Modal (available for BOTH students and tutors) */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="canvas-card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '28px',
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                  {isCurrentUserTutor ? 'Create Official Course Group' : 'Create Student Study Group'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 0' }}>
                  Course: {course.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roundabout & Overtaking Practice Group"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '2px',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Study Focus & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What topics or quiz questions will members focus on?"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '2px',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Study Focus Area
                </label>
                <select
                  value={newGroupCategory}
                  onChange={(e) => setNewGroupCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '2px',
                    fontSize: '0.85rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="General Road Rules & Highway Code">General Road Rules & Highway Code</option>
                  <option value="Road Signs & Markings">Road Signs & Ground Markings</option>
                  <option value="Intersections & Priorities">Intersections & Priorities (Article 34)</option>
                  <option value="National Mock Exam Prep">National Mock Exam Preparation</option>
                </select>
              </div>

              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '10px 12px',
                  borderRadius: '2px',
                  fontSize: '0.76rem',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Info size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
                All enrolled students in this course will be able to view and join this group to study and chat together.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="canvas-btn"
                  style={{ fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="canvas-btn canvas-btn-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
