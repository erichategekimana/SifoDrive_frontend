import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Image as ImageIcon,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Check,
  Lightbulb,
  HelpCircle,
  Eye,
  X,
  Lock,
  Unlock,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { AdminService } from '../../../core/services/AdminService';
import { ManageQuestionModal } from './ManageQuestionModal';

interface QuestionBankTabProps {
  questions: any[];
  filteredQuestions: any[];
  qbSearch: string;
  setQbSearch: (val: string) => void;
  qbDomainFilter: string;
  setQbDomainFilter: (val: string) => void;
  onRefresh?: () => void;
}


export const QuestionBankTab: React.FC<QuestionBankTabProps> = ({
  questions,
  filteredQuestions,
  qbSearch,
  setQbSearch,
  qbDomainFilter,
  setQbDomainFilter,
  onRefresh,
}) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN' || Boolean(user?.isSystemAdmin?.());
  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN' || Boolean(user?.isTrainingAdmin?.());
  const isAnyAdmin = isSystemAdmin || isTrainingAdmin;

  // Question Bank Edit Access Toggle State
  const [editAccessEnabled, setEditAccessEnabled] = useState<boolean>(false);
  const [isTogglingAccess, setIsTogglingAccess] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    adminService
      .getQuestionBankEditAccess()
      .then((data) => {
        if (isMounted && data) {
          setEditAccessEnabled(Boolean(data.edit_access_enabled));
        }
      })
      .catch((err) => {
        console.warn('Failed to load edit access status:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleEditAccess = async () => {
    if (!isSystemAdmin) return;
    const nextState = !editAccessEnabled;
    setIsTogglingAccess(true);
    try {
      const res = await adminService.setQuestionBankEditAccess(nextState);
      setEditAccessEnabled(Boolean(res.edit_access_enabled));
      if (res.edit_access_enabled) {
        success('Central Question Bank edit access is now ENABLED for Admins.');
      } else {
        success('Central Question Bank edit access is now LOCKED.');
      }
    } catch (err: any) {
      toastError(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          'Failed to toggle edit access.'
      );
    } finally {
      setIsTogglingAccess(false);
    }
  };

  const [langView, setLangView] = useState<'RW' | 'EN' | 'FR'>('RW');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedQuestionForEdit, setSelectedQuestionForEdit] = useState<any | null>(null);

  // Image Lightbox preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filter by edited questions only
  const [onlyEdited, setOnlyEdited] = useState<boolean>(false);

  // Total edited count
  const totalEditedCount = useMemo(() => {
    return questions.filter((q: any) => Boolean(q.last_edited_at)).length;
  }, [questions]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [qbSearch, qbDomainFilter, pageSize, onlyEdited]);

  // Filter questions by edited status if onlyEdited is active
  const effectiveQuestions = useMemo(() => {
    if (!onlyEdited) return filteredQuestions;
    return filteredQuestions.filter((q: any) => Boolean(q.last_edited_at));
  }, [filteredQuestions, onlyEdited]);

  // Pagination calculation
  const totalItems = effectiveQuestions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const currentQuestions = useMemo(() => {
    return effectiveQuestions.slice(startIndex, startIndex + pageSize);
  }, [effectiveQuestions, startIndex, pageSize]);

  const handleOpenEditQuestion = (q: any) => {
    setSelectedQuestionForEdit(q);
    setIsModalOpen(true);
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Top Filter and Actions Bar with Rich Gradient Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #155e75 45%, #2e2870 100%)',
          padding: '18px 24px',
          borderRadius: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
            {/* Search input contained in dimmed white */}
            <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255, 255, 255, 0.65)' }}
              />
              <input
                type="text"
                placeholder="Search question prompt, options, or #number..."
                value={qbSearch}
                onChange={(e) => setQbSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.24)',
                  color: '#FFFFFF',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
              {qbSearch && (
                <button
                  type="button"
                  onClick={() => setQbSearch('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Domain filter contained in dimmed white */}
            <select
              value={qbDomainFilter}
              onChange={(e) => setQbDomainFilter(e.target.value)}
              style={{
                padding: '9px 16px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.14)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.24)',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL" style={{ background: '#1E293B', color: '#FFFFFF' }}>All Domains</option>
              <option value="PRIORITY" style={{ background: '#1E293B', color: '#FFFFFF' }}>Priority & Right-of-Way</option>
              <option value="SIGNAGE" style={{ background: '#1E293B', color: '#FFFFFF' }}>Road Signs & Signals</option>
              <option value="SPEED" style={{ background: '#1E293B', color: '#FFFFFF' }}>Speed Limits & Braking</option>
              <option value="SAFETY" style={{ background: '#1E293B', color: '#FFFFFF' }}>Road Safety & First Aid</option>
              <option value="LEGAL" style={{ background: '#1E293B', color: '#FFFFFF' }}>Legal Framework & Penalties</option>
              <option value="VEHICLE" style={{ background: '#1E293B', color: '#FFFFFF' }}>Vehicle Mechanics & Lights</option>
              <option value="PARKING" style={{ background: '#1E293B', color: '#FFFFFF' }}>Parking & Stopping Rules</option>
              <option value="GENERAL" style={{ background: '#1E293B', color: '#FFFFFF' }}>General Driving Rules</option>
            </select>

            {/* Language view toggle capsule */}
            <div
              style={{
                display: 'inline-flex',
                padding: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(10px)',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.22)',
              }}
            >
              {(['RW', 'EN', 'FR'] as const).map((l) => {
                const isActive = langView === l;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLangView(l)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.76rem',
                      fontWeight: isActive ? 700 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: isActive ? '#1E293B' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.88)',
                      boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.22)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {l === 'RW' ? '🇷🇼 Kinyarwanda' : l === 'EN' ? '🇬🇧 English' : '🇫🇷 Français'}
                  </button>
                );
              })}
            </div>

            {/* Filter by Edited Questions Only */}
            <button
              type="button"
              onClick={() => setOnlyEdited((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '9999px',
                border: onlyEdited
                  ? '1px solid #38BDF8'
                  : '1px solid rgba(255, 255, 255, 0.24)',
                background: onlyEdited
                  ? 'rgba(56, 189, 248, 0.22)'
                  : 'rgba(255, 255, 255, 0.14)',
                color: onlyEdited ? '#38BDF8' : '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: onlyEdited ? 700 : 500,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.15s ease',
              }}
              title={onlyEdited ? 'Show all questions' : 'Show only questions that have been edited'}
            >
              <Clock size={13} color={onlyEdited ? '#38BDF8' : 'rgba(255, 255, 255, 0.85)'} />
              <span>Edited Only</span>
              {totalEditedCount > 0 && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: onlyEdited ? '#38BDF8' : 'rgba(255, 255, 255, 0.2)',
                    color: onlyEdited ? '#0F172A' : '#FFFFFF',
                  }}
                >
                  {totalEditedCount}
                </span>
              )}
            </button>
          </div>

          {/* System Admin Edit Access Toggle (ONLY visible for System Admin) */}
          {isSystemAdmin && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 8px 5px 14px',
                borderRadius: '9999px',
                backgroundColor: editAccessEnabled ? 'rgba(16, 185, 129, 0.16)' : 'rgba(255, 255, 255, 0.1)',
                border: editAccessEnabled ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: editAccessEnabled ? '0 2px 10px rgba(16, 185, 129, 0.2)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {editAccessEnabled ? (
                  <Unlock size={14} style={{ color: '#34D399' }} />
                ) : (
                  <Lock size={14} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                )}
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: editAccessEnabled ? '#A7F3D0' : 'rgba(255, 255, 255, 0.85)',
                  }}
                >
                  Edit Access: {editAccessEnabled ? 'ON' : 'OFF'}
                </span>
              </div>

              {/* Modern Slide Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={editAccessEnabled}
                disabled={isTogglingAccess}
                onClick={handleToggleEditAccess}
                style={{
                  width: '42px',
                  height: '24px',
                  borderRadius: '9999px',
                  background: editAccessEnabled ? '#10B981' : 'rgba(255, 255, 255, 0.25)',
                  border: 'none',
                  cursor: isTogglingAccess ? 'wait' : 'pointer',
                  position: 'relative',
                  padding: '2px',
                  transition: 'background-color 0.2s ease',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={editAccessEnabled ? 'Click to lock edit access' : 'Click to enable edit access for Admins'}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                    transform: editAccessEnabled ? 'translateX(18px)' : 'translateX(0px)',
                    transition: 'transform 0.2s ease',
                    display: 'block',
                  }}
                />
              </button>
            </div>
          )}
        </div>

        {/* Sub-bar: Counts & Pagination Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.16)' }}>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Showing <strong style={{ color: '#FFFFFF' }}>{totalItems > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + pageSize, totalItems)}</strong> of <strong style={{ color: '#FFFFFF' }}>{totalItems}</strong> questions
            {qbSearch || qbDomainFilter !== 'ALL' || onlyEdited ? ` (filtered from ${questions.length} total)` : ''}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Per-page selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{
                  background: 'rgba(255, 255, 255, 0.14)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value={10} style={{ background: '#1E293B', color: '#FFFFFF' }}>10</option>
                <option value={20} style={{ background: '#1E293B', color: '#FFFFFF' }}>20</option>
                <option value={50} style={{ background: '#1E293B', color: '#FFFFFF' }}>50</option>
                <option value={100} style={{ background: '#1E293B', color: '#FFFFFF' }}>100</option>
              </select>
            </div>

            {/* Pagination buttons contained in dimmed white */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '9999px',
                padding: '2px 4px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: safePage <= 1 ? 'rgba(255, 255, 255, 0.35)' : '#FFFFFF',
                  padding: '5px 8px',
                  cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  gap: '3px',
                }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF', padding: '0 8px' }}>
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: safePage >= totalPages ? 'rgba(255, 255, 255, 0.35)' : '#FFFFFF',
                  padding: '5px 8px',
                  cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  gap: '3px',
                }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {currentQuestions.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <HelpCircle size={32} style={{ opacity: 0.5, marginBottom: '8px', color: '#FFFFFF' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            {onlyEdited ? 'No Edited Questions Found' : 'No Questions Found'}
          </h4>
          <p style={{ margin: '4px 0 16px', fontSize: '0.84rem' }}>
            {onlyEdited
              ? 'No questions have been edited yet matching your active search or domain filters.'
              : 'No question matches your search term or domain filter.'}
          </p>
          {(qbSearch || qbDomainFilter !== 'ALL' || onlyEdited) && (
            <button
              type="button"
              onClick={() => {
                setQbSearch('');
                setQbDomainFilter('ALL');
                setOnlyEdited(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              <X size={14} />
              <span>Clear Search & Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {currentQuestions.map((q: any) => {
            const hasDiagram = Boolean(q.image || q.option_a_image || q.option_b_image);

            return (
              <div
                key={q.id || q.question_number}
                style={{
                  padding: '20px 24px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.75) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'border-color 0.15s ease',
                }}
              >
                {/* Header Row: Number, Domain, Correct Answer, Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Question Number Capsule */}
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                      }}
                    >
                      #{q.question_number || 'Q'}
                    </span>

                    {/* Edited Badge */}
                    {q.last_edited_at && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setOnlyEdited(true);
                        }}
                        title={`Edited by ${q.last_edited_by_name || 'Admin'} on ${new Date(q.last_edited_at).toLocaleString()} — Click to filter edited questions`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: 'rgba(56, 189, 248, 0.15)',
                          border: '1px solid rgba(56, 189, 248, 0.35)',
                          color: '#38BDF8',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Clock size={12} />
                        <span>Edited</span>
                      </span>
                    )}


                    {/* Correct Option indicator */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                      }}
                    >
                      <Check size={12} />
                      <span>Correct: Option {q.correct_option}</span>
                    </span>

                    {/* Diagram Badge */}
                    {hasDiagram && (
                      <span
                        onClick={() => q.image && setPreviewImage(q.image)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.16)',
                          color: '#FFFFFF',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: q.image ? 'pointer' : 'default',
                        }}
                      >
                        <ImageIcon size={13} />
                        <span>Diagram</span>
                      </span>
                    )}

                    {q.is_active === false && (
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          color: 'rgba(255, 255, 255, 0.65)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                        }}
                      >
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Actions: Edit contained in dimmed white (only available when toggle is ON) */}
                  {editAccessEnabled && isAnyAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditQuestion(q)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 16px',
                          borderRadius: '9999px',
                          background: 'rgba(255, 255, 255, 0.12)',
                          border: '1px solid rgba(255, 255, 255, 0.22)',
                          color: '#FFFFFF',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backdropFilter: 'blur(8px)',
                          transition: 'all 0.15s ease',
                        }}
                        title="Edit this question"
                      >
                        <Pencil size={13} />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Question Prompt (Single selected language) */}
                {(() => {
                  const promptText =
                    langView === 'RW'
                      ? q.question_text_kinyarwanda || q.question_text || 'Ikibazo...'
                      : langView === 'FR'
                      ? q.question_text_french || q.question_text || q.question_text_kinyarwanda || 'Question en français...'
                      : q.question_text || q.question_text_kinyarwanda || 'Question prompt...';

                  return (
                    <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.5 }}>
                      {promptText}
                    </div>
                  );
                })()}

                {/* Main Question Diagram Image if provided */}
                {q.image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                    <div
                      onClick={() => setPreviewImage(q.image)}
                      style={{
                        maxHeight: '120px',
                        maxWidth: '220px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Click to view diagram preview"
                    >
                      <img src={q.image} alt="Traffic Diagram" style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={12} /> Click diagram to enlarge
                    </span>
                  </div>
                )}

                {/* Options Arrangement Grid (A, B, C, D) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '8px',
                    marginTop: '4px',
                  }}
                >
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                    const optEn = q[`option_${opt.toLowerCase()}`];
                    const optRw = q[`option_${opt.toLowerCase()}_kinyarwanda`];
                    const optFr = q[`option_${opt.toLowerCase()}_french`];
                    const optImg = q[`option_${opt.toLowerCase()}_image`];

                    if (!optEn && !optRw && !optFr && !optImg) return null;

                    const activeText =
                      langView === 'RW'
                        ? optRw || optEn || optFr
                        : langView === 'FR'
                        ? optFr || optEn || optRw
                        : optEn || optRw || optFr;

                    const isCorrect = q.correct_option === opt;

                    return (
                      <div
                        key={opt}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: isCorrect ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                          border: isCorrect ? '1.5px solid rgba(255, 255, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: isCorrect ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                            color: isCorrect ? '#0F172A' : 'rgba(255, 255, 255, 0.85)',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: isCorrect ? 'none' : '1px solid rgba(255, 255, 255, 0.14)',
                          }}
                        >
                          {opt}
                        </span>

                        {optImg && (
                          <div
                            onClick={() => setPreviewImage(optImg)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.95)',
                              padding: '2px',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              flexShrink: 0,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <img src={optImg} alt={`Option ${opt}`} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                          </div>
                        )}

                        <div style={{ flex: 1, fontSize: '0.84rem', color: isCorrect ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)', fontWeight: isCorrect ? 700 : 500, lineHeight: 1.4 }}>
                          {activeText}
                        </div>

                        {isCorrect && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              color: '#FFFFFF',
                              background: 'rgba(255, 255, 255, 0.18)',
                              border: '1px solid rgba(255, 255, 255, 0.25)',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              flexShrink: 0,
                            }}
                          >
                            <Check size={11} /> Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Rationale Box (in selected language) */}
                {(() => {
                  const activeExplanation =
                    langView === 'RW'
                      ? q.explanation_kinyarwanda || q.explanation || q.explanation_french
                      : langView === 'FR'
                      ? q.explanation_french || q.explanation || q.explanation_kinyarwanda
                      : q.explanation || q.explanation_kinyarwanda || q.explanation_french;

                  if (!activeExplanation) return null;

                  return (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        fontSize: '0.8rem',
                        color: 'rgba(255, 255, 255, 0.85)',
                        marginTop: '2px',
                      }}
                    >
                      <Lightbulb size={16} color="#FFFFFF" style={{ flexShrink: 0, marginTop: '2px', opacity: 0.9 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <strong style={{ color: '#FFFFFF', fontSize: '0.78rem' }}>Explanation & Theory Rule:</strong>
                        <span>{activeExplanation}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Question Revision Audit Card (Visible to Admins) */}
                {q.last_edited_at && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(56, 189, 248, 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.2)',
                      fontSize: '0.78rem',
                      color: 'rgba(255, 255, 255, 0.9)',
                      marginTop: '2px',
                    }}
                  >
                    <Clock size={16} color="#38BDF8" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ color: '#38BDF8', fontWeight: 700, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Question Revision Audit
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                          {new Date(q.last_edited_at).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.92)' }}>
                        <strong style={{ color: '#FFFFFF' }}>Edited by: </strong>
                        <span>
                          {q.last_edited_by_name || 'Admin'}
                          {q.last_edited_by_role ? ` (${q.last_edited_by_role.replace(/_/g, ' ')})` : ''}
                        </span>
                      </div>
                      {q.edit_reason && (
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                          <strong style={{ color: '#E2E8F0' }}>Reason (Why): </strong>
                          <span style={{ fontStyle: 'italic', color: '#BAE6FD' }}>"{q.edit_reason}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Pagination Bar */}
      {totalPages > 1 && (
        <div
          style={{
            padding: '14px 24px',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.8)' }}>
            Page <strong style={{ color: '#FFFFFF' }}>{safePage}</strong> of <strong style={{ color: '#FFFFFF' }}>{totalPages}</strong> ({totalItems} questions)
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.12)',
                color: safePage <= 1 ? 'rgba(255, 255, 255, 0.35)' : '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <ChevronLeft size={15} />
              <span>Previous Page</span>
            </button>

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              style={{
                padding: '7px 16px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.12)',
                color: safePage >= totalPages ? 'rgba(255, 255, 255, 0.35)' : '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span>Next Page</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Question Management / Edit Modal */}
      {isModalOpen && (
        <ManageQuestionModal
          isOpen={isModalOpen}
          questionToEdit={selectedQuestionForEdit}
          editAccessEnabled={editAccessEnabled}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedQuestionForEdit(null);
          }}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Image Lightbox Preview Modal */}
      {previewImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '16px',
              padding: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '-14px',
                right: '-14px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
            <img
              src={previewImage}
              alt="Diagram Preview"
              style={{ maxHeight: '80vh', maxWidth: '85vw', objectFit: 'contain', borderRadius: '8px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
