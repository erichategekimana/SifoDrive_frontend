import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users,
  Search,
  Plus,
  MessageSquare,
  Send,
  Crown,
  Info,
  UserCheck,
  Loader2,
  RefreshCw,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { Course } from '../../../../core/models/Course';
import {
  CourseGroupService,
  type CourseRosterUserDTO,
  type CourseGroupDTO,
  type CourseGroupDetailDTO,
  type CourseGroupMessageDTO,
} from '../../../../core/services/CourseGroupService';

interface CoursePeopleTabProps {
  course: Course;
  activeGroupId?: string | null;
  onSelectGroup?: (groupId: string | null) => void;
  initialGroupId?: string | null;
}

export const CoursePeopleTab: React.FC<CoursePeopleTabProps> = ({
  course,
  activeGroupId: propActiveGroupId,
  onSelectGroup,
  initialGroupId,
}) => {
  const { user } = useAuth();
  const groupService = CourseGroupService.getInstance();

  const isCurrentUserTutor =
    user?.isTutor() ||
    user?.role === 'SYSTEM_ADMIN' ||
    user?.role === 'TRAINING_ADMIN' ||
    false;
  const currentUserName = user?.fullName || (isCurrentUserTutor ? 'Instructor' : 'Learner');

  // Subtabs & selection
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'groups'>('groups');
  const [internalActiveGroupId, setInternalActiveGroupId] = useState<string | null>(
    propActiveGroupId !== undefined ? propActiveGroupId : initialGroupId || null
  );

  const activeGroupId = propActiveGroupId !== undefined ? propActiveGroupId : internalActiveGroupId;

  const setActiveGroupId = (groupId: string | null) => {
    setInternalActiveGroupId(groupId);
    onSelectGroup?.(groupId);
  };

  useEffect(() => {
    if (propActiveGroupId !== undefined) {
      setInternalActiveGroupId(propActiveGroupId);
    }
  }, [propActiveGroupId]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Instructor' | 'Student'>('ALL');

  // Real backend data states
  const [roster, setRoster] = useState<CourseRosterUserDTO[]>([]);
  const [courseGroups, setCourseGroups] = useState<CourseGroupDTO[]>([]);
  const [activeGroupDetail, setActiveGroupDetail] = useState<CourseGroupDetailDTO | null>(null);

  // Loading & Async states
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingGroupDetail, setIsLoadingGroupDetail] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);

  // Modal State for Group Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('General Road Rules & Highway Code');

  // Chat Composer State
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 1. Fetch Roster
  const fetchRoster = useCallback(async () => {
    setIsLoadingRoster(true);
    try {
      const data = await groupService.getRoster(course.id);
      setRoster(data);
    } catch (err) {
      console.error('Failed to load course roster:', err);
    } finally {
      setIsLoadingRoster(false);
    }
  }, [course.id, groupService]);

  // 2. Fetch Groups List
  const fetchGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    try {
      const data = await groupService.getGroups(course.id);
      setCourseGroups(data);
    } catch (err) {
      console.error('Failed to load course groups:', err);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [course.id, groupService]);

  // 3. Fetch Selected Group Detail & Messages
  const fetchGroupDetail = useCallback(async (groupId: string, silent = false) => {
    if (!silent) setIsLoadingGroupDetail(true);
    try {
      const detail = await groupService.getGroupDetail(groupId);
      setActiveGroupDetail(detail);
      // Keep groups card count synchronized
      setCourseGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, members_count: detail.members_count, is_member: detail.is_member }
            : g
        )
      );
    } catch (err) {
      console.error('Failed to load group details:', err);
    } finally {
      if (!silent) setIsLoadingGroupDetail(false);
    }
  }, [groupService]);

  // Initial load
  useEffect(() => {
    fetchGroups();
    fetchRoster();
  }, [fetchGroups, fetchRoster]);

  // Load active group detail when activeGroupId changes
  useEffect(() => {
    if (activeGroupId) {
      fetchGroupDetail(activeGroupId);
    } else {
      setActiveGroupDetail(null);
    }
  }, [activeGroupId, fetchGroupDetail]);

  // Polling for live chat updates while inside active group
  useEffect(() => {
    if (!activeGroupId) return;

    const interval = setInterval(() => {
      fetchGroupDetail(activeGroupId, true);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeGroupId, fetchGroupDetail]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (activeGroupDetail?.messages?.length) {
      scrollToBottom('auto');
    }
  }, [activeGroupDetail?.messages?.length]);

  // Handle Group Creation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || isCreatingGroup) return;

    setIsCreatingGroup(true);
    try {
      const created = await groupService.createGroup(course.id, {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        category: newGroupCategory,
      });

      setCourseGroups((prev) => [created, ...prev]);
      setActiveGroupId(created.id);
      setActiveGroupDetail(created);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // Handle Sending a Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = chatInput.trim();
    if (!content || !activeGroupId || isSendingMessage) return;

    setIsSendingMessage(true);
    setChatInput('');

    try {
      const newMsg = await groupService.sendMessage(activeGroupId, content);

      // Optimistically append new message to state
      setActiveGroupDetail((prev) => {
        if (!prev) return null;
        const exists = prev.messages.some((m) => m.id === newMsg.id);
        const updatedMsgs = exists ? prev.messages : [...prev.messages, newMsg];
        return {
          ...prev,
          is_member: true,
          messages: updatedMsgs,
        };
      });

      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err) {
      console.error('Failed to send group message:', err);
      // Restore input if sending failed
      setChatInput(content);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle Toggle Join / Leave Group
  const handleToggleJoin = async () => {
    if (!activeGroupId || isJoiningGroup) return;

    setIsJoiningGroup(true);
    try {
      const result = await groupService.toggleJoinGroup(activeGroupId);
      setActiveGroupDetail((prev) =>
        prev
          ? {
              ...prev,
              is_member: result.is_member,
              members_count: result.members_count,
            }
          : null
      );
      setCourseGroups((prev) =>
        prev.map((g) =>
          g.id === activeGroupId
            ? { ...g, is_member: result.is_member, members_count: result.members_count }
            : g
        )
      );
    } catch (err) {
      console.error('Failed to toggle group membership:', err);
    } finally {
      setIsJoiningGroup(false);
    }
  };

  // Filtered Roster
  const filteredRoster = roster.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.student_id && u.student_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.category && u.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Group Chat Room View (when a group is selected) */}
      {activeGroupId ? (
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
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    {activeGroupDetail?.name || 'Loading group...'}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      border: '1px solid #E5E7EB',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {activeGroupDetail?.creator_role === 'Tutor' ? 'Instructor Group' : 'Student Group'}
                  </span>
                </div>
                {activeGroupDetail?.description && (
                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                    {activeGroupDetail.description}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569' }}>
                <Users size={15} color="#0055A5" />
                <span>
                  <strong>{activeGroupDetail?.members_count ?? 0}</strong> members
                </span>
              </div>

              {activeGroupDetail && (
                <button
                  onClick={handleToggleJoin}
                  disabled={isJoiningGroup}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '5px 12px',
                    borderRadius: '4px',
                    backgroundColor: activeGroupDetail.is_member ? '#F8FAFC' : '#0055A5',
                    color: activeGroupDetail.is_member ? '#475569' : '#FFFFFF',
                    border: activeGroupDetail.is_member ? '1px solid #CBD5E1' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isJoiningGroup ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : activeGroupDetail.is_member ? (
                    <>
                      <LogOut size={13} />
                      <span>Leave Group</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={13} />
                      <span>Join Group</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div
            style={{
              padding: '20px',
              height: '400px',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {isLoadingGroupDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px' }}>
                <Loader2 size={24} className="animate-spin" color="#0055A5" />
                <span style={{ fontSize: '0.82rem', color: '#64748B' }}>Loading messages...</span>
              </div>
            ) : activeGroupDetail?.messages?.length ? (
              activeGroupDetail.messages.map((msg: CourseGroupMessageDTO) => {
                const isInstructor = msg.sender_role === 'Tutor';
                const isMine =
                  (user?.id && String(msg.sender_id) === String(user.id)) ||
                  msg.sender_name === currentUserName;

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
                        backgroundColor: msg.avatar_color || '#0055A5',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {msg.sender_name.substring(0, 2).toUpperCase()}
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
                          {msg.sender_name}
                        </span>
                        {isInstructor && (
                          <span
                            style={{
                              fontSize: '0.62rem',
                              fontWeight: 600,
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              border: '1px solid #E5E7EB',
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
              })
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: '#94A3B8' }}>
                <MessageSquare size={32} />
                <span style={{ fontSize: '0.85rem' }}>No messages in this study group yet. Be the first to start the conversation!</span>
              </div>
            )}
            <div ref={messagesEndRef} />
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
              placeholder={`Message ${activeGroupDetail?.name || 'group'}...`}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={isSendingMessage}
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
              disabled={!chatInput.trim() || isSendingMessage}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                fontSize: '0.82rem',
                opacity: !chatInput.trim() || isSendingMessage ? 0.6 : 1,
              }}
            >
              {isSendingMessage ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
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

            {/* "Create Group" Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => (activeSubTab === 'groups' ? fetchGroups() : fetchRoster())}
                className="canvas-btn"
                title="Refresh"
                style={{ padding: '7px 10px', fontSize: '0.8rem' }}
              >
                <RefreshCw size={14} className={isLoadingGroups || isLoadingRoster ? 'animate-spin' : ''} />
              </button>

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
          </div>

          {/* Subtab: Course Groups */}
          {activeSubTab === 'groups' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isLoadingGroups ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} color="#0055A5" />
                  <span style={{ fontSize: '0.84rem' }}>Loading study groups...</span>
                </div>
              ) : courseGroups.length === 0 ? (
                <div className="canvas-card" style={{ padding: '40px', textAlign: 'center' }}>
                  <Users size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', margin: '0 0 6px 0' }}>
                    No Study Groups Yet
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', maxWidth: '400px', margin: '0 auto 16px' }}>
                    Form a study group to share mock exam tips, discuss highway code rules, and learn together.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="canvas-btn canvas-btn-primary"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <Plus size={14} style={{ marginRight: '6px' }} />
                    Create First Group
                  </button>
                </div>
              ) : (
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
                        borderTop: '4px solid #4B5563',
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
                              fontWeight: 600,
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              border: '1px solid #E5E7EB',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {grp.creator_role === 'Tutor' ? 'Instructor Created' : 'Student Group'}
                          </span>
                        </div>

                        {grp.description && (
                          <p style={{ fontSize: '0.83rem', color: '#4B5563', lineHeight: 1.45, marginBottom: '14px' }}>
                            {grp.description}
                          </p>
                        )}
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
                            <span><strong>{grp.members_count}</strong> members</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            {grp.category}
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
              )}
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
                        fontSize: '0.78rem',
                        fontWeight: roleFilter === r ? 700 : 500,
                        backgroundColor: roleFilter === r ? '#0055A5' : '#FFFFFF',
                        color: roleFilter === r ? '#FFFFFF' : '#374151',
                        border: '1px solid',
                        borderColor: roleFilter === r ? '#0055A5' : '#D0D5DD',
                      }}
                    >
                      {r === 'ALL' ? 'All Roles' : `${r}s`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Roster List Card */}
              {isLoadingRoster ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} color="#0055A5" />
                  <span style={{ fontSize: '0.84rem' }}>Loading course roster...</span>
                </div>
              ) : filteredRoster.length === 0 ? (
                <div className="canvas-card" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                  <UserCheck size={32} style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>No participants found matching your criteria.</p>
                </div>
              ) : (
                <div className="canvas-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div>
                    {filteredRoster.map((u) => (
                      <div
                        key={u.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 20px',
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background-color 0.1s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: u.avatar_color,
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
                                <Crown size={14} color="#4B5563" />
                              )}
                            </div>

                            <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                              {u.student_id ? `${u.student_id} • ` : ''}{u.category}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#058728', marginTop: '2px' }}>
                              {u.last_active}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              border: '1px solid #E5E7EB',
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
        </div>
      )}

      {/* 4. Group Creation Modal */}
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
                  disabled={isCreatingGroup}
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
                  disabled={isCreatingGroup}
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
                  disabled={isCreatingGroup}
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
                  disabled={isCreatingGroup}
                  className="canvas-btn"
                  style={{ fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGroup || !newGroupName.trim()}
                  className="canvas-btn canvas-btn-primary"
                  style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isCreatingGroup && <Loader2 size={13} className="animate-spin" />}
                  <span>{isCreatingGroup ? 'Creating...' : 'Create Group'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
