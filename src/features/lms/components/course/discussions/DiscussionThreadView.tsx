import React from 'react';
import {
  ArrowLeft,
  Lock,
  Unlock,
  Trash2,
  Pin,
  Clock,
  Heart,
  CornerDownRight,
  MessageSquare,
  AlertCircle,
  Send,
} from 'lucide-react';
import type { DiscussionTopicDTO, DiscussionReplyDTO } from '../../../../../core/services/CourseDiscussionService';
import { Spinner } from '../../../../../components/common/Spinner';
import { DiscussionReplyItem } from './DiscussionReplyItem';

interface DiscussionThreadViewProps {
  selectedTopic: DiscussionTopicDTO | null;
  isTutor: boolean;
  userId?: string;
  loadingDetail: boolean;
  replyContent: string;
  setReplyContent: (val: string) => void;
  replyingToParent: DiscussionReplyDTO | null;
  setReplyingToParent: (val: DiscussionReplyDTO | null) => void;
  isSubmittingReply: boolean;
  replyError: string;
  collapsedReplyIds: Record<string, boolean>;
  threadedReplies: {
    topLevel: DiscussionReplyDTO[];
    childrenMap: { [parentId: string]: DiscussionReplyDTO[] };
  };
  onBack: () => void;
  onToggleLock: (topicId: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onToggleLikeTopic: (topicId: string) => void;
  onToggleLikeReply: (replyId: string, e?: React.MouseEvent) => void;
  onDeleteReply: (replyId: string) => void;
  onToggleRepliesVisibility: (replyId: string) => void;
  onPostReply: (e: React.FormEvent) => void;
  replyTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const DiscussionThreadView: React.FC<DiscussionThreadViewProps> = ({
  selectedTopic,
  isTutor,
  userId,
  loadingDetail,
  replyContent,
  setReplyContent,
  replyingToParent,
  setReplyingToParent,
  isSubmittingReply,
  replyError,
  collapsedReplyIds,
  threadedReplies,
  onBack,
  onToggleLock,
  onDeleteTopic,
  onToggleLikeTopic,
  onToggleLikeReply,
  onDeleteReply,
  onToggleRepliesVisibility,
  onPostReply,
  replyTextareaRef,
}) => {
  if (loadingDetail) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <Spinner message="Loading discussion thread..." />
      </div>
    );
  }

