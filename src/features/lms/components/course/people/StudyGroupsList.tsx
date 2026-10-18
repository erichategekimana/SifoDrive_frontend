import React from 'react';
import { Users, Loader2, Plus, MessageSquare } from 'lucide-react';
import type { CourseGroupDTO } from '../../../../../core/services/CourseGroupService';

interface StudyGroupsListProps {
  courseGroups: CourseGroupDTO[];
  isLoadingGroups: boolean;
  onSelectGroup: (groupId: string) => void;
  onOpenCreateModal: () => void;
}

export const StudyGroupsList: React.FC<StudyGroupsListProps> = ({
  courseGroups,
  isLoadingGroups,
  onSelectGroup,
  onOpenCreateModal,
}) => {
  if (isLoadingGroups) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
        <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} color="#0055A5" />
        <span style={{ fontSize: '0.84rem' }}>Loading study groups...</span>
      </div>
    );
  }

  if (courseGroups.length === 0) {
    return (
      <div className="canvas-card" style={{ padding: '40px', textAlign: 'center' }}>
        <Users size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', margin: '0 0 6px 0' }}>
          No Study Groups Yet
        </h4>
        <p style={{ fontSize: '0.84rem', color: '#64748B', maxWidth: '400px', margin: '0 auto 16px' }}>
          Form a study group to share mock exam tips, discuss highway code rules, and learn together.
        </p>
        <button
          onClick={onOpenCreateModal}
          className="canvas-btn canvas-btn-primary"
          style={{ fontSize: '0.82rem' }}
        >
          <Plus size={14} style={{ marginRight: '6px' }} />
          Create First Group
        </button>
      </div>
    );
  }

  return (
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
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: grp.creator_role === 'Tutor' ? '#DCFCE7' : '#EFF6FF',
                  color: grp.creator_role === 'Tutor' ? '#15803D' : '#0055A5',
                  border: `1px solid ${grp.creator_role === 'Tutor' ? '#BBF7D0' : '#BFDBFE'}`,
                  padding: '1px 7px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {grp.creator_role === 'Tutor' ? 'Instructor Group' : 'Student Group'}
              </span>

              {/* Invite Permission Badge */}
              {(grp.creator_role === 'Student' || grp.allow_students_to_add_members) && (
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 600,
                    backgroundColor: '#F0FDF4',
                    color: '#15803D',
                    border: '1px solid #BBF7D0',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {grp.creator_role === 'Student' ? 'Open Peer Invites' : 'Student Invites On'}
                </span>
              )}

              {grp.is_member && (
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    backgroundColor: '#E0F2FE',
                    color: '#0369A1',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  ✓ Joined
                </span>
              )}
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
                <span>
                  <strong>{grp.members_count}</strong> members
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{grp.category}</div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onSelectGroup(grp.id)}
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
  );
};

export default StudyGroupsList;
