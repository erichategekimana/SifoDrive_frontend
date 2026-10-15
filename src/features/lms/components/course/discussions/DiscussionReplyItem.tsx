import React from 'react';
import { Heart, Trash2, CornerDownRight, ChevronDown, ChevronUp } from 'lucide-react';
import type { DiscussionReplyDTO } from '../../../../../core/services/CourseDiscussionService';

interface DiscussionReplyItemProps {
  reply: DiscussionReplyDTO;
  children: DiscussionReplyDTO[];
  isCollapsed: boolean;
  isTutor: boolean;
  userId?: string;
  isTopicLocked: boolean;
  onToggleLikeReply: (replyId: string, e?: React.MouseEvent) => void;
  onDeleteReply: (replyId: string) => void;
  onToggleRepliesVisibility: (replyId: string) => void;
  onStartReplyTo: (parentReply: DiscussionReplyDTO) => void;
}

export const DiscussionReplyItem: React.FC<DiscussionReplyItemProps> = ({
  reply,
  children,
  isCollapsed,
  isTutor,
  userId,
  isTopicLocked,
  onToggleLikeReply,
  onDeleteReply,
  onToggleRepliesVisibility,
  onStartReplyTo,
}) => {
  const hasChildren = children.length > 0;
  const canDeleteThisReply = isTutor || reply.author_id === userId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Top-Level Reply Card */}
      <div
        style={{
          padding: '18px 22px',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: reply.is_author_tutor ? '#0055A5' : '#475569',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {reply.author_name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1E293B' }}>
                  {reply.author_name}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#F3F4F6',
                    color: '#000000',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  {reply.is_author_tutor ? 'Instructor' : 'Student'}
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>{reply.date}</span>
            </div>
          </div>

          {/* Reply Actions: Delete (if allowed) */}
          {canDeleteThisReply && (
            <button
              onClick={() => onDeleteReply(reply.id)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
              title="Delete reply"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <p style={{ fontSize: '0.91rem', color: '#334155', lineHeight: 1.6, margin: '0 0 12px 0', whiteSpace: 'pre-wrap' }}>
          {reply.content}
        </p>

        {/* Actions on Comment: Like, Reply, and View/Hide Replies */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* LIKE / UNLIKE BUTTON ON REPLY */}
          <button
            onClick={() => onToggleLikeReply(reply.id)}
            style={{
              border: 'none',
              background: 'transparent',
              color: reply.has_liked ? '#DC2626' : '#64748B',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 6px',
              borderRadius: '4px',
              backgroundColor: reply.has_liked ? '#FEF2F2' : 'transparent',
              transition: 'all 0.15s ease',
            }}
            title={reply.has_liked ? 'Unlike this comment' : 'Like this comment'}
          >
            <Heart
              size={13}
              fill={reply.has_liked ? '#DC2626' : 'none'}
              color={reply.has_liked ? '#DC2626' : '#64748B'}
            />
            <span>{reply.has_liked ? 'Liked' : 'Like'}</span>
            {reply.likes_count > 0 && <span>({reply.likes_count})</span>}
          </button>

          {/* REPLY TO THIS COMMENT BUTTON */}
          {(!isTopicLocked || isTutor) && (
            <button
              onClick={() => onStartReplyTo(reply)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#0055A5',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 6px',
                borderRadius: '4px',
              }}
            >
              <CornerDownRight size={13} />
              <span>Reply</span>
            </button>
          )}

          {/* VIEW REPLIES / HIDE REPLIES TOGGLE BUTTON */}
          {hasChildren && (
            <button
              onClick={() => onToggleRepliesVisibility(reply.id)}
              style={{
                border: 'none',
                background: '#EFF6FF',
                color: '#0055A5',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '12px',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#BFDBFE',
              }}
            >
              {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              <span>
                {isCollapsed
                  ? `View ${children.length} ${children.length === 1 ? 'reply' : 'replies'}`
                  : `Hide ${children.length} ${children.length === 1 ? 'reply' : 'replies'}`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Nested / Child Replies (Rendered when not collapsed) */}
      {!isCollapsed &&
        children.map((child) => {
          const canDeleteChild = isTutor || child.author_id === userId;
          return (
            <div
              key={child.id}
              style={{
                marginLeft: '36px',
                padding: '14px 18px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                borderLeft: '3px solid #0055A5',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: child.is_author_tutor ? '#0055A5' : '#64748B',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {child.author_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#1E293B' }}>
                        {child.author_name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: '#F3F4F6',
                          color: '#000000',
                          border: '1px solid #E5E7EB',
                        }}
                      >
                        {child.is_author_tutor ? 'Instructor' : 'Student'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{child.date}</span>
                  </div>
                </div>

                {canDeleteChild && (
                  <button
                    onClick={() => onDeleteReply(child.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                    title="Delete reply"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.55, margin: '0 0 10px 0', whiteSpace: 'pre-wrap' }}>
                {child.content}
              </p>

              {/* Actions on Nested Reply: Like and Reply */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => onToggleLikeReply(child.id)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: child.has_liked ? '#DC2626' : '#64748B',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    backgroundColor: child.has_liked ? '#FEF2F2' : 'transparent',
                  }}
                  title={child.has_liked ? 'Unlike' : 'Like'}
                >
                  <Heart
                    size={12}
                    fill={child.has_liked ? '#DC2626' : 'none'}
                    color={child.has_liked ? '#DC2626' : '#64748B'}
                  />
                  <span>{child.has_liked ? 'Liked' : 'Like'}</span>
                  {child.likes_count > 0 && <span>({child.likes_count})</span>}
                </button>

                {(!isTopicLocked || isTutor) && (
                  <button
                    onClick={() => onStartReplyTo(reply)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#0055A5',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '2px 4px',
                    }}
                  >
                    <CornerDownRight size={12} />
                    <span>Reply</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default DiscussionReplyItem;
