import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Zap,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  AdminService,
  type ExamCreditBalance,
} from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useAuth } from '../../../../context/AuthContext';
import { BuyPracticeExamsModal } from './BuyPracticeExamsModal';

export const GuestExamsSection: React.FC = () => {
  const { user } = useAuth();
  const { error: toastError, success } = useToast();
  const navigate = useNavigate();
  const adminService = AdminService.getInstance();

  const [balance, setBalance] = useState<ExamCreditBalance | null>(null);
  const [buyModalOpen, setBuyModalOpen] = useState<boolean>(false);
  const [launching, setLaunching] = useState<boolean>(false);

  const fetchCredits = async () => {
    try {
      const res = await adminService.getPublicExamCredits(user?.phoneNumber);
      setBalance(res);
    } catch (err: any) {
      console.warn('Could not fetch exam credits:', err);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  const handleStartPracticeExam = async () => {
    if (!balance || balance.credits < 1) {
      setBuyModalOpen(true);
      return;
    }

    try {
      setLaunching(true);
      const session = await adminService.startPublicPracticeExam(user?.phoneNumber);
      success('Exam session started! Redirecting to runner...');
      navigate(`/examinations/session/${session.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to start practice exam.';
      toastError(msg);
      if (err?.response?.status === 402) {
        setBuyModalOpen(true);
      }
    } finally {
      setLaunching(false);
    }
  };

  const availableCredits = balance?.credits ?? 0;

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Top Banner Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0374b5 0%, #003366 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Official Practice Examinations
              </h2>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                }}
              >
                Instant Results
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
              Full 20-question randomized theory tests mirroring Rwanda National Police exam standards.
            </p>
          </div>
        </div>

        {/* Credits Counter & Buy Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '8px 16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Exam Credits
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: availableCredits > 0 ? '#10b981' : '#f59e0b' }}>
              {availableCredits} {availableCredits === 1 ? 'Exam' : 'Exams'}
            </div>
          </div>

          <button
            onClick={() => setBuyModalOpen(true)}
            className="btn btn-secondary btn-md"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <Zap size={16} color="#fb923c" />
            <span>Buy Attempts</span>
          </button>
        </div>
      </div>

      {/* Rules & Engine Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>20 Random Central Bank Questions</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <Clock size={16} color="#38bdf8" />
          <span>Strict 20-Minute Timer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <Award size={16} color="#fb923c" />
          <span>Pass Mark: 12/20 Points</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <Sparkles size={16} color="#a855f7" />
          <span>Instant Explanations & Theory Rationale</span>
        </div>
      </div>

      {/* Primary Launch Action Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(3, 116, 181, 0.15) 0%, rgba(0, 51, 102, 0.25) 100%)',
          border: '1px solid rgba(3, 116, 181, 0.3)',
          borderRadius: '18px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px 0', color: '#ffffff' }}>
            Ready to test your driving theory knowledge?
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0, maxWidth: '580px' }}>
            Launch a realistic examination session. Fullscreen mode is recommended for an authentic test experience.
          </p>
        </div>

        <button
          onClick={handleStartPracticeExam}
          disabled={launching}
          className="btn btn-primary btn-lg"
          style={{
            background: 'linear-gradient(135deg, #0374b5 0%, #003366 100%)',
            borderColor: '#0374b5',
            fontWeight: 800,
            padding: '12px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Play size={18} />
          <span>{launching ? 'Launching Session...' : 'Start Practice Exam'}</span>
        </button>
      </div>

      {/* Buy Modal */}
      <BuyPracticeExamsModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        onSuccess={(updated) => {
          setBalance(updated);
        }}
        defaultPhone={user?.phoneNumber}
      />
    </div>
  );
};
