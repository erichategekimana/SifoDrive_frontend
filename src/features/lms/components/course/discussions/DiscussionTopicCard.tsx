import React from 'react';
import { Lock, Pin, Heart, CornerDownRight, MessageSquare, Unlock, Trash2 } from 'lucide-react';
import type { DiscussionTopicDTO } from '../../../../../core/services/CourseDiscussionService';

interface DiscussionTopicCardProps {
  topic: DiscussionTopicDTO;
  isTutor: boolean;
  onSelectTopic: (topicId: string, autoFocusReply?: boolean) => void;
  onToggleLikeTopic: (topicId: string, e?: React.MouseEvent) => void;
  onToggleLock: (topicId: string, e?: React.MouseEvent) => void;
  onDeleteTopic: (topicId: string, e?: React.MouseEvent) => void;
}

export const DiscussionTopicCard: React.FC<DiscussionTopicCardProps> = ({
  topic,
  isTutor,
  onSelectTopic,
  onToggleLikeTopic,
  onToggleLock,
  onDeleteTopic,
}) => {
  return (
    <div
      onClick={() => onSelectTopic(topic.id)}
      className="canvas-card"
      style={{
        padding: '20px 24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        cursor: 'pointer',
        transition: 'all 0.18s ease-in-out',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#93C5FD';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,85,165,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
        {/* Topic Author Avatar */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: topic.is_author_tutor ? '#0055A5' : '#475569',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {topic.author_photo ? (
            <img
              src={topic.author_photo}
              alt={topic.author_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            topic.author_name.substring(0, 2).toUpperCase()
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {/* Status Badges & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {topic.is_locked && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#FEF3C7',
                  color: '#B45309',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: '1px solid #FDE68A',
                }}
              >
                <Lock size={11} />
                <span>Locked</span>
              </span>
            )}

            {topic.is_pinned && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#EFF6FF',
                  color: '#0055A5',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: '1px solid #BFDBFE',
                }}
              >
                <Pin size={11} />
                <span>Pinned</span>
              </span>
            )}

            <h3 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
              {topic.title}
            </h3>
          </div>

          {/* Summary / Preview */}
          <p
            style={{
              fontSize: '0.84rem',
              color: '#64748B',
              margin: 0,
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {topic.content}
          </p>

          {/* Author, Date & Interaction Buttons in Card Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94A3B8' }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>{topic.author_name}</span>
              <span>•</span>
              <span
                style={{
                  padding: '1px 5px',
                  borderRadius: '3px',
                  backgroundColor: '#F3F4F6',
                  color: '#000000',
                  border: '1px solid #E5E7EB',
                  fontWeight: 600,
                }}
              >
                {topic.is_author_tutor ? 'Instructor' : 'Student'}
              </span>
              <span>•</span>
              <span>{topic.date}</span>
            </div>

            {/* Inline Quick Action Buttons: Like, Reply, View Replies */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
              {/* LIKE / UNLIKE */}
              <button
                onClick={(e) => onToggleLikeTopic(topic.id, e)}
                style={{
                  border: 'none',
                  backgroundColor: topic.has_liked ? '#FEF2F2' : '#F8FAFC',
                  color: topic.has_liked ? '#DC2626' : '#64748B',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: topic.has_liked ? '#FECACA' : '#E2E8F0',
                }}
                title={topic.has_liked ? 'Unlike' : 'Like'}
              >
                <Heart
                  size={12}
                  fill={topic.has_liked ? '#DC2626' : 'none'}
                  color={topic.has_liked ? '#DC2626' : '#64748B'}
                />
                <span>{topic.has_liked ? 'Liked' : 'Like'}</span>
                {topic.likes_count > 0 && <span>({topic.likes_count})</span>}
              </button>

              {/* REPLY */}
              {(!topic.is_locked || isTutor) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTopic(topic.id, true);
                  }}
                  style={{
                    border: '1px solid #BFDBFE',
                    backgroundColor: '#EFF6FF',
                    color: '#0055A5',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  <CornerDownRight size={12} />
                  <span>Reply</span>
                </button>
              )}

              {/* VIEW REPLIES */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTopic(topic.id);
                }}
                style={{
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  color: '#334155',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <MessageSquare size={12} color="#0055A5" />
                <span>View replies ({topic.replies_count})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Tutor Action Buttons (Lock, Delete) */}
      {isTutor && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={(e) => onToggleLock(topic.id, e)}
            style={{
              border: 'none',
              backgroundColor: topic.is_locked ? '#F0FDF4' : '#FEF3C7',
              color: topic.is_locked ? '#15803D' : '#B45309',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
            title={topic.is_locked ? 'Unlock discussion' : 'Lock discussion'}
          >
            {topic.is_locked ? <Unlock size={13} /> : <Lock size={13} />}
            <span>{topic.is_locked ? 'Unlock' : 'Lock'}</span>
          </button>

          <button
            onClick={(e) => onDeleteTopic(topic.id, e)}
            style={{
              border: 'none',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
            title="Delete discussion"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscussionTopicCard;
