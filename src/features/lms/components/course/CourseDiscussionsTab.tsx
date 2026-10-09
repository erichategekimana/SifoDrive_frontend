import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Lock,
  Unlock,
  Trash2,
  Plus,
  CornerDownRight,
  Pin,
  Search,
  ArrowLeft,
  Send,
  AlertCircle,
  Clock,
  Heart,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { Course } from '../../../../core/models/Course';
import {
  CourseDiscussionService,
  type DiscussionTopicDTO,
  type DiscussionReplyDTO,
} from '../../../../core/services/CourseDiscussionService';
import { Spinner } from '../../../../components/common/Spinner';

interface CourseDiscussionsTabProps {
  course: Course;
}

export const CourseDiscussionsTab: React.FC<CourseDiscussionsTabProps> = ({ course }) => {
  const { user } = useAuth();
  const isTutor = user?.isTutor() || user?.role === 'SYSTEM_ADMIN' || user?.role === 'TRAINING_ADMIN';

  const [topics, setTopics] = useState<DiscussionTopicDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopicDTO | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Modal / Creator states
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [isSubmittingTopic, setIsSubmittingTopic] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Reply submission states
  const [replyContent, setReplyContent] = useState<string>('');
  const [replyingToParent, setReplyingToParent] = useState<DiscussionReplyDTO | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);
  const [replyError, setReplyError] = useState<string>('');

  // Expand / collapse child replies (keyed by parent replyId: true = hidden, undefined/false = visible)
  const [collapsedReplyIds, setCollapsedReplyIds] = useState<Record<string, boolean>>({});

  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const discussionService = CourseDiscussionService.getInstance();

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await discussionService.getDiscussions(course.id);
      setTopics(data);
    } catch (err) {
      console.error('Failed to load discussion topics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [course.id]);

  const loadTopicDetail = async (topicId: string, autoFocusReply?: boolean) => {
    try {
      setLoadingDetail(true);
      setSelectedTopicId(topicId);
      const detail = await discussionService.getDiscussionDetail(topicId);
      setSelectedTopic(detail);
      setReplyingToParent(null);
      setReplyContent('');
      setReplyError('');
      if (autoFocusReply) {
        setTimeout(() => {
          replyTextareaRef.current?.focus();
        }, 150);
      }
    } catch (err) {
      console.error('Failed to load topic details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Create a new topic (both tutors & students can post)
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError('Please enter both a topic title and details.');
      return;
    }

    try {
      setIsSubmittingTopic(true);
      setFormError('');
      const created = await discussionService.createDiscussion(course.id, {
        title: newTitle.trim(),
        content: newContent.trim(),
      });
      setTopics((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      loadTopicDetail(created.id);
    } catch (err: any) {
      console.error('Failed to create topic:', err);
      setFormError(err?.response?.data?.message || 'Failed to create discussion topic.');
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  // Toggle like on topic
  const handleToggleLikeTopic = async (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await discussionService.toggleLikeDiscussion(topicId);
      setTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? { ...t, has_liked: res.has_liked, likes_count: res.likes_count }
            : t
        )
      );
      if (selectedTopic && selectedTopic.id === topicId) {
        setSelectedTopic({
          ...selectedTopic,
          has_liked: res.has_liked,
          likes_count: res.likes_count,
        });
      }
    } catch (err) {
      console.error('Failed to toggle like on topic:', err);
    }
  };

  // Toggle like on reply
  const handleToggleLikeReply = async (replyId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedTopic) return;
    try {
      const res = await discussionService.toggleLikeReply(selectedTopic.id, replyId);
      setSelectedTopic((prev) => {
        if (!prev) return null;
        const updatedReplies = (prev.replies || []).map((r) =>
          r.id === replyId
            ? { ...r, has_liked: res.has_liked, likes_count: res.likes_count }
            : r
        );
        return { ...prev, replies: updatedReplies };
      });
    } catch (err) {
      console.error('Failed to toggle like on reply:', err);
    }
  };

  // Toggle expand / collapse replies for a comment
  const toggleRepliesVisibility = (replyId: string) => {
    setCollapsedReplyIds((prev) => ({
      ...prev,
      [replyId]: !prev[replyId],
    }));
  };

  // Toggle lock status (tutors only)
  const handleToggleLock = async (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await discussionService.toggleLockDiscussion(topicId);
      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, is_locked: res.is_locked } : t))
      );
      if (selectedTopic && selectedTopic.id === topicId) {
        setSelectedTopic({ ...selectedTopic, is_locked: res.is_locked });
      }
    } catch (err) {
      console.error('Failed to toggle lock status:', err);
    }
  };

  // Delete topic (tutor or author)
  const handleDeleteTopic = async (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this discussion topic and all its replies?')) {
      return;
    }
    try {
      await discussionService.deleteDiscussion(topicId);
      setTopics((prev) => prev.filter((t) => t.id !== topicId));
      if (selectedTopicId === topicId) {
        setSelectedTopicId(null);
        setSelectedTopic(null);
      }
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
  };

  // Post a reply (or nested reply)
  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !replyContent.trim()) return;

    if (selectedTopic.is_locked && !isTutor) {
      setReplyError('This discussion topic is locked. New replies are not permitted.');
      return;
    }

    try {
      setIsSubmittingReply(true);
      setReplyError('');
      const newReply = await discussionService.createReply(selectedTopic.id, {
        content: replyContent.trim(),
        parent_id: replyingToParent ? replyingToParent.id : null,
      });

      setSelectedTopic((prev) => {
        if (!prev) return null;
        const currentReplies = prev.replies || [];
        return {
          ...prev,
          replies_count: prev.replies_count + 1,
          replies: [...currentReplies, newReply],
        };
      });

      // Update topic reply count in list view
      setTopics((prev) =>
        prev.map((t) =>
          t.id === selectedTopic.id ? { ...t, replies_count: t.replies_count + 1 } : t
        )
      );

      // If replied to a parent, make sure that parent's replies are expanded so the user sees the new reply immediately
      if (replyingToParent) {
        setCollapsedReplyIds((prev) => ({
          ...prev,
          [replyingToParent.id]: false,
        }));
      }

      setReplyContent('');
      setReplyingToParent(null);
    } catch (err: any) {
      console.error('Failed to post reply:', err);
      setReplyError(err?.response?.data?.message || 'Failed to submit reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Delete reply (tutors or authors)
  const handleDeleteReply = async (replyId: string) => {
    if (!selectedTopic) return;
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      await discussionService.deleteReply(selectedTopic.id, replyId);
      setSelectedTopic((prev) => {
        if (!prev) return null;
        const filteredReplies = (prev.replies || []).filter((r) => r.id !== replyId);
        return {
          ...prev,
          replies_count: Math.max(0, prev.replies_count - 1),
          replies: filteredReplies,
        };
      });
      setTopics((prev) =>
        prev.map((t) =>
          t.id === selectedTopic.id ? { ...t, replies_count: Math.max(0, t.replies_count - 1) } : t
        )
      );
    } catch (err) {
      console.error('Failed to delete reply:', err);
    }
  };

  const filteredTopics = useMemo(() => {
    // Locked topics are completely invisible to students
    const visible = topics.filter((t) => isTutor || !t.is_locked);
    if (!searchTerm.trim()) return visible;
    const term = searchTerm.toLowerCase();
    return visible.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.content.toLowerCase().includes(term) ||
        t.author_name.toLowerCase().includes(term)
    );
  }, [topics, searchTerm, isTutor]);

  // Thread replies: group into top-level and child replies
  const threadedReplies = useMemo<{
    topLevel: DiscussionReplyDTO[];
    childrenMap: { [parentId: string]: DiscussionReplyDTO[] };
  }>(() => {
    const topLevel: DiscussionReplyDTO[] = [];
    const childrenMap: { [parentId: string]: DiscussionReplyDTO[] } = {};
    if (!selectedTopic?.replies) return { topLevel, childrenMap };

    selectedTopic.replies.forEach((r) => {
      if (r.parent_id) {
        if (!childrenMap[r.parent_id]) childrenMap[r.parent_id] = [];
        childrenMap[r.parent_id].push(r);
      } else {
        topLevel.push(r);
      }
    });

    return { topLevel, childrenMap };
  }, [selectedTopic?.replies]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. DETAIL / THREAD VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (selectedTopicId) {
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
            onClick={() => {
              setSelectedTopicId(null);
              setSelectedTopic(null);
            }}
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
            onClick={() => {
              setSelectedTopicId(null);
              setSelectedTopic(null);
              fetchTopics();
            }}
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
                onClick={() => handleToggleLock(selectedTopic.id)}
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
                onClick={() => handleDeleteTopic(selectedTopic.id)}
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
              }}
            >
              {selectedTopic.author_name.substring(0, 2).toUpperCase()}
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

          {/* Discussion Actions: Like, Unlike, Reply, View Replies */}
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
              onClick={() => handleToggleLikeTopic(selectedTopic.id)}
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
              <span>{selectedTopic.replies_count} {selectedTopic.replies_count === 1 ? 'Reply' : 'Replies'}</span>
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

          {/* List of Replies with Nested Support, Likes, Reply, and View/Hide Replies */}
          {threadedReplies.topLevel &&
            threadedReplies.topLevel.map((reply) => {
              const children = threadedReplies.childrenMap[reply.id] || [];
              const hasChildren = children.length > 0;
              const isCollapsed = Boolean(collapsedReplyIds[reply.id]);
              const canDeleteThisReply = isTutor || reply.author_id === user?.id;

              return (
                <div key={reply.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                          onClick={() => handleDeleteReply(reply.id)}
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
                        onClick={() => handleToggleLikeReply(reply.id)}
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
                      {(!selectedTopic.is_locked || isTutor) && (
                        <button
                          onClick={() => {
                            setReplyingToParent(reply);
                            document.getElementById('discussion-reply-composer')?.scrollIntoView({ behavior: 'smooth' });
                            replyTextareaRef.current?.focus();
                          }}
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
                          onClick={() => toggleRepliesVisibility(reply.id)}
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
                      const canDeleteChild = isTutor || child.author_id === user?.id;
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
                                onClick={() => handleDeleteReply(child.id)}
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
                            {/* LIKE / UNLIKE ON NESTED REPLY */}
                            <button
                              onClick={() => handleToggleLikeReply(child.id)}
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

                            {/* REPLY TO THIS SUB-REPLY */}
                            {(!selectedTopic.is_locked || isTutor) && (
                              <button
                                onClick={() => {
                                  setReplyingToParent(reply);
                                  document.getElementById('discussion-reply-composer')?.scrollIntoView({ behavior: 'smooth' });
                                  replyTextareaRef.current?.focus();
                                }}
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
            })}

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

              <form onSubmit={handlePostReply}>
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
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. TOPICS LIST VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & New Topic Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            Course Discussion Forums
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '4px 0 0 0' }}>
            Exchange questions, highway scenarios, and study tips with classmates and instructors.
          </p>
        </div>

        {/* Both tutor and student can post a discussion topic */}
        <button
          onClick={() => {
            setFormError('');
            setShowCreateModal(true);
          }}
          className="canvas-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0055A5',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '6px',
            fontSize: '0.88rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,85,165,0.2)',
          }}
        >
          <Plus size={18} />
          <span>New Discussion Topic</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
        }}
      >
        <Search size={18} color="#94A3B8" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search topics by title, author, or content..."
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '0.88rem',
            width: '100%',
            color: '#1E293B',
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94A3B8',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Topics List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <Spinner message="Loading course discussions..." />
        </div>
      ) : filteredTopics.length === 0 ? (
        <div
          className="canvas-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px dashed #CBD5E1',
          }}
        >
          <MessageSquare size={40} style={{ margin: '0 auto 12px auto', opacity: 0.35, color: '#0055A5' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 6px 0' }}>
            {searchTerm ? 'No matching discussion topics found' : 'No discussion topics yet'}
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '440px', margin: '0 auto 18px auto' }}>
            {searchTerm
              ? 'Try adjusting your search criteria.'
              : 'Post a question or discussion point to start collaborating with other learners and tutors.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="canvas-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0055A5',
              color: '#FFFFFF',
              padding: '9px 16px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            <span>Start the First Discussion</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => loadTopicDetail(topic.id)}
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
                  }}
                >
                  {topic.author_name.substring(0, 2).toUpperCase()}
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
                        onClick={(e) => handleToggleLikeTopic(topic.id, e)}
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
                            loadTopicDetail(topic.id, true);
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
                          loadTopicDetail(topic.id);
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
                    onClick={(e) => handleToggleLock(topic.id, e)}
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
                    onClick={(e) => handleDeleteTopic(topic.id, e)}
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
          ))}
        </div>
      )}

      {/* ── CREATE TOPIC MODAL (Accessible by tutor and student) ── */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Start a New Discussion Topic
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.2rem',
                  color: '#94A3B8',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '6px',
                  color: '#DC2626',
                  fontSize: '0.84rem',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTopic} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Question on Roundabout Right-of-Way Rules"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Details & Question *
                </label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Explain your question or provide context for the discussion..."
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    lineHeight: 1.5,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="canvas-btn"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#64748B',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTopic || !newTitle.trim() || !newContent.trim()}
                  className="canvas-btn"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#0055A5',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: isSubmittingTopic ? 'not-allowed' : 'pointer',
                    opacity: isSubmittingTopic ? 0.7 : 1,
                  }}
                >
                  {isSubmittingTopic ? 'Publishing...' : 'Publish Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
