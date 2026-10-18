import React, { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, Check, Loader2, Users, ShieldCheck } from 'lucide-react';
import {
  CourseGroupService,
  type CourseGroupDetailDTO,
  type CourseGroupDTO,
  type CourseRosterUserDTO,
} from '../../../../../core/services/CourseGroupService';
import { useToast } from '../../../../../context/ToastContext';

interface AddGroupMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: CourseGroupDetailDTO | CourseGroupDTO | null;
  courseId: string;
  roster?: CourseRosterUserDTO[];
  currentMemberIds: string[];
  onMembersAdded: (updatedDetail: CourseGroupDetailDTO) => void;
}

export const AddGroupMemberModal: React.FC<AddGroupMemberModalProps> = ({
  isOpen,
  onClose,
  group,
  courseId,
  roster: initialRoster,
  currentMemberIds,
  onMembersAdded,
}) => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [candidates, setCandidates] = useState<CourseRosterUserDTO[]>(initialRoster || []);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch or update candidates when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedUserIds([]);
      setSearchTerm('');
      return;
    }

    if (initialRoster && initialRoster.length > 0) {
      setCandidates(initialRoster.filter((u) => u.role === 'Instructor' || u.role === 'Student'));
    } else if (courseId) {
      setIsLoadingRoster(true);
      CourseGroupService.getInstance()
        .getRoster(courseId)
        .then((data) =>
          setCandidates((data || []).filter((u) => u.role === 'Instructor' || u.role === 'Student'))
        )
        .catch((err) => {
          console.error('Failed to load roster candidates:', err);
          toastError('Failed to load course classmates.');
        })
        .finally(() => setIsLoadingRoster(false));
    }
  }, [isOpen, courseId, initialRoster, toastError]);

  const currentMemberSet = useMemo(() => new Set(currentMemberIds.map(String)), [currentMemberIds]);

  // Split into available to add vs already joined
  const { availableUsers, alreadyJoinedUsers } = useMemo(() => {
    const available: CourseRosterUserDTO[] = [];
    const joined: CourseRosterUserDTO[] = [];

    candidates.forEach((u) => {
      if (currentMemberSet.has(String(u.id))) {
        joined.push(u);
      } else {
        available.push(u);
      }
    });

    return { availableUsers: available, alreadyJoinedUsers: joined };
  }, [candidates, currentMemberSet]);

  // Filter available users by search query
  const filteredAvailable = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return availableUsers;
    return availableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.student_id && u.student_id.toLowerCase().includes(q)) ||
        (u.category && u.category.toLowerCase().includes(q))
    );
  }, [availableUsers, searchTerm]);

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredAvailable.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredAvailable.map((u) => String(u.id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || selectedUserIds.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updatedDetail = await CourseGroupService.getInstance().addMembers(group.id, selectedUserIds);
      toastSuccess(`Added ${selectedUserIds.length} member(s) to "${group.name}".`);
      onMembersAdded(updatedDetail);
      onClose();
    } catch (err: any) {
      console.error('Failed to add members:', err);
      toastError(err?.message || 'Failed to add members to the group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !group) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="canvas-card"
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#0055A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Add Members to Group
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Group: <strong>{group.name}</strong> • {currentMemberIds.length} existing member(s)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#94A3B8',
              lineHeight: 1,
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Search Bar & Stats */}
        <div style={{ padding: '16px 24px 12px 24px', borderBottom: '1px solid #F1F5F9' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search classmates by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.86rem',
                color: '#1E293B',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Clear
              </button>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '10px',
              fontSize: '0.78rem',
              color: '#64748B',
            }}
          >
            <span>
              Available candidates:{' '}
              <strong style={{ color: '#0F172A' }}>{filteredAvailable.length}</strong> (
              {alreadyJoinedUsers.length} already in group)
            </span>
            {filteredAvailable.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0055A5',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.78rem',
                }}
              >
                {selectedUserIds.length === filteredAvailable.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        {/* Candidates List Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minHeight: '220px',
            maxHeight: '380px',
          }}
        >
          {isLoadingRoster ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} color="#0055A5" />
              <span style={{ fontSize: '0.84rem' }}>Loading classmates roster...</span>
            </div>
          ) : filteredAvailable.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
              <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>
                {searchTerm ? 'No classmates match your search.' : 'All enrolled classmates are already in this group!'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#94A3B8' }}>
                {alreadyJoinedUsers.length > 0
                  ? `${alreadyJoinedUsers.length} classmates have joined this circle.`
                  : 'Enroll classmates in this course to invite them.'}
              </p>
            </div>
          ) : (
            filteredAvailable.map((u) => {
              const isSelected = selectedUserIds.includes(String(u.id));
              const isInstructor = u.role === 'Instructor';

              return (
                <div
                  key={u.id}
                  onClick={() => toggleSelectUser(String(u.id))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #0055A5' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Checkbox */}
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: isSelected ? '2px solid #0055A5' : '2px solid #CBD5E1',
                        backgroundColor: isSelected ? '#0055A5' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>

                    {/* Avatar */}
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: u.avatar_color || '#0055A5',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      {u.profile_photo ? (
                        <img
                          src={u.profile_photo}
                          alt={u.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        u.name.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1E293B' }}>
                          {u.name}
                        </span>
                        {isInstructor && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                            }}
                          >
                            <ShieldCheck size={10} />
                            <span>Tutor</span>
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '1px' }}>
                        {u.student_id ? `${u.student_id} • ` : ''}
                        {u.category || (isInstructor ? 'Instructor' : 'Course Participant')}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: isSelected ? '#0055A5' : '#64748B',
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            {selectedUserIds.length > 0 ? (
              <span style={{ color: '#0055A5', fontWeight: 700 }}>
                {selectedUserIds.length} candidate(s) selected
              </span>
            ) : (
              <span>Select classmates to invite</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="canvas-btn"
              style={{
                padding: '8px 14px',
                fontSize: '0.84rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedUserIds.length === 0 || isSubmitting}
              className="canvas-btn canvas-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                fontSize: '0.84rem',
                fontWeight: 700,
                backgroundColor: selectedUserIds.length === 0 ? '#94A3B8' : '#0055A5',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: selectedUserIds.length === 0 || isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
              <span>Add to Group {selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGroupMemberModal;
