import React from 'react';
import { Users, Loader2, LogOut, UserPlus, MessageSquare, Send, ArrowLeft } from 'lucide-react';
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
}) => {
  return (
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
            onClick={onCloseChat}
            className="canvas-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              fontSize: '0.8rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#374151',
            }}
            title="Back to all groups"
          >
            <ArrowLeft size={14} />
            <span>All Groups</span>
          </button>

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
              onClick={onToggleJoin}
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
        onSubmit={onSendMessage}
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
  );
};

export default GroupChatView;
