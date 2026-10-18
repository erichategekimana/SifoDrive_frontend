import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Loader2,
  LogOut,
  UserPlus,
  MessageSquare,
  Send,
  ArrowLeft,
  Crown,
  Lock,
  Unlock,
  UserMinus,
} from 'lucide-react';
import type { CourseGroupDetailDTO, CourseGroupMessageDTO } from '../../../../../core/services/CourseGroupService';

interface GroupChatViewProps {
  activeGroupDetail: CourseGroupDetailDTO | null;
  isLoadingGroupDetail: boolean;
  isJoiningGroup: boolean;
  chatInput: string;
  setChatInput: (val: string) => void;
  isSendingMessage: boolean;
  user: any;
  currentUserName: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onToggleJoin: () => void;
  onSendMessage: (e: React.FormEvent) => void;
  onCloseChat: () => void;
  onOpenAddMembers?: () => void;
  onToggleStudentAddPermission?: (enabled: boolean) => void;
  isUpdatingPermission?: boolean;
  onRemoveMember?: (userId: string) => void;
}

export const GroupChatView: React.FC<GroupChatViewProps> = ({
  activeGroupDetail,
  isLoadingGroupDetail,
  isJoiningGroup,
  chatInput,
  setChatInput,
  isSendingMessage,
  user,
  currentUserName,
  messagesEndRef,
  onToggleJoin,
  onSendMessage,
  onCloseChat,
  onOpenAddMembers,
  onToggleStudentAddPermission,
  isUpdatingPermission = false,
  onRemoveMember,
}) => {
  const [showMembersDrawer, setShowMembersDrawer] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (!activeGroupDetail) {
    return (
      <div className="canvas-card" style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
        <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} color="#0055A5" />
        <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading study group...</p>
      </div>
    );
  }

  const isCreator = user?.id && String(activeGroupDetail.creator_id) === String(user.id);
  const isTutorOrAdmin =
    user?.isTutor?.() ||
    ['TUTOR', 'SYSTEM_ADMIN', 'TRAINING_ADMIN', 'BRANCH_ADMIN', 'STAFF'].includes(user?.role);
  const canManage = Boolean(activeGroupDetail.can_manage_group || isTutorOrAdmin || isCreator);
  const canAddMembers = Boolean(activeGroupDetail.can_add_members);
  const isStudentGroup = activeGroupDetail.creator_role === 'Student';
  const allowStudentsToAdd = Boolean(activeGroupDetail.allow_students_to_add_members);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: showMembersDrawer ? 'minmax(0, 1fr) 300px' : 'minmax(0, 1fr)',
        gap: '16px',
        alignItems: 'start',
      }}
    >
      {/* ─── LEFT: MAIN CHAT CONTAINER ─── */}
      <div
        className="canvas-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '660px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={onCloseChat}
              className="canvas-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                fontSize: '0.8rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#334155',
                fontWeight: 600,
              }}
              title="Back to all study groups"
            >
              <ArrowLeft size={14} />
              <span>All Groups</span>
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {activeGroupDetail.name}
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: isStudentGroup ? '#EFF6FF' : '#DCFCE7',
                    color: isStudentGroup ? '#0055A5' : '#15803D',
                    border: `1px solid ${isStudentGroup ? '#BFDBFE' : '#BBF7D0'}`,
                    padding: '1px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {isStudentGroup ? 'Student Study Group' : 'Instructor Group'}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    backgroundColor: '#E2E8F0',
                    color: '#475569',
                    fontWeight: 600,
                  }}
                >
                  {activeGroupDetail.category || 'General'}
                </span>
              </div>
              {activeGroupDetail.description && (
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                  {activeGroupDetail.description}
                </div>
              )}
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
                backgroundColor: isMenuOpen ? '#E2E8F0' : '#F1F5F9',
                border: '1.5px solid #94A3B8',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E2E8F0';
                e.currentTarget.style.borderColor = '#0055A5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isMenuOpen ? '#E2E8F0' : '#F1F5F9';
                e.currentTarget.style.borderColor = '#94A3B8';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{ display: 'block' }}
              >
                <circle cx="12" cy="5" r="2.5" fill="#0F172A" />
                <circle cx="12" cy="12" r="2.5" fill="#0F172A" />
                <circle cx="12" cy="19" r="2.5" fill="#0F172A" />
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
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #CBD5E1',
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
                    setShowMembersDrawer((prev) => !prev);
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
                    color: '#1E293B',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.12s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="#0055A5" />
                    <span>{showMembersDrawer ? 'Hide Members' : 'View Members'}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: '#EFF6FF',
                      color: '#0055A5',
                    }}
                  >
                    {activeGroupDetail.members_count ?? activeGroupDetail.members?.length ?? 0}
                  </span>
                </button>

                {/* 2. Add Members */}
                {canAddMembers && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAddMembers?.();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#1E293B',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.12s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <UserPlus size={16} color="#0055A5" />
                    <span>Add Members</span>
                  </button>
                )}

                {/* 3. Tutor/Admin Toggle: Allow Students to Add Members */}
                {canManage && onToggleStudentAddPermission && !isStudentGroup && (
                  <>
                    <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
                    <div
                      onClick={() => {
                        if (!isUpdatingPermission) {
                          onToggleStudentAddPermission(!allowStudentsToAdd);
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
                        color: '#1E293B',
                        borderRadius: '6px',
                        cursor: isUpdatingPermission ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.12s',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      title={allowStudentsToAdd ? 'Click to restrict invites to tutors' : 'Click to allow students to add members'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {allowStudentsToAdd ? <Unlock size={16} color="#15803D" /> : <Lock size={16} color="#64748B" />}
                        <span style={{ fontSize: '0.78rem' }}>Students Can Add Members</span>
                      </div>
                      {isUpdatingPermission ? (
                        <Loader2 size={14} className="animate-spin" color="#0055A5" />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '18px',
                            backgroundColor: allowStudentsToAdd ? '#0055A5' : '#CBD5E1',
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
                              left: allowStudentsToAdd ? '16px' : '2px',
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />

                {/* 4. Leave / Join Group */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onToggleJoin();
                  }}
                  disabled={isJoiningGroup}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: activeGroupDetail.is_member ? '#DC2626' : '#15803D',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: isJoiningGroup ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.12s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = activeGroupDetail.is_member ? '#FEF2F2' : '#F0FDF4';
                  }}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {isJoiningGroup ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : activeGroupDetail.is_member ? (
                    <>
                      <LogOut size={15} color="#DC2626" />
                      <span>Leave Group</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} color="#15803D" />
                      <span>Join Group</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div
          style={{
            padding: '24px 20px',
            flex: 1,
            overflowY: 'auto',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {isLoadingGroupDetail ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: '10px',
              }}
            >
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
                    gap: '10px',
                    maxWidth: '82%',
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
                      backgroundColor: msg.avatar_color || (isInstructor ? '#058728' : '#0055A5'),
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      overflow: 'hidden',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {msg.profile_photo ? (
                      <img
                        src={msg.profile_photo}
                        alt={msg.sender_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      msg.sender_name.substring(0, 2).toUpperCase()
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div style={{ maxWidth: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px',
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: isMine ? '#0055A5' : '#0F172A',
                        }}
                      >
                        {isMine ? 'You' : msg.sender_name}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{msg.timestamp}</span>
                    </div>

                    <div
                      style={{
                        backgroundColor: isMine
                          ? undefined
                          : '#FFFFFF',
                        background: isMine
                          ? 'linear-gradient(135deg, #0055A5 0%, #003B73 100%)'
                          : undefined,
                        color: isMine ? '#FFFFFF' : '#0F172A',
                        border: isMine ? 'none' : '1px solid #E2E8F0',
                        padding: '10px 15px',
                        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: '0.86rem',
                        lineHeight: 1.5,
                        boxShadow: isMine
                          ? '0 3px 8px rgba(0, 85, 165, 0.22)'
                          : '0 2px 5px rgba(0, 0, 0, 0.04)',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
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
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E2E8F0',
                  color: '#0055A5',
                  marginBottom: '4px',
                }}
              >
                <MessageSquare size={28} />
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                Welcome to {activeGroupDetail.name}!
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '300px' }}>
                No messages yet. Start the conversation with your classmates and instructor!
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Composer */}
        <form
          onSubmit={onSendMessage}
          style={{
            padding: '14px 20px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder={`Message "${activeGroupDetail.name}"...`}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            disabled={isSendingMessage}
            style={{
              flex: 1,
              padding: '11px 18px',
              border: '1.5px solid #CBD5E1',
              borderRadius: '24px',
              fontSize: '0.86rem',
              outline: 'none',
              backgroundColor: '#F1F5F9',
              color: '#0F172A',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
            }}
          />
          <button
            type="submit"
            className="canvas-btn"
            disabled={!chatInput.trim() || isSendingMessage}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '11px 20px',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '24px',
              backgroundColor: '#0055A5',
              color: '#FFFFFF',
              border: 'none',
              cursor: !chatInput.trim() || isSendingMessage ? 'not-allowed' : 'pointer',
              opacity: !chatInput.trim() || isSendingMessage ? 0.6 : 1,
              boxShadow: '0 2px 6px rgba(0, 85, 165, 0.28)',
              transition: 'all 0.15s ease',
            }}
          >
            {isSendingMessage ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* ─── RIGHT: MEMBERS PANEL ─── */}
      {showMembersDrawer && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '660px' }}>
          {/* Members Roster Card */}
          <div
            className="canvas-card"
            style={{
              padding: '16px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid #F1F5F9',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} color="#0055A5" />
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                  Group Members
                </span>
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: '#EFF6FF',
                  color: '#0055A5',
                  border: '1px solid #BFDBFE',
                }}
              >
                {activeGroupDetail.members?.length || 0}
              </span>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '2px',
              }}
            >
              {!activeGroupDetail.members || activeGroupDetail.members.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0, padding: '10px 0' }}>
                  No members joined yet.
                </p>
              ) : (
                activeGroupDetail.members.map((m) => {
                  const isMemberInstructor = m.role === 'Instructor';
                  const isMemberCreator = m.is_creator || String(m.id) === String(activeGroupDetail.creator_id);
                  const canRemove = canManage && !isMemberCreator && String(m.id) !== String(user?.id);

                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #F1F5F9',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
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
                            m.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#1E293B',
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
                          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                            {isMemberInstructor ? 'Instructor' : 'Student'}
                            {m.student_id ? ` • ${m.student_id}` : ''}
                          </div>
                        </div>
                      </div>

                      {canRemove && onRemoveMember && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(m.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Remove from group"
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
        </div>
      )}
    </div>
  );
};

export default GroupChatView;
