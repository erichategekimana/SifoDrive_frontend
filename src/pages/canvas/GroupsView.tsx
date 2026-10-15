import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  Send,
  MessageSquare,
  BookOpen,
  ArrowLeft,
  UserPlus,
  UserCheck,
  CheckCircle2,
  X,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  CourseGroupService,
  type CourseGroupDTO,
  type CourseGroupDetailDTO,
  type CourseGroupMessageDTO,
} from '../../core/services/CourseGroupService';
import { LmsService } from '../../core/services/LmsService';
import { type Course } from '../../core/models/Course';
import { Spinner } from '../../components/common/Spinner';

export const GroupsView: React.FC = () => {
  const { id: routeGroupId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { success: toastSuccess, error: toastError } = useToast();

  const isDark = theme === 'dark';

  // Master Data
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<CourseGroupDTO[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);

  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [tabFilter, setTabFilter] = useState<'all' | 'my_groups'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Active Workspace / Detail
  const [activeGroupDetail, setActiveGroupDetail] = useState<CourseGroupDetailDTO | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  // Create Group Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createCourseId, setCreateCourseId] = useState<string>('');
  const [createName, setCreateName] = useState<string>('');
  const [createCategory, setCreateCategory] = useState<string>('General');
  const [createDescription, setCreateDescription] = useState<string>('');
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch courses the student is enrolled in
  useEffect(() => {
    let isMounted = true;
    const fetchCourses = async () => {
      try {
        const courseData = await LmsService.getInstance().getCourses();
        if (!isMounted) return;
        setCourses(courseData || []);
        if (courseData && courseData.length > 0 && !createCourseId) {
          setCreateCourseId(courseData[0].id);
        }
      } catch (err) {
        console.error('Failed to load student courses:', err);
      }
    };
    fetchCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch all groups from all courses
  const fetchAllGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const data = await CourseGroupService.getInstance().getAllGroups({
        courseId: selectedCourseId !== 'ALL' ? selectedCourseId : undefined,
        myGroupsOnly: tabFilter === 'my_groups',
        search: searchQuery.trim() || undefined,
      });
      setGroups(data || []);
    } catch (err: any) {
      console.error('Failed to load study groups:', err);
      toastError(err?.message || 'Failed to load study groups.');
    } finally {
      setLoadingGroups(false);
    }
  }, [selectedCourseId, tabFilter, searchQuery, toastError]);

  useEffect(() => {
    fetchAllGroups();
  }, [fetchAllGroups]);

  // 3. Load active group detail if routeGroupId is present
  const fetchActiveGroupDetail = useCallback(async (groupId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await CourseGroupService.getInstance().getGroupDetail(groupId);
      setActiveGroupDetail(detail);
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      console.error('Failed to load group details:', err);
      toastError(err?.message || 'Failed to load group conversation.');
    } finally {
      setLoadingDetail(false);
    }
  }, [toastError]);

  useEffect(() => {
    if (routeGroupId) {
      fetchActiveGroupDetail(routeGroupId);
    } else {
      setActiveGroupDetail(null);
    }
  }, [routeGroupId, fetchActiveGroupDetail]);

  // Join or Leave Group
  const handleToggleJoin = async (group: CourseGroupDTO | CourseGroupDetailDTO) => {
    try {
      setJoiningGroupId(group.id);
      const res = await CourseGroupService.getInstance().toggleJoinGroup(group.id);

      // Update in groups list
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? { ...g, is_member: res.is_member, members_count: res.members_count }
            : g
        )
      );

      // Update active detail if viewing this group
      if (activeGroupDetail && activeGroupDetail.id === group.id) {
        setActiveGroupDetail({
          ...activeGroupDetail,
          is_member: res.is_member,
          members_count: res.members_count,
        });
        // Refresh details to update members list
        fetchActiveGroupDetail(group.id);
      }

      if (res.is_member) {
        toastSuccess(`You joined "${group.name}". Welcome to the circle!`);
      } else {
        toastSuccess(`You left "${group.name}".`);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to update group membership.');
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeGroupDetail) return;

    const content = newMessageText.trim();
    setIsSendingMessage(true);
    try {
      const sentMsg = await CourseGroupService.getInstance().sendMessage(activeGroupDetail.id, content);
      
      // Append optimistically
      setActiveGroupDetail((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...(prev.messages || []), sentMsg],
          is_member: true, // Sender automatically becomes member
          members_count: prev.is_member ? prev.members_count : prev.members_count + 1,
        };
      });
      setNewMessageText('');
      setTimeout(scrollToBottom, 50);

      // Refresh groups list in background to update latest activity & counts
      fetchAllGroups();
    } catch (err: any) {
      toastError(err?.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Create New Group
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      toastError('Please enter a group name.');
      return;
    }
    if (!createCourseId) {
      toastError('Please select a course for this study group.');
      return;
    }

    setIsCreatingGroup(true);
    try {
      const created = await CourseGroupService.getInstance().createGlobalGroup({
        course_id: createCourseId,
        name: createName.trim(),
        category: createCategory,
        description: createDescription.trim(),
      });

      toastSuccess(`Study group "${created.name}" created successfully!`);
      setIsCreateModalOpen(false);
      setCreateName('');
      setCreateDescription('');
      setCreateCategory('General');

      // Refresh list and navigate to new group
      await fetchAllGroups();
      navigate(`/groups/${created.id}`);
    } catch (err: any) {
      toastError(err?.message || 'Failed to create study group.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Unique categories for filtering
  const categoryOptions = React.useMemo(() => {
    const cats = new Set<string>();
    groups.forEach((g) => {
      if (g.category) cats.add(g.category);
    });
    return ['ALL', ...Array.from(cats)];
  }, [groups]);

  // Filtered groups by category in memory
  const displayedGroups = React.useMemo(() => {
    if (selectedCategory === 'ALL') return groups;
    return groups.filter((g) => g.category === selectedCategory);
  }, [groups, selectedCategory]);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 8px 40px 8px' }}>
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BAR
         ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#0055A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', margin: 0 }}>
                Course Study Groups
              </h1>
              <p style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.86rem', marginTop: '3px', margin: 0 }}>
                Collaborate with peers, discuss course concepts, and ask questions across all your enrolled courses.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {routeGroupId && (
            <button
              onClick={() => navigate('/groups')}
              type="button"
              className="canvas-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: isDark ? '#CBD5E1' : '#475569',
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to All Groups</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="canvas-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: '#0055A5',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 85, 165, 0.2)',
            }}
          >
            <Plus size={16} />
            <span>Create Study Group</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. WORKSPACE OR DIRECTORY VIEW
         ───────────────────────────────────────────────────────────── */}
      {routeGroupId && activeGroupDetail ? (
        /* ─── GROUP WORKSPACE & CHAT VIEW ─── */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '20px' }}>
          {/* Main Left: Group Chat Stream & Header */}
          <div
            className="canvas-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 220px)',
              minHeight: '620px',
              padding: 0,
              overflow: 'hidden',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            }}
          >
            {/* Top Workspace Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
                      color: '#0055A5',
                      border: '1px solid rgba(0, 85, 165, 0.2)',
                    }}
                  >
                    <BookOpen size={12} />
                    <span>{activeGroupDetail.course_title || 'Enrolled Course'}</span>
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      backgroundColor: isDark ? '#334155' : '#E2E8F0',
                      color: isDark ? '#E2E8F0' : '#475569',
                    }}
                  >
                    {activeGroupDetail.category || 'General'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', margin: 0 }}>
                  {activeGroupDetail.name}
                </h2>
                {activeGroupDetail.description && (
                  <p style={{ fontSize: '0.82rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '4px', margin: 0 }}>
                    {activeGroupDetail.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleToggleJoin(activeGroupDetail)}
                  disabled={joiningGroupId === activeGroupDetail.id}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: activeGroupDetail.is_member ? (isDark ? '#334155' : '#E2E8F0') : '#0055A5',
                    color: activeGroupDetail.is_member ? (isDark ? '#CBD5E1' : '#334155') : '#FFFFFF',
                    border: 'none',
                  }}
                >
                  {joiningGroupId === activeGroupDetail.id ? (
                    <Spinner size={14} />
                  ) : activeGroupDetail.is_member ? (
                    <>
                      <UserCheck size={15} color="#15803D" />
                      <span>Joined ({activeGroupDetail.members_count})</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      <span>Join Circle</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Middle: Chat Messages Stream */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              }}
            >
              {loadingDetail ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Spinner size={32} />
                </div>
              ) : !activeGroupDetail.messages || activeGroupDetail.messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: isDark ? '#94A3B8' : '#64748B' }}>
                  <MessageSquare size={44} style={{ opacity: 0.35, margin: '0 auto 12px auto' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>No messages yet in this study circle.</p>
                  <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                    Be the first to say hello, ask a question, or share notes!
                  </p>
                </div>
              ) : (
                activeGroupDetail.messages.map((msg: CourseGroupMessageDTO) => {
                  const isMe = user?.id && String(user.id) === String(msg.sender_id);
                  const isTutor = msg.sender_role === 'Tutor';

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        flexDirection: isMe ? 'row-reverse' : 'row',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: msg.avatar_color || (isTutor ? '#058728' : '#0055A5'),
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          flexShrink: 0,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      >
                        {msg.sender_name?.slice(0, 2).toUpperCase() || 'U'}
                      </div>

                      {/* Message Bubble */}
                      <div
                        style={{
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: isDark ? '#E2E8F0' : '#1E293B',
                            }}
                          >
                            {isMe ? 'You' : msg.sender_name}
                          </span>
                          {isTutor && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                backgroundColor: '#DCFCE7',
                                color: '#15803D',
                              }}
                            >
                              <ShieldCheck size={11} />
                              <span>Tutor</span>
                            </span>
                          )}
                          <span style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#94A3B8' }}>
                            {msg.timestamp || 'Just now'}
                          </span>
                        </div>

                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            borderTopRightRadius: isMe ? '2px' : '10px',
                            borderTopLeftRadius: !isMe ? '2px' : '10px',
                            backgroundColor: isMe
                              ? '#0055A5'
                              : isDark
                              ? '#334155'
                              : '#F1F5F9',
                            color: isMe ? '#FFFFFF' : isDark ? '#F8FAFC' : '#1E293B',
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom: Message Composer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
              }}
            >
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={`Write a message to "${activeGroupDetail.name}"...`}
                  disabled={isSendingMessage}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || isSendingMessage}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    backgroundColor: !newMessageText.trim() ? (isDark ? '#475569' : '#CBD5E1') : '#0055A5',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: !newMessageText.trim() || isSendingMessage ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSendingMessage ? <Spinner size={16} /> : <Send size={16} />}
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Group Members & Course Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Course Card */}
            <div
              className="canvas-card"
              style={{
                padding: '16px',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#0055A5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <BookOpen size={13} />
                <span>Associated Course</span>
              </span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', marginTop: '6px' }}>
                {activeGroupDetail.course_title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B', marginTop: '4px' }}>
                Organized by {activeGroupDetail.creator_name} ({activeGroupDetail.creator_role})
              </p>
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  fontSize: '0.78rem',
                  color: isDark ? '#CBD5E1' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Clock size={13} color="#0055A5" />
                <span>Active study discussions open 24/7</span>
              </div>
            </div>

            {/* Members Roster Card */}
            <div
              className="canvas-card"
              style={{
                padding: '16px',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                  Group Members
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: isDark ? '#334155' : '#E2E8F0',
                    color: isDark ? '#CBD5E1' : '#475569',
                  }}
                >
                  {activeGroupDetail.members?.length || 0}
                </span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {!activeGroupDetail.members || activeGroupDetail.members.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#94A3B8' }}>No members listed.</p>
                ) : (
                  activeGroupDetail.members.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: m.avatar_color || '#0055A5',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          flexShrink: 0,
                        }}
                      >
                        {m.name?.slice(0, 2).toUpperCase() || 'M'}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: isDark ? '#F8FAFC' : '#1E293B',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {m.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                          {m.role}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─── DIRECTORY VIEW: ALL GROUPS ACROSS ALL COURSES ─── */
        <div>
          {/* Controls Bar: Course Dropdown, Search, My Groups Tab */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              marginBottom: '20px',
            }}
          >
            {/* Filter Tabs: All vs My Groups */}
            <div style={{ display: 'flex', gap: '6px', backgroundColor: isDark ? '#0F172A' : '#E2E8F0', padding: '4px', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => setTabFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  fontWeight: tabFilter === 'all' ? 700 : 500,
                  backgroundColor: tabFilter === 'all' ? (isDark ? '#1E293B' : '#FFFFFF') : 'transparent',
                  color: tabFilter === 'all' ? '#0055A5' : isDark ? '#94A3B8' : '#64748B',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: tabFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                All Groups ({groups.length})
              </button>
              <button
                type="button"
                onClick={() => setTabFilter('my_groups')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  fontWeight: tabFilter === 'my_groups' ? 700 : 500,
                  backgroundColor: tabFilter === 'my_groups' ? (isDark ? '#1E293B' : '#FFFFFF') : 'transparent',
                  color: tabFilter === 'my_groups' ? '#0055A5' : isDark ? '#94A3B8' : '#64748B',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: tabFilter === 'my_groups' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                My Joined Circles
              </button>
            </div>

            {/* Filter by Enrolled Course */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B' }}>
                  Filter by Course:
                </span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#1E293B',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                >
                  <option value="ALL">All Enrolled Courses ({courses.length})</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search input */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  width: '240px',
                }}
              >
                <Search size={15} color={isDark ? '#94A3B8' : '#64748B'} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search group name..."
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    color: isDark ? '#F8FAFC' : '#1E293B',
                    fontSize: '0.82rem',
                    width: '100%',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={13} color="#94A3B8" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Quick Chips */}
          {categoryOptions.length > 2 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    backgroundColor: selectedCategory === cat ? '#0055A5' : isDark ? '#1E293B' : '#F1F5F9',
                    color: selectedCategory === cat ? '#FFFFFF' : isDark ? '#CBD5E1' : '#475569',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    cursor: 'pointer',
                  }}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          )}

          {/* Groups Grid */}
          {loadingGroups ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Spinner size={32} />
              <p style={{ marginTop: '12px', fontSize: '0.88rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                Loading study groups from your courses...
              </p>
            </div>
          ) : displayedGroups.length === 0 ? (
            <div
              className="canvas-card"
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              }}
            >
              <Users size={48} style={{ opacity: 0.35, margin: '0 auto 16px auto', color: '#0055A5' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', margin: 0 }}>
                {tabFilter === 'my_groups' ? 'No Joined Study Groups' : 'No Study Groups Found'}
              </h3>
              <p style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.86rem', maxWidth: '460px', margin: '8px auto 20px auto' }}>
                {tabFilter === 'my_groups'
                  ? "You haven't joined any study groups yet. Switch to 'All Groups' to explore and join groups created for your courses."
                  : 'There are no study groups matching your current filters. Be the first to start a study circle!'}
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="canvas-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: '#0055A5',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
                <span>Create Study Group</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '20px',
              }}
            >
              {displayedGroups.map((group) => (
                <div
                  key={group.id}
                  className="canvas-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div>
                    {/* Course & Category Tags */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
                          color: '#0055A5',
                          border: '1px solid rgba(0, 85, 165, 0.2)',
                          maxWidth: '220px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={group.course_title}
                      >
                        <BookOpen size={12} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {group.course_title || 'Enrolled Course'}
                        </span>
                      </span>

                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                          color: isDark ? '#CBD5E1' : '#475569',
                        }}
                      >
                        {group.category || 'General'}
                      </span>
                    </div>

                    {/* Group Title */}
                    <h3
                      onClick={() => navigate(`/groups/${group.id}`)}
                      style={{
                        fontSize: '1.08rem',
                        fontWeight: 800,
                        color: isDark ? '#F8FAFC' : '#0F172A',
                        margin: '0 0 6px 0',
                        cursor: 'pointer',
                      }}
                    >
                      {group.name}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: isDark ? '#94A3B8' : '#64748B',
                        lineHeight: 1.45,
                        margin: '0 0 16px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '38px',
                      }}
                    >
                      {group.description || 'Collaborative peer learning circle and study discussions for this course.'}
                    </p>

                    {/* Group Meta Info */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.76rem',
                        color: isDark ? '#94A3B8' : '#64748B',
                        padding: '10px 0',
                        borderTop: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                        borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="#0055A5" />
                        <span style={{ fontWeight: 600 }}>{group.members_count || 1} members</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        <span>Active {group.last_activity || group.created_at_formatted || 'recently'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleJoin(group)}
                      disabled={joiningGroupId === group.id}
                      className="canvas-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: group.is_member ? (isDark ? '#0F172A' : '#F1F5F9') : 'transparent',
                        color: group.is_member ? '#15803D' : '#0055A5',
                        border: group.is_member
                          ? '1px solid #BBF7D0'
                          : '1px solid rgba(0, 85, 165, 0.4)',
                      }}
                    >
                      {joiningGroupId === group.id ? (
                        <Spinner size={13} />
                      ) : group.is_member ? (
                        <>
                          <CheckCircle2 size={14} color="#15803D" />
                          <span>Joined</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          <span>Join Group</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/groups/${group.id}`)}
                      className="canvas-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: '#0055A5',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                      }}
                    >
                      <MessageSquare size={14} />
                      <span>Open Workspace</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. CREATE GROUP MODAL
         ───────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            className="canvas-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#0055A5" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: isDark ? '#F8FAFC' : '#0F172A', margin: 0 }}>
                  Create Study Group
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: isDark ? '#94A3B8' : '#64748B', marginBottom: '18px' }}>
              Start a new peer study circle for any of your courses. Classmates and tutors can join and discuss topics.
            </p>

            <form onSubmit={handleCreateGroupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Select Enrolled Course */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#334155', marginBottom: '5px' }}>
                  Target Course *
                </label>
                <select
                  value={createCourseId}
                  onChange={(e) => setCreateCourseId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#334155', marginBottom: '5px' }}>
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Traffic Signs Drill & Revision Circle"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#334155', marginBottom: '5px' }}>
                  Category Topic
                </label>
                <select
                  value={createCategory}
                  onChange={(e) => setCreateCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.86rem',
                    outline: 'none',
                  }}
                >
                  <option value="General">General Study Circle</option>
                  <option value="Exam Preparation">Exam Preparation & Mock Q&A</option>
                  <option value="Traffic Rules">Traffic Rules & Highway Code</option>
                  <option value="Road Signs">Road Signs Identification</option>
                  <option value="Mechanics & Drills">Vehicle Mechanics & Practical Drills</option>
                  <option value="Case Studies">Case Studies & Situational Analysis</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#CBD5E1' : '#334155', marginBottom: '5px' }}>
                  Description / Study Goals
                </label>
                <textarea
                  rows={3}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Describe the focus of this group and how members can help each other..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.86rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="canvas-btn"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: isDark ? '#CBD5E1' : '#475569',
                    backgroundColor: isDark ? '#334155' : '#E2E8F0',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGroup}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    backgroundColor: '#0055A5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isCreatingGroup ? 'wait' : 'pointer',
                  }}
                >
                  {isCreatingGroup ? <Spinner size={14} /> : <Plus size={15} />}
                  <span>Create Circle</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
