import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Users,
  User,
  Pencil,
  Trash2,
  Calendar,
  Award,
  Layers,
  Lock,
  FileText,
  Car,
  BookOpen,
} from 'lucide-react';
import { Spinner } from '../../../components/common/Spinner';
import { Badge } from '../../../components/common/Badge';
import type { CohortActivityItem } from '../../../core/services/AdminService';

interface ActivitiesDirectoryTabProps {
  activities: CohortActivityItem[];
  courses: Array<{ id: string | number; title?: string; name?: string }>;
  cohorts: Array<{ id: string | number; name?: string; code?: string }>;
  isLoading: boolean;
  onCreateActivity: () => void;
  onEditActivity: (act: CohortActivityItem) => void;
  onReviewSubmissions: (act: CohortActivityItem) => void;
  onDeleteActivity: (act: CohortActivityItem) => void;
}

export const ActivitiesDirectoryTab: React.FC<ActivitiesDirectoryTabProps> = ({
  activities,
  courses,
  cohorts,
  isLoading,
  onCreateActivity,
  onEditActivity,
  onReviewSubmissions,
  onDeleteActivity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [cohortFilter, setCohortFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (courseFilter !== 'ALL' && String(act.course) !== String(courseFilter)) {
        return false;
      }
      if (cohortFilter !== 'ALL' && String(act.cohort) !== String(cohortFilter)) {
        return false;
      }
      if (typeFilter !== 'ALL' && act.activity_type !== typeFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const term = searchQuery.toLowerCase();
      return (
        act.title?.toLowerCase().includes(term) ||
        act.title_kinyarwanda?.toLowerCase().includes(term) ||
        act.created_by_name?.toLowerCase().includes(term) ||
        act.tutor_name?.toLowerCase().includes(term) ||
        act.description?.toLowerCase().includes(term) ||
        act.course_title?.toLowerCase().includes(term) ||
        act.cohort_name?.toLowerCase().includes(term) ||
        act.module_title?.toLowerCase().includes(term)
      );
    });
  }, [activities, courseFilter, cohortFilter, typeFilter, searchQuery]);

  const getActivityTypeInfo = (type: string) => {
    switch (type) {
      case 'PRACTICAL_DRILL':
        return { label: 'Practical Driving Drill', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: <Car size={13} /> };
      case 'ASSIGNMENT':
        return { label: 'Assignment', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', icon: <FileText size={13} /> };
      case 'CASE_STUDY':
        return { label: 'Case Study', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', icon: <BookOpen size={13} /> };
      case 'OBSERVATION':
        return { label: 'Observation Task', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', icon: <Award size={13} /> };
      default:
        return { label: type || 'Activity', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', icon: <Layers size={13} /> };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Filters Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search activities by title, course, or instructions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.84rem',
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.84rem',
            }}
          >
            <option value="ALL">All Activity Types</option>
            <option value="PRACTICAL_DRILL">Practical Driving Drills</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="CASE_STUDY">Case Studies</option>
            <option value="OBSERVATION">Observation Tasks</option>
          </select>

          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.84rem',
              maxWidth: '200px',
            }}
          >
            <option value="ALL">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.title || c.name || `Course #${c.id}`}
              </option>
            ))}
          </select>

          {/* Cohort Filter */}
          <select
            value={cohortFilter}
            onChange={(e) => setCohortFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.84rem',
              maxWidth: '200px',
            }}
          >
            <option value="ALL">All Cohorts</option>
            {cohorts.map((ch) => (
              <option key={ch.id} value={String(ch.id)}>
                {ch.name || ch.code || `Cohort #${ch.id}`}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onCreateActivity}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>Create Activity</span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner size={32} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredActivities.length === 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '48px 24px',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            {searchQuery || courseFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'No matching activities found'
              : 'No activities created yet'}
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: 0 }}>
            {searchQuery || courseFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'Try adjusting your search terms or filters.'
              : 'Create practical driving drills, case studies, or take-home assignments for your students.'}
          </p>
          <button
            onClick={onCreateActivity}
            className="btn btn-primary btn-sm"
            style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Create First Activity</span>
          </button>
        </div>
      )}

      {/* Activities Grid */}
      {!isLoading && filteredActivities.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredActivities.map((act) => {
            const typeInfo = getActivityTypeInfo(act.activity_type);

            return (
              <div
                key={act.id}
                className="glass-panel"
                style={{
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-md)',
                          background: typeInfo.bg,
                          color: typeInfo.color,
                        }}
                      >
                        {typeInfo.icon}
                        <span>{typeInfo.label}</span>
                      </span>

                      {act.is_published ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="neutral">Draft</Badge>
                      )}

                      {act.is_locked && (
                        <Badge variant="warning">
                          <Lock size={11} style={{ marginRight: '3px' }} /> Locked
                        </Badge>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      {act.title}
                    </h4>
                  </div>
                </div>

                {/* Creator info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(56, 189, 248, 0.12)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38bdf8',
                      flexShrink: 0,
                    }}
                  >
                    <User size={13} />
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>Created by:</span>
                  <strong style={{ color: '#ffffff', fontWeight: 600 }}>
                    {act.created_by_name || act.tutor_name || 'Staff / Tutor'}
                  </strong>
                </div>

                {/* Metadata Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {act.course_title && (
                    <span style={{ background: 'var(--bg-surface-elevated)', padding: '2px 8px', borderRadius: '4px' }}>
                      {act.course_title}
                    </span>
                  )}
                  {act.cohort_name && (
                    <span style={{ background: 'var(--bg-surface-elevated)', padding: '2px 8px', borderRadius: '4px' }}>
                      {act.cohort_name}
                    </span>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={13} color="#fbbf24" />
                    <strong style={{ color: '#ffffff' }}>{act.total_points ?? 100} pts</strong>
                  </span>
                  {act.due_date && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      <span>Due {new Date(act.due_date).toLocaleDateString()}</span>
                    </span>
                  )}
                </div>

                {/* Actions Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: 'auto',
                  }}
                >
                  <button
                    onClick={() => onReviewSubmissions(act)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                  >
                    <Users size={14} />
                    <span>Review Submissions</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => onEditActivity(act)}
                      className="btn btn-secondary btn-sm"
                      title="Edit Activity"
                      style={{ padding: '6px', minWidth: '32px' }}
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => onDeleteActivity(act)}
                      className="btn btn-secondary btn-sm"
                      title="Delete Activity"
                      style={{ padding: '6px', minWidth: '32px', color: '#f87171' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
