import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Zap,
} from 'lucide-react';
import {
  AdminService,
  type ExamPackageItem,
  type ExamCreditBalance,
} from '../../../../core/services/AdminService';
import { useToast } from '../../../../context/ToastContext';
import { useAuth } from '../../../../context/AuthContext';

interface BuyPracticeExamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (credits: ExamCreditBalance) => void;
  defaultPhone?: string;
}

export const BuyPracticeExamsModal: React.FC<BuyPracticeExamsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultPhone = '',
}) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const adminService = AdminService.getInstance();

  const [packages, setPackages] = useState<ExamPackageItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('BUNDLE_5');
  const [payingNumber, setPayingNumber] = useState<string>(
    user?.phoneNumber || defaultPhone || ''
  );
  const [recipientPhone, setRecipientPhone] = useState<string>(
    user?.phoneNumber || defaultPhone || ''
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      adminService
        .getPublicExamPackages()
        .then((pkgs) => {
          setPackages(pkgs);
          if (pkgs.length > 0 && !selectedKey) {
            setSelectedKey(pkgs[0].key);
          }
        })
        .catch(() => {});


      if (user?.phoneNumber) {
        setPayingNumber(user.phoneNumber);
        setRecipientPhone(user.phoneNumber);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingNumber.trim()) {
      toastError('Please enter your MoMo paying number.');
      return;
    }
    if (!recipientPhone.trim()) {
      toastError('Please enter the recipient phone number to credit exams.');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await adminService.buyPublicExamCredits({
        package_key: selectedKey,
        paying_number: payingNumber.trim(),
        phone_number: recipientPhone.trim(),
      });

      success(res.message || 'Exams purchased successfully via MoMo!');
      const updatedBalance = await adminService.getPublicExamCredits(recipientPhone.trim());
      onSuccess(updatedBalance);
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Payment processing failed. Please verify MoMo balance and retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPkg = packages.find((p) => p.key === selectedKey);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '620px',
          width: '100%',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  background: 'rgba(234, 88, 12, 0.15)',
                  color: '#fb923c',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                OFFICIAL PRACTICE EXAMS
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Purchase Exam Attempts
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Instant mobile payment via MTN / Airtel MoMo. Credits are assigned directly to your account.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Package Selector Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
            Select Exam Package:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {packages.map((pkg) => {
              const isSelected = selectedKey === pkg.key;
              return (
                <div
                  key={pkg.key}
                  onClick={() => setSelectedKey(pkg.key)}
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(3, 116, 181, 0.2) 0%, rgba(3, 116, 181, 0.05) 100%)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected
                      ? '2px solid #0374b5'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pkg.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#0374b5',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                      }}
                    >
                      {pkg.badge}
                    </span>
                  )}
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#ffffff', marginBottom: '4px' }}>
                    {pkg.name}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginBottom: '6px' }}>
                    {pkg.price_rwf.toLocaleString()} RWF
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>
                    {pkg.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePurchase} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Paying Number Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>
              Paying Mobile Money Number:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                value={payingNumber}
                onChange={(e) => setPayingNumber(e.target.value)}
                placeholder="e.g. 0788123456"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '12px 14px 12px 42px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                }}
              />
              <Phone
                size={18}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
              You will receive an instant MoMo USSD prompt on this phone to confirm payment.
            </div>
          </div>

          {/* Recipient Phone (if guest or gift) */}
          {!user && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '6px' }}>
                Account / Result Phone Number:
              </label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="e.g. 0788123456"
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                }}
              />
            </div>
          )}

          {/* Summary Box */}
          {selectedPkg && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Total Due</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                  {selectedPkg.price_rwf.toLocaleString()} RWF
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Credits Added</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                  +{selectedPkg.credits} Exams
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="btn btn-primary btn-md"
              style={{
                background: 'linear-gradient(135deg, #058728 0%, #04631e 100%)',
                borderColor: '#058728',
                fontWeight: 700,
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Zap size={16} />
              <span>{isProcessing ? 'Processing MoMo Payment...' : 'Pay with MoMo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
