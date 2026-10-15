import React from 'react';
import { Plus, Search, MessageSquare } from 'lucide-react';
import type { DiscussionTopicDTO } from '../../../../../core/services/CourseDiscussionService';
import { Spinner } from '../../../../../components/common/Spinner';
import { DiscussionTopicCard } from './DiscussionTopicCard';

interface DiscussionTopicListProps {
  filteredTopics: DiscussionTopicDTO[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  isTutor: boolean;
  onOpenCreateModal: () => void;
  onSelectTopic: (topicId: string, autoFocusReply?: boolean) => void;
  onToggleLikeTopic: (topicId: string, e?: React.MouseEvent) => void;
  onToggleLock: (topicId: string, e?: React.MouseEvent) => void;
  onDeleteTopic: (topicId: string, e?: React.MouseEvent) => void;
}

export const DiscussionTopicList: React.FC<DiscussionTopicListProps> = ({
  filteredTopics,
  loading,
  searchTerm,
  setSearchTerm,
  isTutor,
  onOpenCreateModal,
  onSelectTopic,
  onToggleLikeTopic,
  onToggleLock,
  onDeleteTopic,
}) => {
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
          onClick={onOpenCreateModal}
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
            onClick={onOpenCreateModal}
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
            <DiscussionTopicCard
              key={topic.id}
              topic={topic}
              isTutor={isTutor}
              onSelectTopic={onSelectTopic}
              onToggleLikeTopic={onToggleLikeTopic}
              onToggleLock={onToggleLock}
              onDeleteTopic={onDeleteTopic}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscussionTopicList;
