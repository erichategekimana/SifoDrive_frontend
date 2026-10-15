import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import type { Course } from '../../../../../core/models/Course';
import {
  CourseDiscussionService,
  type DiscussionTopicDTO,
  type DiscussionReplyDTO,
} from '../../../../../core/services/CourseDiscussionService';
import { DiscussionTopicList } from './DiscussionTopicList';
import { DiscussionThreadView } from './DiscussionThreadView';
import { CreateTopicModal } from './CreateTopicModal';

export interface CourseDiscussionsTabProps {
  course: Course;
}

export const CourseDiscussionsTab: React.FC<CourseDiscussionsTabProps> = ({ course }) => {
  const { user } = useAuth();
  const isTutor = Boolean(
    user?.isTutor() || user?.role === 'SYSTEM_ADMIN' || user?.role === 'TRAINING_ADMIN'
  );

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

  // Expand / collapse child replies
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

  const toggleRepliesVisibility = (replyId: string) => {
    setCollapsedReplyIds((prev) => ({
      ...prev,
      [replyId]: !prev[replyId],
    }));
  };

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

      setTopics((prev) =>
        prev.map((t) =>
          t.id === selectedTopic.id ? { ...t, replies_count: t.replies_count + 1 } : t
        )
      );

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

  return (
    <>
      {selectedTopicId ? (
        <DiscussionThreadView
          selectedTopic={selectedTopic}
          isTutor={isTutor}
          userId={user?.id}
          loadingDetail={loadingDetail}
          replyContent={replyContent}
          setReplyContent={setReplyContent}
          replyingToParent={replyingToParent}
          setReplyingToParent={setReplyingToParent}
          isSubmittingReply={isSubmittingReply}
          replyError={replyError}
          collapsedReplyIds={collapsedReplyIds}
          threadedReplies={threadedReplies}
          onBack={() => {
            setSelectedTopicId(null);
            setSelectedTopic(null);
            fetchTopics();
          }}
          onToggleLock={handleToggleLock}
          onDeleteTopic={handleDeleteTopic}
          onToggleLikeTopic={handleToggleLikeTopic}
          onToggleLikeReply={handleToggleLikeReply}
          onDeleteReply={handleDeleteReply}
          onToggleRepliesVisibility={toggleRepliesVisibility}
          onPostReply={handlePostReply}
          replyTextareaRef={replyTextareaRef}
        />
      ) : (
        <DiscussionTopicList
          filteredTopics={filteredTopics}
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isTutor={isTutor}
          onOpenCreateModal={() => {
            setFormError('');
            setShowCreateModal(true);
          }}
          onSelectTopic={loadTopicDetail}
          onToggleLikeTopic={handleToggleLikeTopic}
          onToggleLock={handleToggleLock}
          onDeleteTopic={handleDeleteTopic}
        />
      )}

      <CreateTopicModal
        isOpen={showCreateModal}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newContent={newContent}
        setNewContent={setNewContent}
        formError={formError}
        isSubmittingTopic={isSubmittingTopic}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTopic}
      />
    </>
  );
};

export default CourseDiscussionsTab;
