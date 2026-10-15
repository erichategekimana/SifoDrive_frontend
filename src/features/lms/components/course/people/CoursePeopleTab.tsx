import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Users, UserCheck, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import type { Course } from '../../../../../core/models/Course';
import {
  CourseGroupService,
  type CourseRosterUserDTO,
  type CourseGroupDTO,
  type CourseGroupDetailDTO,
} from '../../../../../core/services/CourseGroupService';
import { GroupChatView } from './GroupChatView';
import { StudyGroupsList } from './StudyGroupsList';
import { PeopleRosterView } from './PeopleRosterView';
import { CreateGroupModal } from './CreateGroupModal';

export interface CoursePeopleTabProps {
  course: Course;
  activeGroupId?: string | null;
  onSelectGroup?: (groupId: string | null) => void;
  initialGroupId?: string | null;
  onGroupsLoaded?: (groups: CourseGroupDTO[]) => void;
}

export const CoursePeopleTab: React.FC<CoursePeopleTabProps> = ({
  course,
  activeGroupId: propActiveGroupId,
  onSelectGroup,
  initialGroupId,
  onGroupsLoaded,
}) => {
  const { user } = useAuth();
  const groupService = CourseGroupService.getInstance();

  const isCurrentUserTutor = Boolean(
    user?.isTutor() || user?.role === 'SYSTEM_ADMIN' || user?.role === 'TRAINING_ADMIN'
  );
  const currentUserName = user?.fullName || (isCurrentUserTutor ? 'Instructor' : 'Learner');

  // Subtabs & selection
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'groups'>('groups');
  const [internalActiveGroupId, setInternalActiveGroupId] = useState<string | null>(
    propActiveGroupId !== undefined ? propActiveGroupId : initialGroupId || null
  );

  const activeGroupId = propActiveGroupId !== undefined ? propActiveGroupId : internalActiveGroupId;

  const setActiveGroupId = (groupId: string | null) => {
    setInternalActiveGroupId(groupId);
    onSelectGroup?.(groupId);
  };

  useEffect(() => {
    if (propActiveGroupId !== undefined) {
      setInternalActiveGroupId(propActiveGroupId);
    }
  }, [propActiveGroupId]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'Instructor' | 'Student'>('ALL');

  // Real backend data states
  const [roster, setRoster] = useState<CourseRosterUserDTO[]>([]);
  const [courseGroups, setCourseGroups] = useState<CourseGroupDTO[]>([]);
  const [activeGroupDetail, setActiveGroupDetail] = useState<CourseGroupDetailDTO | null>(null);

  // Loading & Async states
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingGroupDetail, setIsLoadingGroupDetail] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);

  // Modal State for Group Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('General Road Rules & Highway Code');

  // Chat Composer State
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const fetchRoster = useCallback(async () => {
    setIsLoadingRoster(true);
    try {
      const data = await groupService.getRoster(course.id);
      setRoster(data);
    } catch (err) {
      console.error('Failed to load course roster:', err);
    } finally {
      setIsLoadingRoster(false);
    }
  }, [course.id, groupService]);

  const fetchGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    try {
      const data = await groupService.getGroups(course.id);
      setCourseGroups(data);
      onGroupsLoaded?.(data);
    } catch (err) {
      console.error('Failed to load course groups:', err);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [course.id, groupService, onGroupsLoaded]);

  const fetchGroupDetail = useCallback(
    async (groupId: string, silent = false) => {
      if (!silent) setIsLoadingGroupDetail(true);
      try {
        const detail = await groupService.getGroupDetail(groupId);
        setActiveGroupDetail(detail);
        setCourseGroups((prev) =>
          prev.map((g) =>
            g.id === groupId
              ? { ...g, members_count: detail.members_count, is_member: detail.is_member }
              : g
          )
        );
      } catch (err) {
        console.error('Failed to load group details:', err);
      } finally {
        if (!silent) setIsLoadingGroupDetail(false);
      }
    },
    [groupService]
  );

  useEffect(() => {
    fetchGroups();
    fetchRoster();
  }, [fetchGroups, fetchRoster]);

  useEffect(() => {
    if (activeGroupId) {
      fetchGroupDetail(activeGroupId);
    } else {
      setActiveGroupDetail(null);
    }
  }, [activeGroupId, fetchGroupDetail]);

  useEffect(() => {
    if (!activeGroupId) return;
    const interval = setInterval(() => {
      fetchGroupDetail(activeGroupId, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeGroupId, fetchGroupDetail]);

  useEffect(() => {
    if (activeGroupDetail?.messages?.length) {
      scrollToBottom('auto');
    }
  }, [activeGroupDetail?.messages?.length]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || isCreatingGroup) return;

    setIsCreatingGroup(true);
    try {
      const created = await groupService.createGroup(course.id, {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
        category: newGroupCategory,
      });

      setCourseGroups((prev) => {
        const next = [created, ...prev];
        onGroupsLoaded?.(next);
        return next;
      });
      setActiveGroupId(created.id);
      setActiveGroupDetail(created);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDesc('');
    } catch (err) {
      console.error('Failed to create group:', err);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = chatInput.trim();
    if (!content || !activeGroupId || isSendingMessage) return;

    setIsSendingMessage(true);
    setChatInput('');

    try {
      const newMsg = await groupService.sendMessage(activeGroupId, content);
      setActiveGroupDetail((prev) => {
        if (!prev) return null;
        const exists = prev.messages.some((m) => m.id === newMsg.id);
        const updatedMsgs = exists ? prev.messages : [...prev.messages, newMsg];
        return {
          ...prev,
          is_member: true,
          messages: updatedMsgs,
        };
      });
      setTimeout(() => scrollToBottom('smooth'), 50);
    } catch (err) {
      console.error('Failed to send group message:', err);
      setChatInput(content);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleToggleJoin = async () => {
    if (!activeGroupId || isJoiningGroup) return;

    setIsJoiningGroup(true);
    try {
      const result = await groupService.toggleJoinGroup(activeGroupId);
      setActiveGroupDetail((prev) =>
        prev
          ? {
              ...prev,
              is_member: result.is_member,
              members_count: result.members_count,
            }
          : null
      );
      setCourseGroups((prev) =>
        prev.map((g) =>
          g.id === activeGroupId
            ? { ...g, is_member: result.is_member, members_count: result.members_count }
            : g
        )
      );
    } catch (err) {
      console.error('Failed to toggle group membership:', err);
    } finally {
      setIsJoiningGroup(false);
    }
  };

  const filteredRoster = roster.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.student_id && u.student_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.category && u.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {activeGroupId ? (
        <GroupChatView
          activeGroupDetail={activeGroupDetail}
          isLoadingGroupDetail={isLoadingGroupDetail}
          isJoiningGroup={isJoiningGroup}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isSendingMessage={isSendingMessage}
          user={user}
          currentUserName={currentUserName}
          messagesEndRef={messagesEndRef}
          onToggleJoin={handleToggleJoin}
          onSendMessage={handleSendMessage}
          onCloseChat={() => setActiveGroupId(null)}
        />
      ) : (
        <div>
          {/* Sub Navigation Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #E5E7EB',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveSubTab('groups')}
                style={{
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeSubTab === 'groups' ? '3px solid #0055A5' : '3px solid transparent',
                  color: activeSubTab === 'groups' ? '#0055A5' : '#6B7280',
                  fontWeight: activeSubTab === 'groups' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Users size={16} />
                <span>Course Groups ({courseGroups.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('roster')}
                style={{
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeSubTab === 'roster' ? '3px solid #0055A5' : '3px solid transparent',
                  color: activeSubTab === 'roster' ? '#0055A5' : '#6B7280',
                  fontWeight: activeSubTab === 'roster' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <UserCheck size={16} />
                <span>Classmates & Instructors ({roster.length})</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => (activeSubTab === 'groups' ? fetchGroups() : fetchRoster())}
                className="canvas-btn"
                title="Refresh"
                style={{ padding: '7px 10px', fontSize: '0.8rem' }}
              >
                <RefreshCw size={14} className={isLoadingGroups || isLoadingRoster ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="canvas-btn canvas-btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                }}
              >
                <Plus size={15} />
                <span>{isCurrentUserTutor ? 'Create Student Group' : 'Create Study Group'}</span>
              </button>
            </div>
          </div>

          {activeSubTab === 'groups' && (
            <StudyGroupsList
              courseGroups={courseGroups}
              isLoadingGroups={isLoadingGroups}
              onSelectGroup={setActiveGroupId}
              onOpenCreateModal={() => setShowCreateModal(true)}
            />
          )}

          {activeSubTab === 'roster' && (
            <PeopleRosterView
              filteredRoster={filteredRoster}
              isLoadingRoster={isLoadingRoster}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
            />
          )}
        </div>
      )}

      <CreateGroupModal
        isOpen={showCreateModal}
        isCurrentUserTutor={isCurrentUserTutor}
        courseTitle={course.title}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        newGroupDesc={newGroupDesc}
        setNewGroupDesc={setNewGroupDesc}
        newGroupCategory={newGroupCategory}
        setNewGroupCategory={setNewGroupCategory}
        isCreatingGroup={isCreatingGroup}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
      />
    </div>
  );
};

export default CoursePeopleTab;
