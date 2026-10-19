import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Users,
  DollarSign,
  CreditCard,
  ShoppingBag,
  Eye,
  Power,
  Calendar,
  FileText,
  Search,
  RefreshCw,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { AdminService, type AdminExamItem, type CandidateSessionItem } from '../../../core/services/AdminService';
import { useToast } from '../../../context/ToastContext';
import { Spinner } from '../../../components/common/Spinner';
import { InspectSessionModal } from '../../../features/examinations/components/pipeline/InspectSessionModal';

export const ExamAuditDetailPage: React.FC = () => {
  const { idOrType } = useParams<{ idOrType: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'transactions' | 'config'>('sessions');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Inspection modal
  const [inspectingSession, setInspectingSession] = useState<CandidateSessionItem | null>(null);
  const [previewSelfie, setPreviewSelfie] = useState<{ name: string; selfie: string } | null>(null);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOfficialExamAudit(idOrType || 'student');
      setAuditData(data);
    } catch (err: any) {
      console.warn('Failed to load exam audit data:', err);
      toastError(err?.response?.data?.message || 'Could not load exam audit data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [idOrType]);

  const exam: AdminExamItem | undefined = auditData?.exam;
  const isStudent = auditData?.exam_type === 'STUDENT';
  const kpis = auditData?.kpis || {};
  const sessions: any[] = auditData?.sessions || [];
  const transactions: any[] = auditData?.transactions || [];
  const packages: any[] = auditData?.packages || [];

  const handleTogglePublish = async () => {
    if (!exam) return;
    try {
      const updated = await adminService.togglePublishOfficialExam(exam.id);
      success(`Exam is now ${updated.is_published ? 'published' : 'draft'}.`);
      fetchAudit();
    } catch (err: any) {
      toastError(err?.response?.data?.message || 'Failed to update publication state.');
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    const name = (s.student_name || '').toLowerCase();
    const id = (s.student_id || '').toLowerCase();
    const cert = (s.certificate_number || '').toLowerCase();
    const status = (s.status || '').toLowerCase();
    return name.includes(term) || id.includes(term) || cert.includes(term) || status.includes(term);
  });

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchFilter) return true;
    const term = searchFilter.toLowerCase();
    const txId = (tx.tx_id || '').toLowerCase();
    const phone = (tx.recipient_phone || '').toLowerCase();
    const paying = (tx.paying_number || '').toLowerCase();
    const pkg = (tx.package_name || '').toLowerCase();
    return txId.includes(term) || phone.includes(term) || paying.includes(term) || pkg.includes(term);
  });

  if (loading && !auditData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
        <Spinner size={36} />
        <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Loading examination audit dossier...</span>
      </div>
    );
  }

  const isPublished = exam?.is_published || exam?.status === 'PUBLISHED';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Navigation & Action Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '16px 20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/examinations?tab=exams')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Exams</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                {exam?.title || (isStudent ? 'Sifo Driving School Examination' : 'Public Practice Examination')}
              </h2>
              {!isStudent && (
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: 'rgba(56, 189, 248, 0.18)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#38BDF8',
                  }}
                >
                  For Everyone • MoMo Pay-Per-Exam
                </span>
              )}
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Comprehensive Audit Dossier • Automatic 20-Question Pool • 20 Min Timer • 12/20 Pass Score • Uneditable Auto-Grading
            </p>
          </div>
        </div>

        {/* Action button: ONLY 'Publish' as required */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchAudit}
            style={{
              padding: '8px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePublish}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              borderRadius: '9999px',
              background: isPublished
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.3) 100%)'
                : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: isPublished
                ? '1px solid rgba(239, 68, 68, 0.5)'
                : '1px solid rgba(16, 185, 129, 0.5)',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: isPublished ? 'none' : '0 4px 14px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Power size={14} />
            <span>{isPublished ? 'Unpublish Exam' : 'Publish Exam'}</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} color="#38BDF8" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>Total Attempts</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF' }}>{kpis.total_attempts ?? 0}</div>
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={20} color="#10B981" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>Passed (≥ 12/20)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34D399' }}>
              {kpis.passed_attempts ?? 0}{' '}
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}>
                ({kpis.pass_rate_percentage ?? 0}%)
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={20} color="#F59E0B" />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>Average Score</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FBBF24' }}>
              {kpis.average_score ?? 0} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>/ 20</span>
            </div>
          </div>
        </div>

        {isStudent ? (
          <>
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>Proctoring Flags</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#F87171' }}>{kpis.total_violations ?? 0}</div>
              </div>
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={20} color="#38BDF8" />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>Certificates Issued</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38BDF8' }}>{kpis.certified_count ?? 0}</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={20} color="#38BDF8" />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>Packages Bought</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38BDF8' }}>{kpis.total_packages_sold ?? 0}</div>
              </div>
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={20} color="#10B981" />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>MoMo Revenue</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#34D399' }}>
                  {(kpis.total_revenue_rwf ?? 0).toLocaleString()}{' '}
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>RWF</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs Bar & Search Filter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            style={{
              padding: '7px 18px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'sessions' ? 700 : 500,
              background: activeTab === 'sessions' ? '#1E293B' : 'transparent',
              color: activeTab === 'sessions' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users size={14} />
            <span>{isStudent ? 'Student Attempts & Integrity' : 'Practice Attempts'} ({sessions.length})</span>
          </button>

          {!isStudent && (
            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              style={{
                padding: '7px 18px',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: activeTab === 'transactions' ? 700 : 500,
                background: activeTab === 'transactions' ? '#1E293B' : 'transparent',
                color: activeTab === 'transactions' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CreditCard size={14} />
              <span>MoMo Purchases ({transactions.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('config')}
            style={{
              padding: '7px 18px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'config' ? 700 : 500,
              background: activeTab === 'config' ? '#1E293B' : 'transparent',
              color: activeTab === 'config' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={14} />
            <span>{isStudent ? 'Curriculum & Proctoring Rules' : 'Packages & Pricing'}</span>
          </button>
        </div>

        {activeTab !== 'config' && (
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.5)' }}
            />
            <input
              type="text"
              placeholder={activeTab === 'sessions' ? 'Search candidates, scores, certificates...' : 'Search transactions, numbers...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SESSIONS / ATTEMPTS AUDIT                                          */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <div
          style={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.45) 0%, rgba(15, 23, 42, 0.65) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#FFFFFF' }}>
              {isStudent ? 'Enrolled Student Attempts & Proctoring Audit' : 'Practice Examination Candidate Log'}
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)' }}>
              Showing {filteredSessions.length} of {sessions.length} recorded attempts
            </span>
          </div>

          {filteredSessions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.88rem' }}>
              No examination attempts found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '12px 18px' }}>Candidate</th>
                    <th style={{ padding: '12px 14px' }}>Date & Window</th>
                    <th style={{ padding: '12px 14px' }}>Score (Auto-Graded)</th>
                    {isStudent && <th style={{ padding: '12px 14px' }}>Identity & Telemetry</th>}
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    {isStudent && <th style={{ padding: '12px 14px' }}>Certificate</th>}
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Audit Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((s) => {
                    const isPassed = s.passed === true;
                    const violations = s.violation_count || 0;
                    const dateStr = s.created_at ? new Date(s.created_at).toLocaleString() : 'N/A';
                    const selfieImg = s.identity_image || s.preflight_checks?.selfie_image;

                    return (
                      <tr
                        key={s.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '12px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {(s.student_name || 'C')[0].toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{s.student_name || 'Candidate'}</div>
                              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                                {s.student_id || 'ID: Public'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', color: 'rgba(255, 255, 255, 0.85)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Calendar size={12} color="rgba(255, 255, 255, 0.5)" />
                            <span>{dateStr}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                            Duration: {s.duration_minutes || 20}m limit
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px' }}>
                          {s.score !== null && s.score !== undefined ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  fontSize: '0.95rem',
                                  fontWeight: 800,
                                  color: isPassed ? '#10B981' : '#EF4444',
                                }}
                              >
                                {s.score}/20
                              </span>
                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  background: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: isPassed ? '#34D399' : '#FCA5A5',
                                  border: isPassed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                }}
                              >
                                {isPassed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>In Progress</span>
                          )}
                        </td>

                        {isStudent && (
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {selfieImg ? (
                                <button
                                  type="button"
                                  onClick={() => setPreviewSelfie({ name: s.student_name, selfie: selfieImg })}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    padding: 0,
                                  }}
                                  title="Click to view pre-flight identity selfie"
                                >
                                  <img
                                    src={selfieImg}
                                    alt="Selfie"
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '6px',
                                      objectFit: 'cover',
                                      border: '1px solid rgba(56, 189, 248, 0.4)',
                                    }}
                                  />
                                </button>
                              ) : (
                                <Camera size={14} color="rgba(255, 255, 255, 0.4)" />
                              )}

                              <span
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  background: violations > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                  color: violations > 0 ? '#F87171' : '#34D399',
                                }}
                              >
                                {violations > 0 ? `${violations} flags` : 'Clean'}
                              </span>
                            </div>
                          </td>
                        )}

                        <td style={{ padding: '12px 14px' }}>
                          <span
                            style={{
                              padding: '3px 9px',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background:
                                s.status === 'PUBLISHED'
                                  ? 'rgba(16, 185, 129, 0.18)'
                                  : s.status === 'REJECTED'
                                  ? 'rgba(239, 68, 68, 0.18)'
                                  : 'rgba(245, 158, 11, 0.18)',
                              color:
                                s.status === 'PUBLISHED'
                                  ? '#34D399'
                                  : s.status === 'REJECTED'
                                  ? '#F87171'
                                  : '#FBBF24',
                            }}
                          >
                            {s.status}
                          </span>
                        </td>

                        {isStudent && (
                          <td style={{ padding: '12px 14px' }}>
                            {s.certificate_number ? (
                              <span style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.76rem' }}>
                                {s.certificate_number}
                              </span>
                            ) : (
                              <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>—</span>
                            )}
                          </td>
                        )}

                        <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setInspectingSession(s)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '9999px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.18)',
                              color: '#FFFFFF',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <Eye size={12} />
                            <span>Audit Dossier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TRANSACTIONS AUDIT (FOR PUBLIC PRACTICE EXAM)                      */}
      {/* ========================================================================= */}
      {activeTab === 'transactions' && !isStudent && (
        <div
          style={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.45) 0%, rgba(15, 23, 42, 0.65) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#FFFFFF' }}>
              MoMo Exam Purchases & Revenue Ledger
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700 }}>
              Total Revenue: {(kpis.total_revenue_rwf ?? 0).toLocaleString()} RWF
            </span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.88rem' }}>
              No purchase transactions recorded yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: 'rgba(255, 255, 255, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '12px 18px' }}>Transaction ID</th>
                    <th style={{ padding: '12px 14px' }}>Recipient Account / Phone</th>
                    <th style={{ padding: '12px 14px' }}>Paying MoMo Number</th>
                    <th style={{ padding: '12px 14px' }}>Package Bought</th>
                    <th style={{ padding: '12px 14px' }}>Amount (RWF)</th>
                    <th style={{ padding: '12px 14px' }}>Date</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, idx) => (
                    <tr key={tx.tx_id || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px 18px', fontWeight: 700, color: '#38BDF8' }}>
                        {tx.tx_id || 'MOMO-N/A'}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#FFFFFF' }}>
                        {tx.recipient_phone || 'Permanent Guest'}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'rgba(255, 255, 255, 0.75)' }}>
                        {tx.paying_number || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#FFFFFF', fontWeight: 600 }}>
                        {tx.package_name || tx.package || 'Practice Exam'} ({tx.credits_added || 1} credits)
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#10B981' }}>
                        {(tx.amount_rwf || 0).toLocaleString()} RWF
                      </td>
                      <td style={{ padding: '12px 14px', color: 'rgba(255, 255, 255, 0.65)' }}>
                        {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34D399',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          {tx.status || 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONFIGURATION & ENGINE RULES                                      */}
      {/* ========================================================================= */}
      {activeTab === 'config' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Rules Card */}
          <div
            style={{
              padding: '22px 24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.45) 0%, rgba(15, 23, 42, 0.65) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} color="#38BDF8" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                System Engine Invariants
              </h4>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5 }}>
              Neither administrators nor instructors can create custom questions for this exam. Every attempt dynamically draws 20 fresh questions from the Central Question Bank across official domains.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Question Draw:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 700 }}>20 questions (Priority: 4, Signage: 4, Speed: 4, Legal: 3, Safety: 3, Parking: 2)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Timer:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 700 }}>Strict 20-minute server countdown</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Scoring & Passing:</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>1 point each • 12/20 pass mark (60%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Grade Immutability:</span>
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>Strictly uneditable (auto-graded on submit)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Attempts Allowed:</span>
                <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{isStudent ? 'Exactly 1 attempt per window' : 'Pay per attempt (MoMo credits)'}</span>
              </div>
            </div>
          </div>

          {/* Pricing or Proctoring Details */}
          <div
            style={{
              padding: '22px 24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.45) 0%, rgba(15, 23, 42, 0.65) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isStudent ? <Clock size={20} color="#38BDF8" /> : <CreditCard size={20} color="#38BDF8" />}
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                {isStudent ? 'Proctoring Protocols & Schedule' : 'Active MoMo Purchase Packages'}
              </h4>
            </div>

            {isStudent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: '2px' }}>Pre-Flight Identity Verification</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Live webcam selfie snapshot captured and cross-checked before starting.</div>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: '2px' }}>Real-time Tab & Screen Departure</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Window blurs, tab departures, and fullscreen exits logged as violations.</div>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)' }}>
                  <div style={{ fontWeight: 700, color: '#38BDF8', marginBottom: '2px' }}>Sequential 3-Stage Governance</div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.75)' }}>Board Reviewer $\rightarrow$ Training Admin $\rightarrow$ System Admin Certificate release.</div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {packages.map((pkg) => (
                  <div
                    key={pkg.key}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.86rem' }}>
                        {pkg.name} {pkg.badge && <span style={{ fontSize: '0.7rem', color: '#38BDF8' }}>({pkg.badge})</span>}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {pkg.credits} credit{pkg.credits > 1 ? 's' : ''} • {pkg.description}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#10B981', fontSize: '0.94rem' }}>
                      {pkg.price_rwf.toLocaleString()} RWF
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proctoring Inspection Modal */}
      {inspectingSession && (
        <InspectSessionModal
          isOpen={Boolean(inspectingSession)}
          sessionId={inspectingSession.id}
          onClose={() => setInspectingSession(null)}
          onActionCompleted={() => {
            setInspectingSession(null);
            fetchAudit();
          }}
          isBoardReviewer={user?.role === 'BOARD_REVIEWER' || Boolean(user?.isBoardReviewer?.())}
          isTrainingAdmin={user?.role === 'TRAINING_ADMIN' || Boolean(user?.isTrainingAdmin?.())}
          isSystemAdmin={user?.role === 'SYSTEM_ADMIN' || Boolean(user?.isSystemAdmin?.())}
        />
      )}

      {/* Selfie Preview Modal */}
      {previewSelfie && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setPreviewSelfie(null)}
        >
          <div
            style={{
              background: '#0F172A',
              padding: '24px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              maxWidth: '440px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: '0 0 12px', color: '#FFFFFF' }}>
              Pre-Flight Identity Snapshot: {previewSelfie.name}
            </h4>
            <img
              src={previewSelfie.selfie}
              alt="Identity Selfie"
              style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)' }}
            />
            <button
              type="button"
              onClick={() => setPreviewSelfie(null)}
              style={{
                marginTop: '16px',
                padding: '8px 20px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Close Snapshot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamAuditDetailPage;
