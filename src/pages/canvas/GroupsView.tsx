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
  CheckCircle2,
  X,
  Clock,
  Crown,
  Lock,
  Unlock,
  UserMinus,
  LogOut,
  ShieldCheck,
  Award,
  HelpCircle,
  Smile,
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
import { AddGroupMemberModal } from '../../features/lms/components/course/people/AddGroupMemberModal';

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
  const [isUpdatingPermission, setIsUpdatingPermission] = useState<boolean>(false);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Interactive Academic Reactions & Question Mode
  const [messageReactions, setMessageReactions] = useState<Record<string, Record<string, number>>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);
  const [isQuestionMode, setIsQuestionMode] = useState<boolean>(false);

  const toggleReaction = (msgId: string, emoji: string) => {
    setUserReactions((prevUser) => {
      const currentList = prevUser[msgId] || [];
      const hasReacted = currentList.includes(emoji);
      const updatedList = hasReacted
        ? currentList.filter((e) => e !== emoji)
        : [...currentList, emoji];

      setMessageReactions((prevCounts) => {
        const msgCounts = { ...(prevCounts[msgId] || {}) };
        const currentCount = msgCounts[emoji] || 0;
        if (hasReacted) {
          if (currentCount <= 1) {
            delete msgCounts[emoji];
          } else {
            msgCounts[emoji] = currentCount - 1;
          }
        } else {
          msgCounts[emoji] = currentCount + 1;
        }
        return { ...prevCounts, [msgId]: msgCounts };
      });

      return { ...prevUser, [msgId]: updatedList };
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Member Management Modal
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);

  // Create Group Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createCourseId, setCreateCourseId] = useState<string>('');
  const [createName, setCreateName] = useState<string>('');
  const [createCategory, setCreateCategory] = useState<string>('General');
  const [createDescription, setCreateDescription] = useState<string>('');
  const [createAllowStudentsToAdd, setCreateAllowStudentsToAdd] = useState<boolean>(false);
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

  // 3. Load active group detail if routeGroupId is present (with silent background sync support)
  const fetchActiveGroupDetail = useCallback(
    async (groupId: string, silent = false) => {
      if (!silent) setLoadingDetail(true);
      try {
        const detail = await CourseGroupService.getInstance().getGroupDetail(groupId);
        setActiveGroupDetail((prev) => {
          if (!prev || prev.id !== groupId) return detail;
          const prevCount = prev.messages?.length || 0;
          const newCount = detail.messages?.length || 0;
          if (newCount > prevCount) {
            // New message arrived from another member! Scroll to bottom
            setTimeout(scrollToBottom, 60);
          }
          return detail;
        });
        if (!silent) {
          setTimeout(scrollToBottom, 100);
        }
      } catch (err: any) {
        if (!silent) {
          console.error('Failed to load group details:', err);
          toastError(err?.message || 'Failed to load group conversation.');
        }
      } finally {
        if (!silent) setLoadingDetail(false);
      }
    },
    [toastError]
  );

  // 4. Real-time background sync when viewing an active group
  useEffect(() => {
    if (!routeGroupId) {
      setActiveGroupDetail(null);
      return;
    }

    // Initial load
    fetchActiveGroupDetail(routeGroupId);

    // Fast real-time polling every 2.5 seconds
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchActiveGroupDetail(routeGroupId, true);
      }
    }, 2500);

    // Immediate sync on window focus or tab visibility return
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchActiveGroupDetail(routeGroupId, true);
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
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

    let content = newMessageText.trim();
    if (isQuestionMode && !content.startsWith('[Question]')) {
      content = `[Question] ${content}`;
    }

    setIsSendingMessage(true);
    try {
      const sentMsg = await CourseGroupService.getInstance().sendMessage(activeGroupDetail.id, content);
      
      // Append optimistically
      setActiveGroupDetail((prev) => {
        if (!prev) return null;
        const exists = (prev.messages || []).some((m) => m.id === sentMsg.id);
        if (exists) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), sentMsg],
          is_member: true, // Sender automatically becomes member
          members_count: prev.is_member ? prev.members_count : prev.members_count + 1,
        };
      });
      setNewMessageText('');
      setIsQuestionMode(false);
      setTimeout(scrollToBottom, 50);

      // Refresh groups list in background to update latest activity & counts
      fetchAllGroups();
      // Silently sync server state
      fetchActiveGroupDetail(activeGroupDetail.id, true);
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

    const isTutor = Boolean(
      user?.isTutor?.() || ['TUTOR', 'SYSTEM_ADMIN', 'TRAINING_ADMIN'].includes(user?.role || '')
    );

    setIsCreatingGroup(true);
    try {
      const created = await CourseGroupService.getInstance().createGlobalGroup({
        course_id: createCourseId,
        name: createName.trim(),
        category: createCategory,
        description: createDescription.trim(),
        allow_students_to_add_members: isTutor ? createAllowStudentsToAdd : false,
      });

      toastSuccess(`Study group "${created.name}" created successfully!`);
      setIsCreateModalOpen(false);
      setCreateName('');
      setCreateDescription('');
      setCreateCategory('General');
      setCreateAllowStudentsToAdd(false);

      // Refresh list and navigate to new group
      await fetchAllGroups();
      navigate(`/groups/${created.id}`);
    } catch (err: any) {
      toastError(err?.message || 'Failed to create study group.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleToggleStudentAddPermission = async (enabled: boolean) => {
    if (!activeGroupDetail || isUpdatingPermission) return;
    setIsUpdatingPermission(true);
    try {
      const updated = await CourseGroupService.getInstance().updateGroupSettings(activeGroupDetail.id, {
        allow_students_to_add_members: enabled,
      });
      setActiveGroupDetail(updated);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === activeGroupDetail.id
            ? { ...g, allow_students_to_add_members: enabled, can_add_members: updated.can_add_members }
            : g
        )
      );
      toastSuccess(
        enabled
          ? 'Students can now invite classmates to this group.'
          : 'Peer invite access revoked.'
      );
    } catch (err: any) {
      console.error('Failed to update group permissions:', err);
      toastError(err?.message || 'Failed to update group permissions.');
    } finally {
      setIsUpdatingPermission(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!activeGroupDetail) return;
    try {
      const updated = await CourseGroupService.getInstance().removeMember(activeGroupDetail.id, userId);
      setActiveGroupDetail(updated);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === activeGroupDetail.id ? { ...g, members_count: updated.members_count } : g
        )
      );
      toastSuccess('Member removed from study group.');
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      toastError(err?.message || 'Failed to remove member.');
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
              padding: '9px 18px',
              fontSize: '0.86rem',
              fontWeight: 700,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #1e3a5f 0%, #155e75 45%, #2e2870 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(30, 58, 95, 0.25)',
              fontFamily: "'Outfit', sans-serif",
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: showRightSidebar ? 'minmax(0, 1fr) 320px' : 'minmax(0, 1fr)',
            gap: '20px',
          }}
        >
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
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
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
                {/* Active Members Presence Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {activeGroupDetail.members && activeGroupDetail.members.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {activeGroupDetail.members.slice(0, 4).map((m, idx) => (
                        <div
                          key={m.id}
                          title={m.name}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: m.avatar_color || '#0055A5',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.62rem',
                            border: isDark ? '2px solid #0F172A' : '2px solid #FFFFFF',
                            marginLeft: idx === 0 ? 0 : '-6px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          }}
                        >
                          {m.profile_photo ? (
                            <img src={m.profile_photo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            m.name?.slice(0, 1).toUpperCase() || 'M'
                          )}
                        </div>
                      ))}
                      {activeGroupDetail.members.length > 4 && (
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: isDark ? '#334155' : '#E2E8F0',
                            color: isDark ? '#CBD5E1' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.62rem',
                            border: isDark ? '2px solid #0F172A' : '2px solid #FFFFFF',
                            marginLeft: '-6px',
                          }}
                        >
                          +{activeGroupDetail.members.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: isDark ? '#94A3B8' : '#64748B',
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        display: 'inline-block',
                        boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)',
                      }}
                    />
                    <span>
                      {activeGroupDetail.members?.length || 0} enrolled member{(activeGroupDetail.members?.length || 0) === 1 ? '' : 's'} • Active study circle
                    </span>
                  </span>
                </div>
              </div>

              {/* Header Action Menu (Three Dots) */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-label="Group options"
                  title="Group options"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    padding: 0,
                    borderRadius: '8px',
                    backgroundColor: isDark
                      ? (isMenuOpen ? '#334155' : '#1E293B')
                      : (isMenuOpen ? '#E2E8F0' : '#F1F5F9'),
                    border: isDark ? '1.5px solid #475569' : '1.5px solid #94A3B8',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#E2E8F0';
                    e.currentTarget.style.borderColor = '#0055A5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark
                      ? (isMenuOpen ? '#334155' : '#1E293B')
                      : (isMenuOpen ? '#E2E8F0' : '#F1F5F9');
                    e.currentTarget.style.borderColor = isDark ? '#475569' : '#94A3B8';
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ display: 'block' }}
                  >
                    <circle cx="12" cy="5" r="2.5" fill={isDark ? '#F8FAFC' : '#0F172A'} />
                    <circle cx="12" cy="12" r="2.5" fill={isDark ? '#F8FAFC' : '#0F172A'} />
                    <circle cx="12" cy="19" r="2.5" fill={isDark ? '#F8FAFC' : '#0F172A'} />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      width: '260px',
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderRadius: '8px',
                      boxShadow: isDark
                        ? '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
                        : '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                      padding: '6px',
                      zIndex: 50,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    {/* 1. View / Hide Members */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowRightSidebar((prev) => !prev);
                        setIsMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: isDark ? '#F1F5F9' : '#1E293B',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.12s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F1F5F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#0055A5" />
                        <span>{showRightSidebar ? 'Hide Members' : 'View Members'}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
                          color: '#0055A5',
                        }}
                      >
                        {activeGroupDetail.members_count ?? activeGroupDetail.members?.length ?? 0}
                      </span>
                    </button>

                    {/* 2. Add Members */}
                    {activeGroupDetail.can_add_members && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsAddMemberModalOpen(true);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: isDark ? '#F1F5F9' : '#1E293B',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.12s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F1F5F9')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <UserPlus size={16} color="#0055A5" />
                        <span>Add Members</span>
                      </button>
                    )}

                    {/* 3. Tutor/Admin Toggle: Allow Students to Add Members */}
                    {activeGroupDetail.can_manage_group && activeGroupDetail.creator_role !== 'Student' && (
                      <>
                        <div style={{ height: '1px', backgroundColor: isDark ? '#334155' : '#F1F5F9', margin: '4px 0' }} />
                        <div
                          onClick={() => {
                            if (!isUpdatingPermission) {
                              handleToggleStudentAddPermission(!activeGroupDetail.allow_students_to_add_members);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '8px 10px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: isDark ? '#F1F5F9' : '#1E293B',
                            borderRadius: '6px',
                            cursor: isUpdatingPermission ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.12s',
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F1F5F9')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          title={activeGroupDetail.allow_students_to_add_members ? 'Click to restrict invites to tutor' : 'Click to allow students to add members'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {activeGroupDetail.allow_students_to_add_members ? (
                              <Unlock size={16} color="#10B981" />
                            ) : (
                              <Lock size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                            )}
                            <span style={{ fontSize: '0.78rem' }}>Students Can Add Members</span>
                          </div>
                          {isUpdatingPermission ? (
                            <Spinner size={14} />
                          ) : (
                            <div
                              style={{
                                width: '32px',
                                height: '18px',
                                backgroundColor: activeGroupDetail.allow_students_to_add_members
                                  ? '#0055A5'
                                  : (isDark ? '#475569' : '#CBD5E1'),
                                borderRadius: '10px',
                                position: 'relative',
                                transition: 'background-color 0.2s',
                                flexShrink: 0,
                              }}
                            >
                              <div
                                style={{
                                  width: '14px',
                                  height: '14px',
                                  backgroundColor: '#FFFFFF',
                                  borderRadius: '50%',
                                  position: 'absolute',
                                  top: '2px',
                                  left: activeGroupDetail.allow_students_to_add_members ? '16px' : '2px',
                                  transition: 'left 0.2s',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div style={{ height: '1px', backgroundColor: isDark ? '#334155' : '#F1F5F9', margin: '4px 0' }} />

                    {/* 4. Leave / Join Group */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleToggleJoin(activeGroupDetail);
                      }}
                      disabled={joiningGroupId === activeGroupDetail.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: activeGroupDetail.is_member ? '#EF4444' : '#10B981',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: joiningGroupId === activeGroupDetail.id ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.12s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark
                          ? activeGroupDetail.is_member ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'
                          : activeGroupDetail.is_member ? '#FEF2F2' : '#F0FDF4';
                      }}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {joiningGroupId === activeGroupDetail.id ? (
                        <>
                          <Spinner size={14} />
                          <span>Processing...</span>
                        </>
                      ) : activeGroupDetail.is_member ? (
                        <>
                          <LogOut size={16} color="#EF4444" />
                          <span>Leave Group</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} color="#10B981" />
                          <span>Join Group</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Chat Messages Stream */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: isDark
                  ? 'linear-gradient(180deg, #0F172A 0%, #090D16 100%)'
                  : 'linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 100%)',
              }}
            >
              {loadingDetail ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Spinner size={32} />
                </div>
              ) : !activeGroupDetail.messages || activeGroupDetail.messages.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: '10px',
                    padding: '40px 20px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)',
                      border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                      color: '#0055A5',
                      marginBottom: '4px',
                    }}
                  >
                    <MessageSquare size={28} />
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    Welcome to {activeGroupDetail.name}!
                  </span>
                  <span style={{ fontSize: '0.82rem', color: isDark ? '#94A3B8' : '#64748B', maxWidth: '300px' }}>
                    No messages yet in this study circle. Start the conversation with your classmates!
                  </span>
                </div>
              ) : (
                activeGroupDetail.messages.map((msg: CourseGroupMessageDTO) => {
                  const isMe = user?.id && String(user.id) === String(msg.sender_id);
                  const roleUpper = (msg.sender_role || '').toUpperCase();
                  const isTutor = roleUpper === 'TUTOR' || roleUpper === 'TRAINING_ADMIN' || roleUpper === 'INSTRUCTOR';
                  const isCreator = String(msg.sender_id) === String(activeGroupDetail.creator_id);
                  const isQuestion = msg.text?.startsWith('[Question]');
                  const cleanText = isQuestion ? msg.text.replace(/^\[Question\]\s*/, '') : msg.text;

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        flexDirection: isMe ? 'row-reverse' : 'row',
                        position: 'relative',
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: msg.avatar_color || (isTutor ? '#4338CA' : '#0055A5'),
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          flexShrink: 0,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          overflow: 'hidden',
                          border: isTutor ? '2px solid #6366F1' : undefined,
                        }}
                      >
                        {msg.profile_photo ? (
                          <img
                            src={msg.profile_photo}
                            alt={msg.sender_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          msg.sender_name?.slice(0, 2).toUpperCase() || 'U'
                        )}
                      </div>

                      {/* Message Bubble & Details */}
                      <div
                        style={{
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {/* Sender info bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          {/* Role Badges in front of name */}
                          {isTutor && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.25)' : '#EEF2FF',
                                color: isDark ? '#A5B4FC' : '#4338CA',
                                border: isDark ? '1px solid rgba(165, 180, 252, 0.3)' : '1px solid #C7D2FE',
                              }}
                            >
                              <ShieldCheck size={11} /> Instructor
                            </span>
                          )}

                          {!isTutor && isCreator && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.66rem',
                                fontWeight: 600,
                                backgroundColor: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FEF3C7',
                                color: isDark ? '#FCD34D' : '#B45309',
                                border: isDark ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid #FDE68A',
                              }}
                            >
                              <Crown size={10} /> Circle Lead
                            </span>
                          )}

                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: isMe ? '#0055A5' : isDark ? '#F1F5F9' : '#0F172A',
                            }}
                          >
                            {isMe ? 'You' : msg.sender_name}
                          </span>

                          <span style={{ fontSize: '0.68rem', color: isDark ? '#94A3B8' : '#94A3B8' }}>
                            {msg.timestamp || 'Just now'}
                          </span>
                        </div>

                        {/* Bubble */}
                        <div
                          style={{
                            padding: '10px 16px',
                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: isMe
                              ? 'linear-gradient(135deg, #0055A5 0%, #003B73 100%)'
                              : isTutor
                              ? (isDark ? 'linear-gradient(145deg, #1E1B4B 0%, #1E293B 100%)' : 'linear-gradient(145deg, #F5F7FF 0%, #FFFFFF 100%)')
                              : undefined,
                            backgroundColor: isMe || isTutor
                              ? undefined
                              : isDark
                              ? '#1E293B'
                              : '#FFFFFF',
                            color: isMe ? '#FFFFFF' : isDark ? '#F8FAFC' : '#0F172A',
                            border: isMe
                              ? 'none'
                              : isTutor
                              ? (isDark ? '1.5px solid rgba(99, 102, 241, 0.45)' : '1.5px solid #C7D2FE')
                              : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            boxShadow: isMe
                              ? '0 3px 8px rgba(0, 85, 165, 0.22)'
                              : isTutor
                              ? '0 2px 8px rgba(99, 102, 241, 0.12)'
                              : (isDark ? '0 2px 6px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0, 0, 0, 0.04)'),
                          }}
                        >
                          {/* Question Flag Header */}
                          {isQuestion && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                backgroundColor: isDark ? 'rgba(234, 88, 12, 0.25)' : '#FFEDD5',
                                color: isDark ? '#FB923C' : '#C2410C',
                                marginBottom: '6px',
                                border: isDark ? '1px solid rgba(251, 146, 60, 0.3)' : '1px solid #FDBA74',
                              }}
                            >
                              <HelpCircle size={12} />
                              <span>Question</span>
                            </div>
                          )}

                          <div>{cleanText}</div>
                        </div>

                        {/* Interactive Emoji Reactions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {/* Reaction count pills */}
                          {messageReactions[msg.id] &&
                            Object.entries(messageReactions[msg.id]).map(([emoji, count]) => {
                              const isMyReaction = (userReactions[msg.id] || []).includes(emoji);
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '2px 7px',
                                    borderRadius: '12px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    backgroundColor: isMyReaction
                                      ? (isDark ? 'rgba(0, 85, 165, 0.35)' : '#EFF6FF')
                                      : (isDark ? '#1E293B' : '#F1F5F9'),
                                    border: isMyReaction
                                      ? '1px solid #0055A5'
                                      : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                                    color: isDark ? '#F1F5F9' : '#1E293B',
                                    cursor: 'pointer',
                                    transition: 'all 0.1s ease',
                                  }}
                                >
                                  <span>{emoji}</span>
                                  <span>{count}</span>
                                </button>
                              );
                            })}

                          {/* Quick React Trigger */}
                          <div style={{ position: 'relative' }}>
                            <button
                              type="button"
                              onClick={() => setActiveReactionMsgId((prev) => (prev === msg.id ? null : msg.id))}
                              title="Add reaction"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                                border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                                color: isDark ? '#94A3B8' : '#64748B',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                              }}
                            >
                              <Smile size={12} />
                            </button>

                            {activeReactionMsgId === msg.id && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '100%',
                                  left: isMe ? 'auto' : 0,
                                  right: isMe ? 0 : 'auto',
                                  marginBottom: '6px',
                                  display: 'flex',
                                  gap: '4px',
                                  padding: '4px 6px',
                                  borderRadius: '20px',
                                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                                  border: isDark ? '1px solid #334155' : '1px solid #CBD5E1',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                                  zIndex: 10,
                                }}
                              >
                                {['👍', '💡', '❓', '🎯', '😂', '🤔', '💖'].map((em) => (
                                  <button
                                    key={em}
                                    type="button"
                                    onClick={() => {
                                      toggleReaction(msg.id, em);
                                      setActiveReactionMsgId(null);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      fontSize: '0.95rem',
                                      cursor: 'pointer',
                                      padding: '2px 4px',
                                      borderRadius: '4px',
                                      lineHeight: 1,
                                      transition: 'transform 0.1s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.25)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
                                    {em}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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
                padding: '12px 20px 14px 20px',
                borderTop: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Quick Academic Action Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setIsQuestionMode((prev) => !prev)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    backgroundColor: isQuestionMode
                      ? (isDark ? 'rgba(234, 88, 12, 0.25)' : '#FFEDD5')
                      : (isDark ? '#0F172A' : '#F1F5F9'),
                    color: isQuestionMode
                      ? (isDark ? '#FB923C' : '#C2410C')
                      : (isDark ? '#94A3B8' : '#64748B'),
                    border: isQuestionMode
                      ? '1px solid #EA580C'
                      : (isDark ? '1px solid #334155' : '1px solid #E2E8F0'),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <HelpCircle size={13} />
                  <span>{isQuestionMode ? 'Question Mode Active' : 'Ask Question to Circle'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewMessageText((prev) => (prev ? `${prev} 👍` : '👍 Understood!'))}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '14px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    color: isDark ? '#94A3B8' : '#64748B',
                    cursor: 'pointer',
                  }}
                  title="Quick insert thumbs up"
                >
                  👍 Understood
                </button>

                <button
                  type="button"
                  onClick={() => setNewMessageText((prev) => (prev ? `${prev} 💡` : '💡 Helpful point: '))}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '14px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                    color: isDark ? '#94A3B8' : '#64748B',
                    cursor: 'pointer',
                  }}
                  title="Quick insert idea"
                >
                  💡 Key Idea
                </button>
              </div>

              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={
                    isQuestionMode
                      ? 'Ask your question to classmates & tutors...'
                      : `Write a message to "${activeGroupDetail.name}"...`
                  }
                  disabled={isSendingMessage}
                  style={{
                    flex: 1,
                    padding: '11px 18px',
                    borderRadius: '24px',
                    border: isQuestionMode
                      ? '1.5px solid #EA580C'
                      : (isDark ? '1.5px solid #334155' : '1.5px solid #CBD5E1'),
                    backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxShadow: isQuestionMode ? '0 0 0 2px rgba(234, 88, 12, 0.15)' : 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
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
                    padding: '11px 20px',
                    borderRadius: '24px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    background: !newMessageText.trim()
                      ? (isDark ? '#334155' : '#CBD5E1')
                      : isQuestionMode
                      ? 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)'
                      : 'linear-gradient(135deg, #0055A5 0%, #003B73 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: !newMessageText.trim() || isSendingMessage ? 'not-allowed' : 'pointer',
                    boxShadow: !newMessageText.trim() ? 'none' : '0 2px 6px rgba(0, 85, 165, 0.28)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isSendingMessage ? <Spinner size={16} /> : <Send size={16} />}
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Group Members & Course Info */}
          {showRightSidebar && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={15} color="#0055A5" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    Group Members
                  </span>
                </div>
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
                  activeGroupDetail.members.map((m) => {
                    const isMemberCreator = m.is_creator || String(m.id) === String(activeGroupDetail.creator_id);
                    const canRemove =
                      activeGroupDetail.can_manage_group &&
                      !isMemberCreator &&
                      String(m.id) !== String(user?.id);

                    return (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                          border: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
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
                              overflow: 'hidden',
                            }}
                          >
                            {m.profile_photo ? (
                              <img
                                src={m.profile_photo}
                                alt={m.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              m.name?.slice(0, 2).toUpperCase() || 'M'
                            )}
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
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span>{m.name}</span>
                              {isMemberCreator && (
                                <span title="Group Creator" style={{ display: 'inline-flex' }}>
                                  <Crown size={12} color="#D97706" />
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                              {m.role}
                              {m.student_id ? ` • ${m.student_id}` : ''}
                            </div>
                          </div>
                        </div>

                        {canRemove && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: isDark ? '#94A3B8' : '#94A3B8',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Remove member"
                          >
                            <UserMinus size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Circle Etiquette Card */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(0, 85, 165, 0.12)' : '#EFF6FF',
                border: isDark ? '1px solid rgba(0, 85, 165, 0.28)' : '1px solid rgba(0, 85, 165, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                <Award size={14} color="#0055A5" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0055A5' }}>
                  Circle Etiquette
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.74rem', color: isDark ? '#94A3B8' : '#475569', lineHeight: 1.45 }}>
                Ask questions freely, verify solutions respectfully, and tag your tutor when conceptual guidance is needed.
              </p>
            </div>
          </div>
        )}
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
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #155e75 45%, #2e2870 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(30, 58, 95, 0.25)',
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
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

              {/* Student Member Permission Options */}
              {user?.isTutor?.() || ['TUTOR', 'SYSTEM_ADMIN', 'TRAINING_ADMIN'].includes(user?.role || '') ? (
                <div
                  style={{
                    backgroundColor: isDark ? '#1E3A8A22' : '#EFF6FF',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: isDark ? '1px solid #1E40AF' : '1px solid #BFDBFE',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={createAllowStudentsToAdd}
                      onChange={(e) => setCreateAllowStudentsToAdd(e.target.checked)}
                      disabled={isCreatingGroup}
                      style={{
                        width: '16px',
                        height: '16px',
                        marginTop: '2px',
                        cursor: 'pointer',
                        accentColor: '#0055A5',
                      }}
                    />
                    <div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 700, color: isDark ? '#93C5FD' : '#0369A1' }}>
                        Allow student members to add other classmates
                      </span>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.76rem', color: isDark ? '#60A5FA' : '#0284C7', lineHeight: 1.4 }}>
                        When checked, students in this group can invite other enrolled peers. When unchecked, only you as the instructor can add members.
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    color: isDark ? '#94A3B8' : '#475569',
                    border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
                  }}
                >
                  <strong>Peer Study Group:</strong> Once created, you and any member who joins this group can add other classmates.
                </div>
              )}

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

      {/* Add Members Modal */}
      {activeGroupDetail && (
        <AddGroupMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          group={activeGroupDetail}
          courseId={activeGroupDetail.course_id || (courses[0]?.id ?? '')}
          currentMemberIds={activeGroupDetail.members?.map((m) => m.id) || []}
          onMembersAdded={(updatedDetail) => {
            setActiveGroupDetail(updatedDetail);
            setGroups((prev) =>
              prev.map((g) =>
                g.id === updatedDetail.id
                  ? {
                      ...g,
                      members_count: updatedDetail.members_count,
                      can_add_members: updatedDetail.can_add_members,
                    }
                  : g
              )
            );
          }}
        />
      )}
    </div>
  );
};