  if (!selectedTopic || (!isTutor && selectedTopic.is_locked)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Discussion thread not found.</p>
        <button
          onClick={onBack}
          className="canvas-btn"
          style={{ marginTop: '12px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Discussions</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBack}
          className="canvas-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#0055A5',
            padding: '8px 14px',
            borderRadius: '6px',
            border: '1px solid #BFDBFE',
            backgroundColor: '#EFF6FF',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Discussions</span>
        </button>

        {/* Tutor Moderation Actions on Header */}
        {isTutor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onToggleLock(selectedTopic.id)}
              className="canvas-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '7px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedTopic.is_locked ? '#F0FDF4' : '#FEF3C7',
                color: selectedTopic.is_locked ? '#15803D' : '#B45309',
                border: `1px solid ${selectedTopic.is_locked ? '#BBF7D0' : '#FDE68A'}`,
              }}
              title={selectedTopic.is_locked ? 'Unlock discussion for students' : 'Lock discussion to prevent replies'}
            >
              {selectedTopic.is_locked ? <Unlock size={15} /> : <Lock size={15} />}
              <span>{selectedTopic.is_locked ? 'Unlock Discussion' : 'Lock Discussion'}</span>
            </button>

            <button
              onClick={() => onDeleteTopic(selectedTopic.id)}
              className="canvas-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '7px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
              }}
              title="Delete this discussion topic"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Topic Card */}
      <div
        className="canvas-card"
        style={{
          padding: '28px',
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle, #E5E7EB)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {selectedTopic.is_locked && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                fontWeight: 700,
                backgroundColor: '#FEF3C7',
                color: '#B45309',
                padding: '3px 10px',
                borderRadius: '4px',
                border: '1px solid #FDE68A',
              }}
            >
              <Lock size={13} />
              <span>Locked</span>
            </span>
          )}

          {selectedTopic.is_pinned && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem',
                fontWeight: 700,
                backgroundColor: '#EFF6FF',
                color: '#0055A5',
                padding: '3px 10px',
                borderRadius: '4px',
                border: '1px solid #BFDBFE',
              }}
            >
              <Pin size={12} />
              <span>Pinned</span>
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1E293B', margin: '0 0 16px 0' }}>
          {selectedTopic.title}
        </h1>

        {/* Author metadata bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '18px',
            marginBottom: '18px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: selectedTopic.is_author_tutor ? '#0055A5' : '#64748B',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {selectedTopic.author_photo ? (
              <img
                src={selectedTopic.author_photo}
                alt={selectedTopic.author_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              selectedTopic.author_name.substring(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1E293B' }}>
                {selectedTopic.author_name}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '1px 7px',
                  borderRadius: '4px',
                  backgroundColor: '#F3F4F6',
                  color: '#000000',
                  border: '1px solid #E5E7EB',
                }}
              >
                {selectedTopic.is_author_tutor ? 'Instructor' : 'Student'}
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Clock size={12} />
              <span>{selectedTopic.date}</span>
            </span>
          </div>
        </div>

        {/* Main content body */}
        <div
          style={{
            fontSize: '0.96rem',
            color: '#334155',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}
        >
          {selectedTopic.content}
        </div>

        {/* Discussion Actions: Like, Reply, View Replies */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9',
            flexWrap: 'wrap',
          }}
        >
          {/* LIKE / UNLIKE BUTTON */}
          <button
            onClick={() => onToggleLikeTopic(selectedTopic.id)}
            className="canvas-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '7px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: selectedTopic.has_liked ? '#FEF2F2' : '#F8FAFC',
              color: selectedTopic.has_liked ? '#DC2626' : '#475569',
              border: `1px solid ${selectedTopic.has_liked ? '#FECACA' : '#E2E8F0'}`,
              transition: 'all 0.15s ease',
            }}
            title={selectedTopic.has_liked ? 'Unlike this discussion' : 'Like this discussion'}
          >
            <Heart
              size={16}
              fill={selectedTopic.has_liked ? '#DC2626' : 'none'}
              color={selectedTopic.has_liked ? '#DC2626' : '#64748B'}
            />
            <span>{selectedTopic.has_liked ? 'Liked' : 'Like'}</span>
            <span style={{ opacity: 0.85, fontWeight: 800 }}>({selectedTopic.likes_count || 0})</span>
          </button>

          {/* REPLY BUTTON */}
          {(!selectedTopic.is_locked || isTutor) && (
            <button
              onClick={() => {
                setReplyingToParent(null);
                document.getElementById('discussion-reply-composer')?.scrollIntoView({ behavior: 'smooth' });
                replyTextareaRef.current?.focus();
              }}
              className="canvas-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '7px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: '#EFF6FF',
                color: '#0055A5',
                border: '1px solid #BFDBFE',
              }}
            >
              <CornerDownRight size={15} />
              <span>Reply</span>
            </button>
          )}

          {/* VIEW REPLIES BADGE / SCROLL */}
          <button
            onClick={() => {
              document.getElementById('discussion-replies-list')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="canvas-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              padding: '7px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: '#F8FAFC',
              color: '#475569',
              border: '1px solid #E2E8F0',
            }}
          >
            <MessageSquare size={15} color="#0055A5" />
            <span>
              {selectedTopic.replies_count} {selectedTopic.replies_count === 1 ? 'Reply' : 'Replies'}
            </span>
          </button>
        </div>
      </div>

      {/* ── Threaded Replies Section ── */}
      <div id="discussion-replies-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            Replies ({selectedTopic.replies_count})
          </h3>
        </div>

        {/* Tutor Notice when topic is locked */}
        {selectedTopic.is_locked && isTutor && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              color: '#92400E',
              fontSize: '0.88rem',
            }}
          >
            <Lock size={18} />
            <span>
              <strong>Discussion Locked:</strong> This conversation is locked and invisible to students. Click "Unlock Discussion" above to make it visible to students again.
            </span>
          </div>
        )}

        {/* Empty Replies Message */}
        {(!selectedTopic.replies || selectedTopic.replies.length === 0) && (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px dashed #CBD5E1',
              color: '#64748B',
            }}
          >
            <MessageSquare size={32} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600 }}>
              No replies yet. Be the first to share your thoughts!
            </p>
          </div>
        )}

        {/* List of Replies */}
        {threadedReplies.topLevel &&
          threadedReplies.topLevel.map((reply) => (
            <DiscussionReplyItem
              key={reply.id}
              reply={reply}
              children={threadedReplies.childrenMap[reply.id] || []}
              isCollapsed={Boolean(collapsedReplyIds[reply.id])}
              isTutor={isTutor}
              userId={userId}
              isTopicLocked={selectedTopic.is_locked}
              onToggleLikeReply={onToggleLikeReply}
              onDeleteReply={onDeleteReply}
              onToggleRepliesVisibility={onToggleRepliesVisibility}
              onStartReplyTo={setReplyingToParent}
            />
          ))}

        {/* Active Reply Composer (Only if unlocked OR if tutor) */}
        {(!selectedTopic.is_locked || isTutor) && (
          <div
            id="discussion-reply-composer"
            style={{
              marginTop: '16px',
              padding: '20px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            }}
          >
            {/* Replying-to Indicator */}
            {replyingToParent && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  backgroundColor: '#EFF6FF',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  border: '1px solid #BFDBFE',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#0055A5', fontWeight: 600 }}>
                  Replying to {replyingToParent.author_name}
                </span>
                <button
                  onClick={() => setReplyingToParent(null)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#64748B',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {replyError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  color: '#DC2626',
                  fontSize: '0.82rem',
                  marginBottom: '10px',
                }}
              >
                <AlertCircle size={15} />
                <span>{replyError}</span>
              </div>
            )}

            <form onSubmit={onPostReply}>
              <textarea
                ref={replyTextareaRef}
                rows={3}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={
                  replyingToParent
                    ? `Write a reply to ${replyingToParent.author_name}...`
                    : 'Write your perspective or response to this discussion...'
                }
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                disabled={isSubmittingReply}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmittingReply || !replyContent.trim()}
                  className="canvas-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#0055A5',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '6px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: replyContent.trim() ? 'pointer' : 'not-allowed',
                    opacity: replyContent.trim() && !isSubmittingReply ? 1 : 0.6,
                  }}
                >
                  <Send size={15} />
                  <span>{isSubmittingReply ? 'Posting...' : 'Post Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionThreadView;
