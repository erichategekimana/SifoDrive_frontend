import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Search,
  CheckSquare,
  Square,
  Settings,
  Edit3,
  HelpCircle,
  QrCode,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  Layers,
  Save,
  Printer,
} from 'lucide-react';
import {
  AdminService,
  type ExamSessionItem,
  type ExamSessionDetailItem,
  type CertificateItem,
  type CertificateTemplateItem,
  type AdminQuizQuestionItem,
  type PaginatedResult,
} from '../../core/services/AdminService';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';
import { CertificateLandscapeDocument } from '../../components/common/CertificateLandscapeDocument';

export const AdminExaminationsPage: React.FC = () => {
  const { showToast } = useToast();
  const adminService = AdminService.getInstance();

  // Primary navigation tabs
  const [activeTab, setActiveTab] = useState<'pipeline' | 'questions' | 'certificates' | 'settings'>('pipeline');

  // =========================================================================
  // TAB 1: PIPELINE & EXAM SESSIONS STATE
  // =========================================================================
  const [sessionsData, setSessionsData] = useState<PaginatedResult<ExamSessionItem>>({ count: 0, results: [] });
  const [isSessionsLoading, setIsSessionsLoading] = useState<boolean>(true);
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [cohortFilter, setCohortFilter] = useState<string>('ALL');
  const [trackFilter, setTrackFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cohortsList, setCohortsList] = useState<{ id: string; name: string }[]>([]);

  // Multi-select state for batch publishing
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [isPublishingBatch, setIsPublishingBatch] = useState<boolean>(false);

  // Inspection modal state
  const [inspectModalOpen, setInspectModalOpen] = useState<boolean>(false);
  const [inspectDetail, setInspectDetail] = useState<ExamSessionDetailItem | null>(null);
  const [isInspectLoading, setIsInspectLoading] = useState<boolean>(false);
  const [actionNotes, setActionNotes] = useState<string>('');
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);

  // =========================================================================
  // TAB 2: QUESTION BANK STATE
  // =========================================================================
  const [questionsData, setQuestionsData] = useState<PaginatedResult<AdminQuizQuestionItem>>({ count: 0, results: [] });
  const [isQuestionsLoading, setIsQuestionsLoading] = useState<boolean>(false);
  const [questionSearch, setQuestionSearch] = useState<string>('');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [questionPage, setQuestionPage] = useState<number>(1);

  // Question Edit Modal state
  const [editQuestionModalOpen, setEditQuestionModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuizQuestionItem | null>(null);
  const [isSavingQuestion, setIsSavingQuestion] = useState<boolean>(false);

  // =========================================================================
  // TAB 3: CERTIFICATES & TEMPLATES STATE
  // =========================================================================
  const [certSubTab, setCertSubTab] = useState<'registry' | 'templates'>('registry');
  const [certificatesData, setCertificatesData] = useState<PaginatedResult<CertificateItem>>({ count: 0, results: [] });
  const [isCertificatesLoading, setIsCertificatesLoading] = useState<boolean>(false);
  const [certSearch, setCertSearch] = useState<string>('');
  const [certTrackFilter, setCertTrackFilter] = useState<string>('ALL');

  // Preview / QR Certificate Modal
  const [viewCertModalOpen, setViewCertModalOpen] = useState<boolean>(false);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  // Template customizer state (STUDENT, GUEST, ENTERPRISE)
  const [templates, setTemplates] = useState<CertificateTemplateItem[]>([]);
  const [selectedTemplateType, setSelectedTemplateType] = useState<'STUDENT' | 'GUEST' | 'ENTERPRISE'>('STUDENT');
  const [activeTemplateForm, setActiveTemplateForm] = useState<Partial<CertificateTemplateItem>>({});
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);

  // =========================================================================
  // TAB 4: SETTINGS & POLICIES STATE
  // =========================================================================
  const [settingsForm, setSettingsForm] = useState({
    passingScore: 12,
    totalQuestions: 20,
    durationMinutes: 20,
    maxGuestTrials: 2,
    tabSwitchLimit: 3,
    anomalySnapshots: true,
  });

  // =========================================================================
  // DATA FETCHING
  // =========================================================================
  const fetchSessions = useCallback(async () => {
    try {
      setIsSessionsLoading(true);
      const params: any = {};
      if (stageFilter !== 'ALL') params.status = stageFilter;
      if (cohortFilter !== 'ALL') params.cohort = cohortFilter;
      if (trackFilter !== 'ALL') params.track = trackFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await adminService.getExamSessions(params);
      setSessionsData(res);
    } catch (err: any) {
      showToast('Failed to load examination sessions: ' + (err.message || ''), 'error');
    } finally {
      setIsSessionsLoading(false);
    }
  }, [stageFilter, cohortFilter, trackFilter, searchQuery]);

  const fetchCohorts = useCallback(async () => {
    try {
      const res: any = await adminService.getCohorts();
      if (Array.isArray(res)) {
        setCohortsList(res.map((c: any) => ({ id: c.id, name: c.name })));
      } else if (res && Array.isArray(res.results)) {
        setCohortsList(res.results.map((c: any) => ({ id: c.id, name: c.name })));
      }
    } catch (e) {
      // Non-blocking
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      setIsQuestionsLoading(true);
      const params: any = { page: questionPage };
      if (domainFilter !== 'ALL') params.domain = domainFilter;
      if (questionSearch.trim()) params.search = questionSearch.trim();

      const res = await adminService.getQuestionBank(params);
      setQuestionsData(res);
    } catch (err: any) {
      showToast('Failed to load question bank: ' + (err.message || ''), 'error');
    } finally {
      setIsQuestionsLoading(false);
    }
  }, [domainFilter, questionSearch, questionPage]);

  const fetchCertificates = useCallback(async () => {
    try {
      setIsCertificatesLoading(true);
      const params: any = {};
      if (certTrackFilter !== 'ALL') params.track_type = certTrackFilter;
      if (certSearch.trim()) params.search = certSearch.trim();

      const res = await adminService.getCertificates(params);
      setCertificatesData(res);
    } catch (err: any) {
      showToast('Failed to load certificates registry: ' + (err.message || ''), 'error');
    } finally {
      setIsCertificatesLoading(false);
    }
  }, [certTrackFilter, certSearch]);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await adminService.getCertificateTemplates();
      setTemplates(res);
      const current = res.find((t: CertificateTemplateItem) => t.template_type === selectedTemplateType);
      if (current) {
        setActiveTemplateForm(current);
      }
    } catch (err: any) {
      showToast('Failed to load certificate templates: ' + (err.message || ''), 'error');
    }
  }, [selectedTemplateType]);

  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);

  useEffect(() => {
    if (activeTab === 'pipeline') {
      fetchSessions();
    } else if (activeTab === 'questions') {
      fetchQuestions();
    } else if (activeTab === 'certificates') {
      if (certSubTab === 'registry') {
        fetchCertificates();
      } else {
        fetchTemplates();
      }
    }
  }, [activeTab, certSubTab, fetchSessions, fetchQuestions, fetchCertificates, fetchTemplates]);

  // Sync template form when selected type switches
  useEffect(() => {
    if (templates.length > 0) {
      const current = templates.find((t) => t.template_type === selectedTemplateType);
      if (current) {
        setActiveTemplateForm(current);
      }
    }
  }, [selectedTemplateType, templates]);

  // =========================================================================
  // ACTIONS: PIPELINE & EXAMS
  // =========================================================================
  const handleInspect = async (session: ExamSessionItem) => {
    try {
      setIsInspectLoading(true);
      setInspectModalOpen(true);
      setActionNotes('');
      const detail = await adminService.getExamSessionDetail(session.id);
      setInspectDetail(detail);
    } catch (err: any) {
      showToast('Failed to load exam details: ' + (err.message || ''), 'error');
      setInspectModalOpen(false);
    } finally {
      setIsInspectLoading(false);
    }
  };

  const handleStageAction = async (action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES') => {
    if (!inspectDetail) return;
    try {
      setIsExecutingAction(true);
      const res = await adminService.executeExamStageAction(inspectDetail.id, action, actionNotes);
      showToast(res.message || `Exam ${action.toLowerCase()} processed successfully!`, 'success');
      // Refresh inspection & list
      const updated = await adminService.getExamSessionDetail(inspectDetail.id);
      setInspectDetail(updated);
      fetchSessions();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        'Execution rejected. Strict governance rules prevent this transition.';
      showToast(errorMsg, 'error');
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleSinglePublish = async (sessionId: string) => {
    try {
      await adminService.publishExams({ publish_type: 'SINGLE', session_id: sessionId });
      showToast('Exam published successfully to the learner portal!', 'success');
      fetchSessions();
      if (inspectDetail && inspectDetail.id === sessionId) {
        const updated = await adminService.getExamSessionDetail(sessionId);
        setInspectDetail(updated);
      }
    } catch (err: any) {
      showToast('Publish failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleBatchPublish = async () => {
    if (selectedSessionIds.length === 0) return;
    try {
      setIsPublishingBatch(true);
      const res = await adminService.publishExams({
        publish_type: 'BATCH',
        session_ids: selectedSessionIds,
      });
      showToast(res.message || `Batch published ${res.published_count} exams!`, 'success');
      setSelectedSessionIds([]);
      fetchSessions();
    } catch (err: any) {
      showToast('Batch publish failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setIsPublishingBatch(false);
    }
  };

  const handleCohortPublish = async () => {
    if (cohortFilter === 'ALL') {
      showToast('Please select a specific Cohort first from the Cohort filter dropdown.', 'error');
      return;
    }
    const cohortObj = cohortsList.find((c) => c.id === cohortFilter);
    const confirmed = window.confirm(
      `Are you sure you want to publish ALL approved exams for "${cohortObj?.name || 'this cohort'}" at once?`
    );
    if (!confirmed) return;

    try {
      setIsPublishingBatch(true);
      const res = await adminService.publishExams({
        publish_type: 'COHORT',
        cohort_id: cohortFilter,
      });
      showToast(res.message || `Published ${res.published_count} cohort exams!`, 'success');
      setSelectedSessionIds([]);
      fetchSessions();
    } catch (err: any) {
      showToast('Cohort publish failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setIsPublishingBatch(false);
    }
  };

  const toggleSelectSession = (id: string) => {
    setSelectedSessionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const publishable = sessionsData.results.filter((s) => s.can_publish && !s.is_published);
    if (selectedSessionIds.length === publishable.length && publishable.length > 0) {
      setSelectedSessionIds([]);
    } else {
      setSelectedSessionIds(publishable.map((s) => s.id));
    }
  };

  // =========================================================================
  // ACTIONS: QUESTION BANK STUDIO
  // =========================================================================
  const handleOpenEditQuestion = (question: AdminQuizQuestionItem) => {
    setEditingQuestion({ ...question });
    setEditQuestionModalOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    try {
      setIsSavingQuestion(true);
      await adminService.updateQuizQuestion(editingQuestion.id, editingQuestion);
      showToast('Question updated successfully in question bank!', 'success');
      setEditQuestionModalOpen(false);
      fetchQuestions();
    } catch (err: any) {
      showToast('Failed to save question: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  // =========================================================================
  // ACTIONS: CERTIFICATE TEMPLATES
  // =========================================================================
  const handleSaveTemplate = async () => {
    if (!activeTemplateForm.id) return;
    try {
      setIsSavingTemplate(true);
      const updated = await adminService.updateCertificateTemplate(
        activeTemplateForm.id,
        activeTemplateForm
      );
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setActiveTemplateForm(updated);
      showToast(`${selectedTemplateType} certificate template saved successfully!`, 'success');
    } catch (err: any) {
      showToast('Failed to save template: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Render Helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="neutral">Submitted</Badge>;
      case 'BOARD_REVIEW':
        return <Badge variant="warning">Board Review</Badge>;
      case 'TRAINING_REVIEW':
        return <Badge variant="warning">Training Review</Badge>;
      case 'SYSTEM_REVIEW':
        return <Badge variant="info">Ready for Approval</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'PUBLISHED':
        return <Badge variant="neutral">Published</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      case 'FLAGGED':
        return <Badge variant="danger">Flagged</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #004d40 0%, #00897b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 77, 64, 0.4)',
              }}
            >
              <Award size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Examinations Hub & Certification Pipeline
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Multi-stage review governance, question bank studio, and tamper-proof certificate generation
              </p>
            </div>
          </div>
        </div>

        {/* Global Hub Navigation Tabs */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            padding: '4px',
            borderRadius: '12px',
            gap: '4px',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <button
            onClick={() => setActiveTab('pipeline')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'pipeline' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'pipeline' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Layers size={16} /> Review Pipeline
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'questions' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'questions' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <HelpCircle size={16} /> Question Bank Studio
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'certificates' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'certificates' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Award size={16} /> Certificates & Templates
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'settings' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'settings' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Settings size={16} /> Exam Settings & Policies
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: REVIEW PIPELINE & APPROVALS                                  */}
      {/* =================================================================== */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stage Progress Funnel Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              { key: 'BOARD_REVIEW', label: 'Stage 1: Board Review', sub: 'Pending board review' },
              { key: 'TRAINING_REVIEW', label: 'Stage 2: Training Admin', sub: 'Pending training review' },
              { key: 'SYSTEM_REVIEW', label: 'Stage 3: System Admin', sub: 'Awaiting final approval' },
              {
                key: 'APPROVED',
                label: 'Approved',
                sub: 'Ready to publish',
                filterFn: (s: any) => s.status === 'APPROVED' && !s.is_published,
              },
              {
                key: 'PUBLISHED',
                label: 'Published',
                sub: 'Published to candidate',
                filterFn: (s: any) => s.is_published,
              },
            ].map((stage) => {
              const isActive = stageFilter === stage.key;
              const count = stage.filterFn
                ? sessionsData.results.filter(stage.filterFn).length
                : sessionsData.results.filter((s) => s.status === stage.key).length;
              return (
                <div
                  key={stage.key}
                  className="glass-panel"
                  onClick={() => setStageFilter(isActive ? 'ALL' : stage.key)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: isActive ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {stage.label}
                  </div>
                  <div
                    style={{
                      fontSize: '1.45rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginTop: '4px',
                    }}
                  >
                    {count}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {stage.sub}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filter Bar & Batch Actions */}
          <div
            className="glass-panel"
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
              {/* Search input */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  minWidth: '220px',
                }}
              >
                <Search size={15} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Search student or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>

              {/* Cohort Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cohort:</span>
                <select
                  value={cohortFilter}
                  onChange={(e) => setCohortFilter(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="ALL">All Cohorts</option>
                  {cohortsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stage Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Stage:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="ALL">All Stages</option>
                  <option value="BOARD_REVIEW">Stage 1: Board Review</option>
                  <option value="TRAINING_REVIEW">Stage 2: Training Admin</option>
                  <option value="SYSTEM_REVIEW">Stage 3: System Admin Turn</option>
                  <option value="APPROVED">Approved (Ready to Publish)</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="FLAGGED">Flagged</option>
                </select>
              </div>

              {/* Track filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Track:</span>
                <select
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                >
                  <option value="ALL">All Tracks</option>
                  <option value="B2C">B2C (Student)</option>
                  <option value="B2B">B2B (Enterprise)</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectedSessionIds.length > 0 && (
                <button
                  onClick={handleBatchPublish}
                  disabled={isPublishingBatch}
                  style={{
                    background: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Publish Selected ({selectedSessionIds.length})
                </button>
              )}

              <button
                onClick={handleCohortPublish}
                disabled={cohortFilter === 'ALL' || isPublishingBatch}
                style={{
                  background: cohortFilter !== 'ALL' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                  color: cohortFilter !== 'ALL' ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: cohortFilter !== 'ALL' ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s',
                }}
                title={
                  cohortFilter === 'ALL'
                    ? 'Select a specific cohort to enable cohort publishing'
                    : 'Publish all approved exams in this cohort'
                }
              >
                Publish Whole Cohort
              </button>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
            {isSessionsLoading ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Spinner size={36} />
                <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Loading examination sessions and review pipeline...
                </p>
              </div>
            ) : sessionsData.results.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Award size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ fontSize: '1rem', fontWeight: 600 }}>No examination sessions found</p>
                <p style={{ fontSize: '0.85rem' }}>Try adjusting your search query, cohort, or stage filter.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '14px 16px', width: '40px' }}>
                        <button
                          onClick={toggleSelectAll}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {selectedSessionIds.length > 0 ? (
                            <CheckSquare size={18} color="var(--primary)" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                        Candidate & Cohort
                      </th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                        Score & Result
                      </th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                        Review Stage & Real-time Progress
                      </th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                        Certificate
                      </th>
                      <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontWeight: 700, textAlign: 'right' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionsData.results.map((session) => {
                      const isSelected = selectedSessionIds.includes(session.id);
                      return (
                        <tr
                          key={session.id}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            background: isSelected ? 'rgba(0, 77, 64, 0.08)' : 'transparent',
                            transition: 'background 0.15s',
                          }}
                        >
                          {/* Checkbox */}
                          <td style={{ padding: '14px 16px' }}>
                            <button
                              onClick={() => toggleSelectSession(session.id)}
                              disabled={!session.can_publish || session.is_published}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: session.can_publish && !session.is_published ? 'var(--text-muted)' : 'rgba(255,255,255,0.1)',
                                cursor: session.can_publish && !session.is_published ? 'pointer' : 'not-allowed',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {isSelected ? (
                                <CheckSquare size={18} color="var(--primary)" />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>
                          </td>

                          {/* Candidate & Cohort */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                              {session.student_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {session.student_phone} &bull; {session.cohort_name || 'Individual'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {session.track_type} {session.enterprise_name ? `(${session.enterprise_name})` : ''}
                            </div>
                          </td>

                          {/* Score */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {session.score ?? '—'} / {session.total_questions}
                              </span>
                              {session.passed !== null && (
                                <Badge variant={session.passed ? 'success' : 'danger'}>
                                  {session.passed ? 'Passed' : 'Failed'}
                                </Badge>
                              )}
                            </div>
                          </td>

                          {/* Review Stage */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div>{getStatusBadge(session.status)}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {session.current_stage_label}
                              </div>
                            </div>
                          </td>

                          {/* Certificate */}
                          <td style={{ padding: '12px 16px' }}>
                            {session.certificate_number ? (
                              <span
                                style={{
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  fontFamily: 'monospace',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {session.certificate_number}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Pending approval
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {/* Inspect Button */}
                              <button
                                onClick={() => handleInspect(session)}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-subtle)',
                                  background: 'rgba(255,255,255,0.04)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.78rem',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                }}
                              >
                                Inspect
                              </button>

                              {/* Publish Button */}
                              {session.is_published ? (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Published</span>
                              ) : session.can_publish ? (
                                <button
                                  onClick={() => handleSinglePublish(session.id)}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: 'var(--primary)',
                                    color: '#ffffff',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Publish
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  In Review
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: QUESTION BANK STUDIO                                         */}
      {/* =================================================================== */}
      {activeTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Question Bank Header & Filter */}
          <div
            className="glass-panel"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Rwanda Highway Code Question Bank (400+ Active Questions)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Correct writing mistakes, update answer options, change road sign diagrams, and modify explanations in English & Kinyarwanda
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Search Questions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  minWidth: '260px',
                }}
              >
                <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Search questions in EN or RW..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                    width: '100%',
                  }}
                />
              </div>

              {/* Domain Filter */}
              <select
                value={domainFilter}
                onChange={(e) => {
                  setDomainFilter(e.target.value);
                  setQuestionPage(1);
                }}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Domains</option>
                <option value="ROAD_SIGNS">Road Signs & Markings</option>
                <option value="PRIORITY">Priority & Right of Way</option>
                <option value="SPEED">Speed Limits & Distance</option>
                <option value="LIGHTS">Vehicle Lights & Signals</option>
                <option value="OVERTAKING">Overtaking & Lane Rules</option>
                <option value="ACCIDENTS">Accidents & First Aid</option>
              </select>
            </div>
          </div>

          {/* Question Cards Grid */}
          {isQuestionsLoading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Spinner size={36} />
              <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading question bank...</p>
            </div>
          ) : questionsData.results.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <HelpCircle size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>No questions matched your search criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
              {questionsData.results.map((q) => (
                <div
                  key={q.id}
                  className="glass-panel"
                  style={{
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: '4px solid var(--primary)',
                  }}
                >
                  <div>
                    {/* Header line */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            background: 'rgba(0, 77, 64, 0.4)',
                            color: 'var(--primary-light)',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                          }}
                        >
                          Q#{q.question_number}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {q.domain} &bull; {q.difficulty}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Edit3 size={13} /> Edit Question
                      </button>
                    </div>

                    {/* Question text in English */}
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      {q.question_text}
                    </div>

                    {/* Question text in Kinyarwanda */}
                    {q.question_text_kinyarwanda && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                        RW: {q.question_text_kinyarwanda}
                      </div>
                    )}

                    {/* Diagram preview if present */}
                    {q.image && (
                      <div style={{ margin: '10px 0', textAlign: 'center' }}>
                        <img
                          src={q.image}
                          alt="Question Diagram"
                          style={{ maxHeight: '100px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}
                        />
                      </div>
                    )}

                    {/* Options A, B, C, D */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                      {[
                        { key: 'A', text: q.option_a },
                        { key: 'B', text: q.option_b },
                        { key: 'C', text: q.option_c },
                        { key: 'D', text: q.option_d },
                      ].map((opt) => {
                        const isCorrect = q.correct_option === opt.key;
                        return (
                          <div
                            key={opt.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(0,0,0,0.15)',
                              border: isCorrect ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                              fontSize: '0.82rem',
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 800,
                                color: isCorrect ? '#10b981' : 'var(--text-muted)',
                                width: '18px',
                              }}
                            >
                              {opt.key}.
                            </span>
                            <span style={{ color: isCorrect ? '#ffffff' : 'var(--text-secondary)', flex: 1 }}>
                              {opt.text}
                            </span>
                            {isCorrect && (
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981' }}>
                                CORRECT
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation footer */}
                  {q.explanation && (
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={() => setQuestionPage((p) => Math.max(1, p - 1))}
              disabled={questionPage === 1}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                cursor: questionPage === 1 ? 'not-allowed' : 'pointer',
                opacity: questionPage === 1 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {questionPage}</span>
            <button
              onClick={() => setQuestionPage((p) => p + 1)}
              disabled={questionsData.results.length < 20}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-primary)',
                cursor: questionsData.results.length < 20 ? 'not-allowed' : 'pointer',
                opacity: questionsData.results.length < 20 ? 0.4 : 1,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: CERTIFICATES & TEMPLATES STUDIO                              */}
      {/* =================================================================== */}
      {activeTab === 'certificates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Sub-tab navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCertSubTab('registry')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: certSubTab === 'registry' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: certSubTab === 'registry' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Issued Certificates Registry ({certificatesData.count})
            </button>
            <button
              onClick={() => setCertSubTab('templates')}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: certSubTab === 'templates' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: certSubTab === 'templates' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Certificate Template Studio (Student, Guest, Enterprise)
            </button>
          </div>

          {/* SUB-TAB 1: REGISTRY */}
          {certSubTab === 'registry' && (
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Filter bar */}
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      minWidth: '240px',
                    }}
                  >
                    <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                    <input
                      type="text"
                      placeholder="Search certificate # or name..."
                      value={certSearch}
                      onChange={(e) => setCertSearch(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        width: '100%',
                      }}
                    />
                  </div>

                  <select
                    value={certTrackFilter}
                    onChange={(e) => setCertTrackFilter(e.target.value)}
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  >
                    <option value="ALL">All Tracks</option>
                    <option value="STUDENT">Enrolled Student</option>
                    <option value="GUEST">Guest Trial</option>
                    <option value="ENTERPRISE">Enterprise Partner</option>
                  </select>
                </div>
              </div>

              {/* Certificates List Table */}
              {isCertificatesLoading ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Spinner size={36} />
                  <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading certificates...</p>
                </div>
              ) : certificatesData.results.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Award size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>No certificates issued yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Serial Number</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Recipient</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Track & School</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Score</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>Issue Date</th>
                        <th style={{ padding: '14px 16px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificatesData.results.map((cert) => (
                        <tr key={cert.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-light)' }}>
                              {cert.certificate_number}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cert.student_name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: {cert.student_code}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <Badge variant="neutral">{cert.track_type}</Badge>
                            {cert.enterprise_name && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '3px' }}>
                                {cert.enterprise_name}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontWeight: 800, color: '#10b981' }}>
                              {cert.score} / {cert.total_questions}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {new Date(cert.issue_date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  setSelectedCert(cert);
                                  setViewCertModalOpen(true);
                                }}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-subtle)',
                                  background: 'rgba(255,255,255,0.06)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                }}
                              >
                                <QrCode size={13} /> View & QR
                              </button>
                              <a
                                href={`/verify/certificate/${cert.verification_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-subtle)',
                                  background: 'transparent',
                                  color: 'var(--primary-light)',
                                  fontSize: '0.78rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  textDecoration: 'none',
                                }}
                              >
                                <ExternalLink size={13} /> Verify
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 2: TEMPLATE CUSTOMIZER */}
          {certSubTab === 'templates' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 440px) 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Left Column: Template Editor Form */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                {/* Switch Template Type */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Accreditation Template Category
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
                    {(['STUDENT', 'GUEST', 'ENTERPRISE'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedTemplateType(type)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: '8px',
                          border: selectedTemplateType === type ? '2px solid #1E90FF' : '1px solid var(--border-subtle)',
                          background: selectedTemplateType === type ? 'rgba(30, 144, 255, 0.2)' : 'rgba(0,0,0,0.2)',
                          color: selectedTemplateType === type ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {type === 'STUDENT' ? 'Student' : type === 'GUEST' ? 'Guest' : 'Enterprise B2B'}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                    {selectedTemplateType === 'STUDENT' &&
                      'Enrolled Student Template: Displays Start Date, Completion Date, Cohort Name, and Theory Accreditation.'}
                    {selectedTemplateType === 'GUEST' &&
                      'Guest Trial Template: Displays Completion Date only (omits start date & cohort) for diagnostic trials.'}
                    {selectedTemplateType === 'ENTERPRISE' &&
                      'Enterprise Partner Template: Displays Partner Driving School Name prominently, physical proctoring seal, and dual dates.'}
                  </div>
                </div>

                {/* Form Fields: ALL Editable Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Authority Header / Subtitle */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Authority Header / Subtitle
                    </label>
                    <input
                      type="text"
                      value={activeTemplateForm.header_subtitle || ''}
                      placeholder="e.g. Republic of Rwanda • Sifo Drive Theory Accreditation"
                      onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, header_subtitle: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                      }}
                    />
                  </div>

                  {/* Certificate Title */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Certificate Title
                    </label>
                    <input
                      type="text"
                      value={activeTemplateForm.title || ''}
                      placeholder="e.g. Certificate of Theory Competence"
                      onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, title: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                      }}
                    />
                  </div>

                  {/* Conferral Lead-in Text */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Conferral Lead-in Text
                    </label>
                    <input
                      type="text"
                      value={activeTemplateForm.conferral_text || ''}
                      placeholder="e.g. This official credential is proudly awarded to"
                      onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, conferral_text: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                      }}
                    />
                  </div>

                  {/* Course Name */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Course / Curriculum Title
                    </label>
                    <input
                      type="text"
                      value={activeTemplateForm.course_name || ''}
                      placeholder="e.g. Rwanda Driving Theory — Provisional License Preparation"
                      onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, course_name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                      }}
                    />
                  </div>

                  {/* Declaration Paragraph */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Declaration Statement (Placeholders: {'{student_name}'}, {'{cohort_name}'}, {'{start_date}'}, {'{completion_date}'}, {'{score}'}, {'{total_questions}'})
                    </label>
                    <textarea
                      rows={4}
                      value={activeTemplateForm.declaration_text || ''}
                      onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, declaration_text: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                        lineHeight: '1.5',
                      }}
                    />
                  </div>

                  {/* Confirmation & Legal Notes */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Confirmation, Regulatory & Legal Notes
                    </label>
                    <textarea
                      rows={3}
                      value={activeTemplateForm.confirmation_notes || ''}
                      onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, confirmation_notes: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        marginTop: '4px',
                        lineHeight: '1.4',
                      }}
                    />
                  </div>

                  {/* Dual Signatures Setup */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                    {/* Training Admin Signature */}
                    <div
                      style={{
                        padding: '12px',
                        background: 'rgba(30, 144, 255, 0.08)',
                        border: '1px solid rgba(30, 144, 255, 0.25)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E90FF', marginBottom: '8px' }}>
                        Training Admin Endorsement
                      </div>
                      <input
                        type="text"
                        placeholder="Signer Full Name"
                        value={activeTemplateForm.training_admin_name || ''}
                        onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, training_admin_name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          marginBottom: '6px',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Signer Title"
                        value={activeTemplateForm.training_admin_title || ''}
                        onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, training_admin_title: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          marginBottom: '6px',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Digital Signature (SVG / Data URL)"
                        value={activeTemplateForm.training_admin_signature || ''}
                        onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, training_admin_signature: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>

                    {/* Sifo Director Signature */}
                    <div
                      style={{
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#EF4444', marginBottom: '8px' }}>
                        Sifo Director Endorsement
                      </div>
                      <input
                        type="text"
                        placeholder="Signer Full Name"
                        value={activeTemplateForm.director_name || ''}
                        onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, director_name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          marginBottom: '6px',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Signer Title"
                        value={activeTemplateForm.director_title || ''}
                        onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, director_title: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          marginBottom: '6px',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Digital Signature (SVG / Data URL)"
                        value={activeTemplateForm.director_signature || ''}
                        onChange={(e) => setActiveTemplateForm({ ...activeTemplateForm, director_signature: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid var(--border-subtle)',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveTemplate}
                    disabled={isSavingTemplate}
                    style={{
                      marginTop: '8px',
                      background: 'linear-gradient(90deg, #1E90FF 0%, #0F5BB5 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '11px 18px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(30, 144, 255, 0.3)',
                    }}
                  >
                    <Save size={16} /> {isSavingTemplate ? 'Saving Template...' : 'Save & Publish Template'}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Landscape Preview */}
              <div style={{ overflowX: 'auto', minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    padding: '0 4px',
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f9fafb' }}>
                    Live Landscape Preview ({selectedTemplateType})
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.74rem',
                      color: '#9ca3af',
                    }}
                  >
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#1E90FF' }} />
                    Dodger Blue
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', marginLeft: '6px' }} />
                    Light Red
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#FFFFFF', marginLeft: '6px' }} />
                    White
                  </div>
                </div>

                <CertificateLandscapeDocument
                  headerSubtitle={activeTemplateForm.header_subtitle}
                  title={activeTemplateForm.title}
                  conferralText={activeTemplateForm.conferral_text}
                  courseName={activeTemplateForm.course_name}
                  declarationText={activeTemplateForm.declaration_text}
                  confirmationNotes={activeTemplateForm.confirmation_notes}
                  trainingAdminName={activeTemplateForm.training_admin_name}
                  trainingAdminTitle={activeTemplateForm.training_admin_title}
                  trainingAdminSignature={activeTemplateForm.training_admin_signature}
                  directorName={activeTemplateForm.director_name}
                  directorTitle={activeTemplateForm.director_title}
                  directorSignature={activeTemplateForm.director_signature}
                  certificateNumber="SIFO-CERT-2026-RW-DEMO"
                  studentName="Kagame Alexis"
                  studentCode="+250 788 123 456"
                  trackType={selectedTemplateType}
                  enterpriseName={selectedTemplateType === 'ENTERPRISE' ? 'Kigali Premier Driving Academy' : undefined}
                  cohortName="Cohort 1 — Kigali Class"
                  startDate={selectedTemplateType === 'GUEST' ? null : '2026-07-15'}
                  completedDate="2026-09-13"
                  score={18}
                  totalQuestions={20}
                  isPreview={true}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: EXAM SETTINGS & POLICIES                                    */}
      {/* =================================================================== */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0' }}>
            National Police Theory Examination Policies
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Configure passing criteria, proctoring security thresholds, and guest trial access limits
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Passing Score (Questions Required)</label>
                <input
                  type="number"
                  value={settingsForm.passingScore}
                  onChange={(e) => setSettingsForm({ ...settingsForm, passingScore: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    marginTop: '6px',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rwanda National standard: 12 / 20 (60%)</span>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Total Questions per Exam</label>
                <input
                  type="number"
                  value={settingsForm.totalQuestions}
                  disabled
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid var(--border-subtle)',
                    color: '#9ca3af',
                    marginTop: '6px',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fixed standard by Rwanda National Police</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Exam Duration (Minutes)</label>
                <input
                  type="number"
                  value={settingsForm.durationMinutes}
                  onChange={(e) => setSettingsForm({ ...settingsForm, durationMinutes: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    marginTop: '6px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Guest Free Trial Sessions Limit</label>
                <input
                  type="number"
                  value={settingsForm.maxGuestTrials}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maxGuestTrials: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    marginTop: '6px',
                  }}
                />
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '8px', color: 'var(--primary-light)' }}>
                Anti-Cheat & Proctoring Engine Settings
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.82rem' }}>Tab switch violation auto-flag threshold</span>
                <input
                  type="number"
                  value={settingsForm.tabSwitchLimit}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tabSwitchLimit: Number(e.target.value) })}
                  style={{
                    width: '80px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    textAlign: 'center',
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem' }}>Capture Anomaly Webcam Snapshots (B2C Remote)</span>
                <input
                  type="checkbox"
                  checked={settingsForm.anomalySnapshots}
                  onChange={(e) => setSettingsForm({ ...settingsForm, anomalySnapshots: e.target.checked })}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
              </div>
            </div>

            <button
              onClick={() => showToast('Exam policies and settings saved successfully!', 'success')}
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Save size={16} /> Save Examination Policies
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: EXAM INSPECTION & STAGE ACTIONS MODAL                      */}
      {/* =================================================================== */}
      {inspectModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              borderRadius: '16px',
              background: '#0e1726',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {isInspectLoading || !inspectDetail ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Spinner size={36} />
                <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading session details...</p>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        Exam Dossier: {inspectDetail.student_name}
                      </h2>
                      {getStatusBadge(inspectDetail.status)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Phone: {inspectDetail.student_phone} &bull; Track: {inspectDetail.track_type} &bull; Cohort: {inspectDetail.cohort_name || 'Individual'}
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectModalOpen(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      padding: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Pipeline Governance Timeline */}
                <div
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '14px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Review Trail
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {/* Stage 1 */}
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        1. Board Review
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {inspectDetail.board_decision || 'Pending'}
                      </div>
                      {inspectDetail.board_notes && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          "{inspectDetail.board_notes}"
                        </div>
                      )}
                    </div>

                    {/* Stage 2 */}
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        2. Training Admin
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {inspectDetail.training_decision || 'Pending'}
                      </div>
                      {inspectDetail.training_notes && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          "{inspectDetail.training_notes}"
                        </div>
                      )}
                    </div>

                    {/* Stage 3 */}
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        3. System Admin Approval
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {inspectDetail.approved_at ? 'Approved' : 'Pending Review'}
                      </div>
                      {inspectDetail.approval_notes && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          "{inspectDetail.approval_notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score & Exam Questions List */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                      Questions Evaluation ({inspectDetail.score}/{inspectDetail.total_questions} Correct)
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Started: {inspectDetail.started_at ? new Date(inspectDetail.started_at).toLocaleTimeString() : '—'} &bull; Submitted: {inspectDetail.submitted_at ? new Date(inspectDetail.submitted_at).toLocaleTimeString() : '—'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                    {inspectDetail.questions && inspectDetail.questions.length > 0 ? (
                      inspectDetail.questions.map((q) => (
                        <div
                          key={q.id}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            background: 'rgba(0,0,0,0.15)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.8rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              Q{q.sequence_number}. {q.question_text}
                            </span>
                            <Badge variant={q.is_correct ? 'success' : 'danger'}>
                              {q.is_correct ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                          <div style={{ display: 'flex', gap: '14px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span>
                              Candidate: <strong style={{ color: 'var(--text-primary)' }}>{q.selected_option || 'None'}</strong>
                            </span>
                            <span>
                              Correct: <strong style={{ color: 'var(--text-primary)' }}>{q.correct_option}</strong>
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No individual question details logged.</p>
                    )}
                  </div>
                </div>

                {/* Decision Action Area */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Decision Remarks & Actions
                    </div>
                    {inspectDetail.can_system_approve ? (
                      <Badge variant="success">Approval Unlocked</Badge>
                    ) : (
                      <Badge variant="neutral">Approval Locked (Awaiting Prior Reviews)</Badge>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Decision remarks (optional)..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      marginBottom: '10px',
                      outline: 'none',
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      onClick={() => handleStageAction('REJECT')}
                      disabled={isExecutingAction || inspectDetail.status === 'PUBLISHED'}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        background: 'transparent',
                        color: '#ef4444',
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => handleStageAction('APPROVE')}
                      disabled={!inspectDetail.can_system_approve || isExecutingAction}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: inspectDetail.can_system_approve ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: inspectDetail.can_system_approve ? '#ffffff' : 'var(--text-muted)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: inspectDetail.can_system_approve ? 'pointer' : 'not-allowed',
                      }}
                    >
                      Approve & Issue Certificate
                    </button>

                    {inspectDetail.can_publish && !inspectDetail.is_published && (
                      <button
                        onClick={() => handleSinglePublish(inspectDetail.id)}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'var(--primary)',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: EDIT QUESTION MODAL (Fix Typos, Choices, Diagram)          */}
      {/* =================================================================== */}
      {editQuestionModalOpen && editingQuestion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              borderRadius: '16px',
              background: '#0e1726',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  Edit Question #{editingQuestion.question_number}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Correct writing mistakes, edit options, or update answer key
                </div>
              </div>
              <button
                onClick={() => setEditQuestionModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Question Text (English)
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    marginTop: '4px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Question Text (Kinyarwanda)
                </label>
                <textarea
                  rows={2}
                  value={editingQuestion.question_text_kinyarwanda || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question_text_kinyarwanda: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    marginTop: '4px',
                  }}
                />
              </div>

              {/* Options A, B, C, D Edit & Correct Answer Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Answer Choices & Correct Option Key
                </label>
                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const prop = `option_${key.toLowerCase()}` as keyof AdminQuizQuestionItem;
                  const isCorrect = editingQuestion.correct_option === key;
                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.2)',
                        border: isCorrect ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                      }}
                    >
                      <button
                        onClick={() => setEditingQuestion({ ...editingQuestion, correct_option: key })}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: isCorrect ? 'none' : '1px solid var(--border-subtle)',
                          background: isCorrect ? '#10b981' : 'transparent',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                        title={`Click to set ${key} as correct answer`}
                      >
                        {key}
                      </button>
                      <input
                        type="text"
                        value={String(editingQuestion[prop] || '')}
                        onChange={(e) =>
                          setEditingQuestion({ ...editingQuestion, [prop]: e.target.value })
                        }
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          outline: 'none',
                        }}
                      />
                      {isCorrect && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981' }}>
                          CORRECT CHOICE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Diagram / Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={editingQuestion.image || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, image: e.target.value })}
                  placeholder="https://... or /media/..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    marginTop: '4px',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Explanation & Regulatory Reference
                </label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    marginTop: '4px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  onClick={() => setEditQuestionModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveQuestion}
                  disabled={isSavingQuestion}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Save size={16} /> {isSavingQuestion ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: CERTIFICATE VIEW & QR VERIFICATION MODAL                   */}
      {/* =================================================================== */}
      {viewCertModalOpen && selectedCert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '1060px',
              maxHeight: '94vh',
              overflowY: 'auto',
              padding: '24px',
              borderRadius: '16px',
              background: '#0B1528',
              border: '1px solid rgba(30, 144, 255, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Modal Actions Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div>
                <span
                  style={{
                    background: '#1E90FF',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                  }}
                >
                  OFFICIAL SIFO ACCREDITATION REGISTRY
                </span>
                <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '4px' }}>
                  Serial: <strong style={{ color: '#f9fafb' }}>{selectedCert.certificate_number}</strong> • Issued to {selectedCert.student_name}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={15} /> Print / Save PDF
                </button>

                <a
                  href={`/verify/certificate/${selectedCert.verification_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(90deg, #1E90FF 0%, #0F5BB5 100%)',
                    color: '#ffffff',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(30, 144, 255, 0.3)',
                  }}
                >
                  <ExternalLink size={14} /> Open Public Registry
                </a>

                <button
                  onClick={() => setViewCertModalOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#9ca3af',
                    padding: '7px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Landscape Certificate Document */}
            <CertificateLandscapeDocument
              headerSubtitle={selectedCert.template_snapshot?.header_subtitle}
              title={selectedCert.template_snapshot?.title}
              conferralText={selectedCert.template_snapshot?.conferral_text}
              courseName={selectedCert.template_snapshot?.course_name}
              declarationText={selectedCert.template_snapshot?.declaration_text}
              confirmationNotes={selectedCert.template_snapshot?.confirmation_notes}
              trainingAdminName={selectedCert.template_snapshot?.training_admin_name}
              trainingAdminTitle={selectedCert.template_snapshot?.training_admin_title}
              trainingAdminSignature={selectedCert.template_snapshot?.training_admin_signature}
              directorName={selectedCert.template_snapshot?.director_name}
              directorTitle={selectedCert.template_snapshot?.director_title}
              directorSignature={selectedCert.template_snapshot?.director_signature}
              certificateNumber={selectedCert.certificate_number}
              studentName={selectedCert.student_name}
              studentCode={selectedCert.student_code}
              trackType={selectedCert.track_type}
              enterpriseName={selectedCert.enterprise_name}
              cohortName={selectedCert.cohort_name}
              startDate={selectedCert.started_at}
              completedDate={selectedCert.completed_at}
              score={selectedCert.score}
              totalQuestions={selectedCert.total_questions}
              verificationHash={selectedCert.verification_hash}
              verificationUrl={selectedCert.verification_url}
              isPreview={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
