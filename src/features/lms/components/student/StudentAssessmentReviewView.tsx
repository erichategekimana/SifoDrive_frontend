import React, { useEffect, useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Award,
  BookOpen,
  Download,
  ExternalLink,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { AdminService, type QuizItem, type QuizSubmissionItem } from '../../../../core/services/AdminService';
import { TutorLmsService, type CohortActivityItem } from '../../../../core/services/TutorLmsService';
import { LmsService } from '../../../../core/services/LmsService';
import { Spinner } from '../../../../components/common/Spinner';
import { PdfViewer } from '../common/PdfViewer';

export interface StudentAssessmentReviewViewProps {
  assessmentId: string;
  isActivity?: boolean;
  courseId?: string;
  courseTitle?: string;
  onBackToGrades?: () => void;
  hideBreadcrumbs?: boolean;
}

export const StudentAssessmentReviewView: React.FC<StudentAssessmentReviewViewProps> = ({
  assessmentId,
  isActivity = false,
  courseId,
  courseTitle: initialCourseTitle,
  onBackToGrades,
  hideBreadcrumbs = false,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [courseTitle, setCourseTitle] = useState<string>(initialCourseTitle || '');
  const [quiz, setQuiz] = useState<QuizItem | null>(null);
  const [submission, setSubmission] = useState<QuizSubmissionItem | null>(null);
  const [activity, setActivity] = useState<CohortActivityItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!assessmentId) {
        setError('Assessment identifier not found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (!initialCourseTitle && courseId && courseId !== 'all') {
          LmsService.getInstance()
            .getCourseDetail(courseId)
            .then((c) => {
              if (isMounted && c?.title) setCourseTitle(c.title);
            })
            .catch(() => {});
        }

        if (isActivity) {
          const activities = await TutorLmsService.getInstance().getStudentCohortActivities(
            undefined,
            courseId !== 'all' ? courseId : undefined
          );
          const found = activities.find((a) => String(a.id) === String(assessmentId));
          if (!found) {
            throw new Error('Activity details could not be found.');
          }
          if (isMounted) setActivity(found);
        } else {
          const [quizData, subs] = await Promise.all([
            AdminService.getInstance().getQuizDetail(assessmentId),
            AdminService.getInstance().getQuizSubmissions(assessmentId),
          ]);

          if (isMounted) {
            setQuiz(quizData);
            if (subs && subs.length > 0) {
              setSubmission(subs[0]);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load assessment review details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [assessmentId, isActivity, courseId, initialCourseTitle]);

  const parsedRubrics = useMemo(() => {
    const raw = isActivity ? (activity as any)?.rubric : quiz?.rubric;
    if (!raw) return [];
    if (typeof raw !== 'string') return [];
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(':');
        if (parts.length >= 2) {
          return { criteria: parts[0].trim(), points: parts.slice(1).join(':').trim() };
        }
        return { criteria: line, points: '' };
      });
  }, [isActivity, activity, quiz?.rubric]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
        }}
      >
        <Spinner size={32} />
        <span style={{ fontSize: '0.88rem', color: '#64748B' }}>Loading assessment review...</span>
      </div>
    );
  }

  if (error || (!quiz && !activity)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#991B1B',
          }}
        >
          <AlertCircle size={20} />
          <span style={{ fontWeight: 600 }}>{error || 'Assessment not found.'}</span>
        </div>
      </div>
    );
  }

  const title = isActivity ? activity?.title : quiz?.title;
  const typeLabel = isActivity ? (activity?.activity_type || 'ACTIVITY') : (quiz?.is_final_exam ? 'FINAL EXAM' : 'QUIZ');
  const instructions = isActivity ? (activity?.instructions || activity?.description) : quiz?.description;
  const totalPoints = isActivity
    ? (activity?.max_score || activity?.total_points || 100)
    : (submission?.total_score || quiz?.total_score || 20);

  const studentSub = isActivity ? (activity?.submission || (activity as any)?.my_submission) : null;
  const hasSub = isActivity ? Boolean(studentSub) : Boolean(submission);

  const score = isActivity ? studentSub?.score : submission?.score;
  const hasScore = score !== null && score !== undefined;
  const tutorFeedback = isActivity ? (studentSub?.tutor_feedback || (studentSub as any)?.feedback) : submission?.feedback;

  const questionsBreakdown = submission?.question_breakdown || [];
  const correctCount = questionsBreakdown.filter((q) => q.is_correct).length;
  const wrongCount = questionsBreakdown.filter((q) => !q.is_correct).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Optional Breadcrumb trail (rendered when standalone and not hidden) */}
      {!hideBreadcrumbs && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B' }}>
          {courseTitle && (
            <>
              <span>{courseTitle}</span>
              <ChevronRight size={14} />
            </>
          )}
          {onBackToGrades ? (
            <span
              onClick={onBackToGrades}
              style={{ color: '#0055A5', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
            >
              Grades
            </span>
          ) : (
            <span>Grades</span>
          )}
          <ChevronRight size={14} />
          <strong style={{ color: '#111827' }}>{title}</strong>
        </div>
      )}

      {/* Primary Score & Status Banner */}
      <div
        className="canvas-card"
        style={{
          padding: '22px 24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: isActivity ? 'rgba(124, 58, 237, 0.12)' : 'rgba(0, 85, 165, 0.12)',
                  color: isActivity ? '#7C3AED' : '#0055A5',
                }}
              >
                {typeLabel.toUpperCase()}
              </span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                {title}
              </h2>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
              <span>Total Points: <strong>{totalPoints} pts</strong></span>
              {submission?.created_at && (
                <>
                  <span>•</span>
                  <span>Submitted: <strong>{new Date(submission.created_at).toLocaleString()}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Grade summary pill */}
          {hasScore ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                padding: '12px 18px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Score
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 850, color: '#0F172A', marginTop: '2px' }}>
                {score} / {totalPoints}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                {Math.round(((Number(score) || 0) / (totalPoints || 1)) * 100)}%
              </div>
            </div>
          ) : hasSub ? (
            <div
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Clock size={16} />
              <span>Submission Received • Awaiting Grade Release</span>
            </div>
          ) : (
            <div
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#64748B',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              Not Attempted Yet
            </div>
          )}
        </div>
      </div>

      {/* Tutor Feedback & Comments */}
      {tutorFeedback && (
        <div
          className="canvas-card"
          style={{
            padding: '20px 24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #BBF7D0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '8px' }}>
            <MessageSquare size={16} />
            <span>Tutor Comments & Evaluation Feedback</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#1F2937', fontStyle: 'italic', lineHeight: 1.6 }}>
            "{tutorFeedback}"
          </p>
        </div>
      )}

      {/* Questions Breakdown */}
      {!isActivity && questionsBreakdown.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Questions Review ({questionsBreakdown.length} Questions)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#15803D', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                <span>{correctCount} Correct</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#DC2626', fontWeight: 700 }}>
                <XCircle size={16} />
                <span>{wrongCount} Incorrect</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {questionsBreakdown.map((q, idx) => {
              const options = q.options || {};
              const optionKeys = Object.keys(options);
              const studentChoice = q.student_answer ? String(q.student_answer).trim().toUpperCase() : null;
              const correctChoice = q.correct_option ? String(q.correct_option).trim().toUpperCase() : null;

              return (
                <div
                  key={q.item_id || idx}
                  className="canvas-card"
                  style={{
                    padding: '20px 22px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: q.is_correct ? '1px solid #BBF7D0' : '1px solid #FECACA',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Question header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748B' }}>
                        Question {q.order || idx + 1}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>•</span>
                      <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                        {q.points} {q.points === 1 ? 'Point' : 'Points'}
                      </span>
                    </div>

                    {q.is_correct ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '4px',
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>Correct (+{q.points} pts)</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '4px',
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                        }}
                      >
                        <XCircle size={14} />
                        <span>Incorrect (0 pts)</span>
                      </span>
                    )}
                  </div>

                  {/* Question text */}
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.94rem', fontWeight: 600, color: '#111827', lineHeight: 1.5 }}>
                    {q.question_text}
                  </p>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {optionKeys.map((key) => {
                      const isStudentSelected = studentChoice === key;
                      const isThisCorrect = correctChoice === key;

                      let borderColor = '#E2E8F0';
                      let bgColor = '#F8FAFC';
                      let textColor = '#334155';

                      if (isStudentSelected && isThisCorrect) {
                        borderColor = '#86EFAC';
                        bgColor = '#F0FDF4';
                        textColor = '#166534';
                      } else if (isStudentSelected && !isThisCorrect) {
                        borderColor = '#FCA5A5';
                        bgColor = '#FEF2F2';
                        textColor = '#991B1B';
                      } else if (isThisCorrect) {
                        borderColor = '#86EFAC';
                        bgColor = '#F0FDF4';
                        textColor = '#166534';
                      }

                      return (
                        <div
                          key={key}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '6px',
                            border: `1px solid ${borderColor}`,
                            backgroundColor: bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            fontSize: '0.86rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: textColor }}>
                            <strong style={{ minWidth: '18px' }}>{key}.</strong>
                            <span>{options[key]}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            {isStudentSelected && (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: isThisCorrect ? '#DCFCE7' : '#FEE2E2',
                                  color: isThisCorrect ? '#15803D' : '#DC2626',
                                }}
                              >
                                {isThisCorrect ? 'Your Answer (Correct)' : 'Your Answer'}
                              </span>
                            )}
                            {isThisCorrect && !isStudentSelected && (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: '#DCFCE7',
                                  color: '#15803D',
                                }}
                              >
                                Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Question explanation */}
                  {q.explanation && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.82rem',
                        color: '#475569',
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ color: '#1E293B' }}>Explanation: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submitted Content for Work Submission Quizzes or Activities */}
      {hasSub && (
        (() => {
          const text = isActivity ? (studentSub?.submission_text || (studentSub as any)?.text_content) : submission?.work_submission_text;
          const fileUrl = isActivity ? (studentSub?.attachment_file || (studentSub as any)?.submission_file) : submission?.work_submission_file_url;
          const link = isActivity ? studentSub?.submission_link : null;

          if (!text && !fileUrl && !link) return null;

          const isPdf = Boolean(fileUrl && (/\.pdf(\?.*)?$/i.test(fileUrl) || fileUrl.toLowerCase().includes('.pdf')));

          return (
            <div
              className="canvas-card"
              style={{
                padding: '20px 24px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                Your Submitted Evidence & Response
              </div>

              {text && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.86rem',
                    color: '#1E293B',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.55,
                  }}
                >
                  {text}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="canvas-btn"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#0055A5',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={14} />
                    <span>Download Submitted File</span>
                  </a>
                )}

                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="canvas-btn"
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#0055A5',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Open Submitted Link</span>
                  </a>
                )}
              </div>

              {isPdf && fileUrl && (
                <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden' }}>
                  <PdfViewer url={fileUrl} title="Submitted PDF Work" minHeight="400px" />
                </div>
              )}
            </div>
          );
        })()
      )}

      {/* Rubric Section */}
      {parsedRubrics.length > 0 && (
        <div
          className="canvas-card"
          style={{
            padding: '20px 24px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '12px' }}>
            <Award size={16} color="#0055A5" />
            <span>Evaluation Rubric</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parsedRubrics.map((r, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #F1F5F9',
                  fontSize: '0.85rem',
                }}
              >
                <span style={{ color: '#1E293B', fontWeight: 500 }}>{r.criteria}</span>
                {r.points && <span style={{ fontWeight: 700, color: '#0055A5' }}>{r.points}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions Section */}
      {instructions && (
        <div
          className="canvas-card"
          style={{
            padding: '20px 24px',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '10px' }}>
            <BookOpen size={16} color="#0055A5" />
            <span>Instructions & Guidelines</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {instructions}
          </p>
        </div>
      )}
    </div>
  );
};
