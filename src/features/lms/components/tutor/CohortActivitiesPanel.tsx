import React, { useState } from 'react';
import { Plus, FileText, Trash2, Edit2, Users, CheckCircle } from 'lucide-react';
import { TutorLmsService, type CohortActivityItem } from '../../../../core/services/TutorLmsService';
import { Badge } from '../../../../components/common/Badge';
import { CreateActivityModal } from './CreateActivityModal';
import { ReviewSubmissionsModal } from './ReviewSubmissionsModal';
import { useToast } from '../../../../context/ToastContext';

interface CohortActivitiesPanelProps {
  cohortId: string;
  courseId: string;
  activities: CohortActivityItem[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export const CohortActivitiesPanel: React.FC<CohortActivitiesPanelProps> = ({
  cohortId,
  courseId,
  activities,
  isLoading,
  onRefresh,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [activityToEdit, setActivityToEdit] = useState<CohortActivityItem | null>(null);
  const [activityForSubmissions, setActivityForSubmissions] = useState<CohortActivityItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const handleDeleteActivity = async (activity: CohortActivityItem) => {
    if (!window.confirm(`Are you sure you want to delete activity "${activity.title}"?`)) {
      return;
    }
    setIsDeleting(activity.id);
    try {
      await TutorLmsService.getInstance().deleteCohortActivity(cohortId, activity.id);
      success(`Activity "${activity.title}" deleted.`);
      await onRefresh();
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete activity.');
    } finally {
      setIsDeleting(null);
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'PRACTICAL_DRILL':
        return 'Practical Driving Drill';
      case 'ASSIGNMENT':
        return 'Assignment';
      case 'CASE_STUDY':
        return 'Case Study';
      case 'OBSERVATION':
        return 'Observation';
      default:
        return type;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
            Cohort Activities & Practical Tasks ({activities.length})
          </h4>
          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Assign hands-on driving assignments, traffic case studies, and evaluate student submissions
          </p>
        </div>

        <button
          onClick={() => {
            setActivityToEdit(null);
            setIsCreateModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} />
          <span>Create Activity</span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading activities...</div>
      ) : activities.length === 0 ? (
        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            background: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <FileText size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>No activities created yet</h5>
          <p style={{ margin: '4px 0 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Create driving drills, practical checklist assignments, or case studies for learners in this cohort.
          </p>
          <button
            onClick={() => {
              setActivityToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="btn btn-primary btn-sm"
          >
            Create First Activity
          </button>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Activity Title</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Points</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Due Date</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Submissions</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act) => {
                return (
                  <tr key={act.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{act.title}</div>
                      {act.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {act.description}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant="neutral">
                        {getActivityTypeLabel(act.activity_type)}
                      </Badge>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: 700, color: '#38bdf8' }}>
                        {act.max_score} pts
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Pass: {act.pass_score}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {act.due_date ? (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {new Date(act.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No Due Date</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => setActivityForSubmissions(act)}
                        style={{
                          background: 'rgba(0, 85, 165, 0.12)',
                          border: '1px solid rgba(0, 85, 165, 0.25)',
                          borderRadius: 'var(--radius-full)',
                          padding: '4px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          color: '#38bdf8',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                        }}
                      >
                        <Users size={12} />
                        <span>{act.submission_count} Submissions ({act.graded_count} Graded)</span>
                      </button>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setActivityForSubmissions(act)}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem' }}
                        >
                          <CheckCircle size={13} color="#4ade80" />
                          <span>Grade</span>
                        </button>

                        <button
                          onClick={() => {
                            setActivityToEdit(act);
                            setIsCreateModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.76rem', padding: '6px' }}
                          title="Edit Activity"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => handleDeleteActivity(act)}
                          disabled={isDeleting === act.id}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.76rem', padding: '6px', color: '#f87171' }}
                          title="Delete Activity"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateActivityModal
        isOpen={isCreateModalOpen}
        cohortId={cohortId}
        courseId={courseId}
        activityToEdit={activityToEdit}
        onClose={() => {
          setIsCreateModalOpen(false);
          setActivityToEdit(null);
        }}
        onSuccess={onRefresh}
      />

      <ReviewSubmissionsModal
        isOpen={!!activityForSubmissions}
        cohortId={cohortId}
        activity={activityForSubmissions}
        onClose={() => setActivityForSubmissions(null)}
        onSuccess={onRefresh}
      />
    </div>
  );
};
