import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  X,
} from 'lucide-react';
import { AdminService } from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [roadSignsCount, setRoadSignsCount] = useState<number>(0);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTitleRw, setNewTitleRw] = useState<string>('');
  const [newCode, setNewCode] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const adminService = AdminService.getInstance();
  const { success, warning, error: toastError } = useToast();

  const loadLmsData = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, signsRes, questionsRes] = await Promise.allSettled([
        adminService.getCourses(),
        adminService.getRoadSigns(),
        adminService.getQuestions(),
      ]);

      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value);
      if (signsRes.status === 'fulfilled') setRoadSignsCount(signsRes.value.length);
      if (questionsRes.status === 'fulfilled') setQuestionsCount(questionsRes.value.length);
    } catch (err) {
      console.error('Failed to load LMS courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLmsData();
  }, []);

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await adminService.unpublishCourse(courseId);
        warning('Course unpublished and moved to draft mode.');
      } else {
        await adminService.publishCourse(courseId);
        success('Course published and live for enrolled students.');
      }
      loadLmsData();
    } catch (err: any) {
      toastError(err?.message || 'Could not update course status.');
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${title}"?`)) return;
    try {
      await adminService.deleteCourse(courseId);
      success(`Deleted course ${title}.`);
      loadLmsData();
    } catch (err: any) {
      toastError(err?.message || 'Could not delete course.');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) {
      warning('Title and Course Code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.createCourse({
        title: newTitle.trim(),
        title_rw: newTitleRw.trim() || undefined,
        code: newCode.trim().toUpperCase(),
        description: newDescription.trim() || undefined,
        is_published: false,
      });

      success(`Created course ${newTitle}.`);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewTitleRw('');
      setNewCode('');
      setNewDescription('');
      loadLmsData();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            LMS Curriculum Studio
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage official driving theory courses, road signs inventory, and quiz question banks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadLmsData}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Courses
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {courses.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '4px' }}>
            Curriculum modules
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Official Road Signs
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {roadSignsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Warning, Priority, Prohibitory
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Quiz Questions Bank
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {questionsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Rwanda Police standard
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Course Catalogue
          </h3>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Spinner message="Loading course catalogue from backend..." />
          </div>
        ) : courses.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No courses found in the backend. Click "Create Course" to add the first module.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', textAlign: 'left' }}>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Code</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Course Title</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Kinyarwanda Title</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Modules</th>
                  <th style={{ padding: '14px 16px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'monospace' }}>
                      {c.code}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {c.title}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {c.title_rw || '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={c.is_published ? 'success' : 'neutral'}>
                        {c.is_published ? 'PUBLISHED' : 'DRAFT'}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {c.modules_count !== undefined ? `${c.modules_count} Modules` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleTogglePublish(c.id, c.is_published)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          title={c.is_published ? 'Unpublish course' : 'Publish course'}
                        >
                          {c.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                          <span>{c.is_published ? 'Unpublish' : 'Publish'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id, c.title)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 8px',
                            color: 'var(--danger)',
                          }}
                          title="Delete course"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              borderRadius: 'var(--radius-2xl)',
              padding: '28px',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={22} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Create New Course
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Course Code (e.g. RW-TH-01) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="RW-TH-01"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rwandan Highway Code & Traffic Rules"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Title (Kinyarwanda)
                </label>
                <input
                  type="text"
                  placeholder="Amategeko y'Umuhanda n'Ibyapa mu Rwanda"
                  value={newTitleRw}
                  onChange={(e) => setNewTitleRw(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Comprehensive theory module for provisional driving test preparation..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
