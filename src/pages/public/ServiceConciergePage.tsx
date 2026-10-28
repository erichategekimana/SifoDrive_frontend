import React, { useState, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  Send,
  Award,
  Check,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { PublicPageBackground } from '../../components/layout/PublicPageBackground';
import { useTranslation } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';
import { usePublicAgentServices } from '../../hooks/usePublicAgentServices';
import {
  DEFAULT_AGENT_SERVICE_STEPS,
  DEFAULT_AGENT_SERVICES_BOOKING_FORM,
  DEFAULT_AGENT_SERVICE_OPTIONS,
  DEFAULT_DISTRICT_OPTIONS,
  DEFAULT_TESTING_CENTER_OPTIONS,
  DEFAULT_WORKING_SITE_OPTIONS,
  DEFAULT_TEACHER_OPTIONS,
  ALL_BOOKING_FIELD_KEYS,
  DEFAULT_SERVICE_FIELDS,
} from '../../features/settings/hooks/useAdminSettingsData';
import type { BookingFormFieldKey } from '../../features/settings/types';

export const ServiceConciergePage: React.FC = () => {
  const { language } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isRw = language === 'rw';
  const { agentServicesConfig } = usePublicAgentServices();

  const title = isRw
    ? (agentServicesConfig.howItWorksTitleRw || agentServicesConfig.howItWorksTitle || 'Uko Bikora & Ibyiza')
    : (agentServicesConfig.howItWorksTitle || 'How It Works & Booking Steps');

  const steps = (agentServicesConfig.steps && agentServicesConfig.steps.length > 0)
    ? agentServicesConfig.steps
    : DEFAULT_AGENT_SERVICE_STEPS;

  const formConfig = agentServicesConfig.bookingForm || DEFAULT_AGENT_SERVICES_BOOKING_FORM;

  const formTitle = isRw
    ? (formConfig.formTitleRw || formConfig.formTitle || 'Kora Gahunda ya Agent')
    : (formConfig.formTitle || 'Book Agent Service');

  const formSubtitle = isRw
    ? (formConfig.formSubtitleRw || formConfig.formSubtitle || 'Uzuza iyi myirondoro, umu-ajenti wa Sifo Drive aragufasha mu kanya gato.')
    : (formConfig.formSubtitle || 'Fill in your details below. A Sifo Drive agent will process your request remotely.');

  const submitBtnText = isRw
    ? (formConfig.submitButtonTextRw || formConfig.submitButtonText || 'Ohereza Ubusabe bwa Agent')
    : (formConfig.submitButtonText || 'Submit Agent Service Request');

  const rawServiceOptions = (Array.isArray(formConfig.serviceOptions) && formConfig.serviceOptions.length > 0)
    ? formConfig.serviceOptions
    : DEFAULT_AGENT_SERVICE_OPTIONS;

  const serviceOptions = rawServiceOptions.map((opt) => ({
    key: opt.key || opt.id,
    label: isRw ? (opt.labelRw || opt.label) : opt.label,
  }));

  const districtOptions = ((Array.isArray(formConfig.districtOptions) && formConfig.districtOptions.length > 0)
    ? formConfig.districtOptions
    : DEFAULT_DISTRICT_OPTIONS).map((opt) => ({
      key: opt.key || opt.label,
      label: isRw ? (opt.labelRw || opt.label) : opt.label,
    }));

  const testingCenterOptions = ((Array.isArray(formConfig.testingCenterOptions) && formConfig.testingCenterOptions.length > 0)
    ? formConfig.testingCenterOptions
    : DEFAULT_TESTING_CENTER_OPTIONS).map((opt) => ({
      key: opt.key || opt.label,
      label: isRw ? (opt.labelRw || opt.label) : opt.label,
    }));

  const workingSiteOptions = ((Array.isArray(formConfig.workingSiteOptions) && formConfig.workingSiteOptions.length > 0)
    ? formConfig.workingSiteOptions
    : DEFAULT_WORKING_SITE_OPTIONS).map((opt) => ({
      key: opt.key || opt.label,
      label: isRw ? (opt.labelRw || opt.label) : opt.label,
    }));

  const teacherOptions = ((Array.isArray(formConfig.teacherOptions) && formConfig.teacherOptions.length > 0)
    ? formConfig.teacherOptions
    : DEFAULT_TEACHER_OPTIONS).map((opt) => ({
      key: opt.key || opt.label,
      label: isRw ? (opt.labelRw || opt.label) : opt.label,
    }));

  const defaultServiceKey = serviceOptions.length > 0 ? serviceOptions[0].key : 'irembo_provisional';

  const [formState, setFormState] = useState({
    fullName: '',
    phone: '',
    nationalId: '',
    dateOfBirth: '',
    serviceType: defaultServiceKey,
    category: '',
    provisionalLicenseNumber: '',
    preferredDistrict: '',
    testingCenter: '',
    workingSite: '',
    teacher: '',
    preferredDate: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [manuallyAdvancedSteps, setManuallyAdvancedSteps] = useState<Record<string, boolean>>({});

  const selectedServiceOption = useMemo(() => {
    return rawServiceOptions.find(
      (s) => (s.key || s.id) === formState.serviceType
    ) || rawServiceOptions[0];
  }, [rawServiceOptions, formState.serviceType]);

  const orderedFieldKeys: BookingFormFieldKey[] = useMemo(() => {
    if (selectedServiceOption?.fields && Array.isArray(selectedServiceOption.fields) && selectedServiceOption.fields.length > 0) {
      return selectedServiceOption.fields;
    }
    if (formConfig.serviceFieldsMap?.[formState.serviceType]) {
      return formConfig.serviceFieldsMap[formState.serviceType];
    }
    return DEFAULT_SERVICE_FIELDS[formState.serviceType] || ALL_BOOKING_FIELD_KEYS;
  }, [selectedServiceOption, formConfig.serviceFieldsMap, formState.serviceType]);

  const handleServiceChange = (newServiceKey: string) => {
    setFormState((prev) => ({ ...prev, serviceType: newServiceKey }));
    setManuallyAdvancedSteps({});
  };

  const isFieldRequired = (key: BookingFormFieldKey): boolean => {
    if (key === 'fullName' || key === 'phoneNumber') return true;
    if (key === 'preferredDate' && formConfig.requirePreferredDate) return true;
    return false;
  };

  const isFieldEmpty = useCallback((key: BookingFormFieldKey): boolean => {
    switch (key) {
      case 'fullName':
        return !formState.fullName.trim();
      case 'phoneNumber':
        return !formState.phone.trim();
      case 'nationalId':
        return !formState.nationalId.trim();
      case 'dateOfBirth':
        return !formState.dateOfBirth;
      case 'licenseCategory':
        return !formState.category;
      case 'provisionalLicenseNumber':
        return !formState.provisionalLicenseNumber.trim();
      case 'preferredDistrict':
        return !formState.preferredDistrict;
      case 'testingCenter':
        return !formState.testingCenter;
      case 'workingSite':
        return !formState.workingSite;
      case 'teacher':
        return !formState.teacher;
      case 'preferredDate':
        return !formState.preferredDate;
      case 'notes':
        return !formState.notes.trim();
      default:
        return false;
    }
  }, [formState]);

  // Rwandan phone validation (078, 072, 073, 079)
  const validateRwandanPhone = (phone: string): { isValid: boolean; errorEn: string; errorRw: string } => {
    const cleaned = phone.replace(/[\s-]/g, '');
    if (!cleaned) {
      return { isValid: false, errorEn: 'Phone number is required.', errorRw: 'Nimero ya telefone irakenewe.' };
    }
    const rwRegex = /^(?:(?:\+?250)|0)(7[2389]\d{7})$/;
    if (!rwRegex.test(cleaned)) {
      return {
        isValid: false,
        errorEn: 'Must be a valid Rwandan phone number starting with 078, 072, or 073 (10 digits).',
        errorRw: 'Nimero igomba gutangizwa na 078, 072, cyangwa 073 kandi ikagira imibare 10 (Urugero: 0788 123 456).'
      };
    }
    return { isValid: true, errorEn: '', errorRw: '' };
  };

  const getFieldError = useCallback((key: BookingFormFieldKey): string => {
    const empty = isFieldEmpty(key);
    const required = isFieldRequired(key);

    if (empty) {
      if (required) {
        return isRw ? 'Uyu mwanya urakenewe.' : 'This field is required.';
      }
      return '';
    }

    switch (key) {
      case 'fullName': {
        const parts = formState.fullName.trim().split(/\s+/).filter(Boolean);
        if (parts.length < 2 || formState.fullName.trim().length < 4) {
          return isRw
            ? 'Andika nibura amazina abiri (urugero: Eric Mugisha).'
            : 'Please enter at least two names (e.g. Eric Mugisha).';
        }
        return '';
      }
      case 'phoneNumber': {
        const res = validateRwandanPhone(formState.phone);
        return res.isValid ? '' : (isRw ? res.errorRw : res.errorEn);
      }
      case 'nationalId': {
        const cleanNid = formState.nationalId.replace(/[\s-]/g, '');
        if (cleanNid.length > 0 && cleanNid.length !== 16) {
          return isRw
            ? 'Numero y\'indangamuntu igomba kuba igizwe n\'imibare 16 neza.'
            : 'Rwandan National ID must be exactly 16 numeric digits.';
        }
        return '';
      }
      case 'dateOfBirth': {
        if (formState.dateOfBirth) {
          const dob = new Date(formState.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear() - (
            (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0
          );
          if (age < 18) {
            return isRw
              ? 'Umukandida agomba kuba afite nibura imyaka 18 y\'amavuko.'
              : 'Applicant must be at least 18 years old to apply for driving test.';
          }
        }
        return '';
      }
      case 'preferredDate': {
        if (formState.preferredDate) {
          const sel = new Date(formState.preferredDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (sel < today) {
            return isRw
              ? 'Itariki yatoranyijwe ntishobora kuba yararenze.'
              : 'Preferred date cannot be in the past.';
          }
        }
        return '';
      }
      case 'provisionalLicenseNumber': {
        if (formState.provisionalLicenseNumber.trim().length > 0 && formState.provisionalLicenseNumber.trim().length < 3) {
          return isRw
            ? 'Numero y\'uruhushya rw\'agateganyo igomba kugira nibura inyuguti 3.'
            : 'Must be at least 3 characters.';
        }
        return '';
      }
      default:
        return '';
    }
  }, [formState, isFieldEmpty, isRw, formConfig.requirePreferredDate]);

  const isStepSatisfied = useCallback((idx: number): boolean => {
    const key = orderedFieldKeys[idx];
    if (!key) return true;
    const empty = isFieldEmpty(key);
    const required = isFieldRequired(key);

    if (manuallyAdvancedSteps[key] && !required && empty) {
      return true;
    }
    if (empty) {
      return !required && manuallyAdvancedSteps[key] === true;
    }
    return getFieldError(key) === '';
  }, [orderedFieldKeys, manuallyAdvancedSteps, isFieldEmpty, getFieldError]);

  // Reveal steps progressively: first unsatisfied step is visible; filling it unlocks next!
  const visibleStepCount = useMemo(() => {
    if (orderedFieldKeys.length === 0) return 0;
    for (let i = 0; i < orderedFieldKeys.length; i++) {
      if (!isStepSatisfied(i)) {
        return i + 1;
      }
    }
    return orderedFieldKeys.length;
  }, [orderedFieldKeys, isStepSatisfied]);

  const isProcessCompleted = useMemo(() => {
    if (orderedFieldKeys.length === 0) return false;
    return orderedFieldKeys.every((_, idx) => isStepSatisfied(idx));
  }, [orderedFieldKeys, isStepSatisfied]);

  const satisfiedCount = useMemo(() => {
    return orderedFieldKeys.filter((_, idx) => isStepSatisfied(idx)).length;
  }, [orderedFieldKeys, isStepSatisfied]);

  const getFieldLabel = (key: BookingFormFieldKey): string => {
    switch (key) {
      case 'fullName':
        return isRw ? 'Amazina Yombi' : 'Full Legal Name';
      case 'phoneNumber':
        return isRw ? 'Nimero ya Telefone (078, 072, 073)' : 'Phone Number (078, 072, 073)';
      case 'nationalId':
        return isRw ? 'Numero y\'Indangamuntu' : 'National ID Number';
      case 'dateOfBirth':
        return isRw ? 'Itariki y\'Amavuko' : 'Date of Birth';
      case 'licenseCategory':
        return isRw ? 'Icyiciro cy\'Uruhushya' : 'License Category';
      case 'provisionalLicenseNumber':
        return isRw ? 'Numero y\'Uruhushya rw\'Agateganyo' : 'Provisional License Number';
      case 'preferredDistrict':
        return isRw ? 'Akarere Wifuza' : 'Preferred District';
      case 'testingCenter':
        return isRw ? 'Ikigo cy\'Ikizamini' : 'Testing Center';
      case 'workingSite':
        return isRw ? 'Site yo Gukoreraho' : 'Working Site';
      case 'teacher':
        return isRw ? 'Umwarimu Wakwigishije' : 'Driving Teacher / Instructor';
      case 'preferredDate':
        return isRw ? 'Itariki Yitezwe y\'Ikizamini' : 'Preferred Date / Target Date';
      case 'notes':
        return isRw ? 'Ibisobanuro Byiyongereyeho' : 'Additional Requests or Notes';
      default:
        return key;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProcessCompleted) {
      return;
    }
    setSubmitted(true);
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicPageBackground />
      <Navbar />

      {/* Combined Single Block: How It Works & Booking Form */}
      <section style={{ position: 'relative', zIndex: 1, padding: '50px 24px 80px 24px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
        <div
          style={{
            borderRadius: '28px',
            padding: '44px 40px',
            background: isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(203, 213, 225, 0.9)',
            boxShadow: isDark ? '0 20px 40px rgba(0, 0, 0, 0.6)' : '0 15px 35px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Part 1: How It Works & Booking Steps */}
          <div id="how-it-works" style={{ marginBottom: '32px' }}>
            <h1
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.2rem)',
                marginBottom: '20px',
                fontWeight: 800,
                color: isDark ? '#ffffff' : '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {steps.map((step, idx) => {
                const stepNum = step.stepNumber ?? (idx + 1);
                const stepTitle = isRw ? (step.titleRw || step.title) : step.title;
                const stepDesc = isRw ? (step.descriptionRw || step.description) : step.description;

                return (
                  <div key={step.id || idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(2, 132, 199, 0.12)',
                        color: isDark ? '#38bdf8' : '#0284c7',
                        border: isDark ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(2, 132, 199, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {stepNum}
                    </span>
                    <p style={{ margin: 0, fontSize: '1.02rem', lineHeight: 1.6, color: isDark ? '#cbd5e1' : '#334155' }}>
                      {stepTitle && (
                        <strong style={{ color: isDark ? '#ffffff' : '#0f172a' }}>
                          {stepTitle}{stepTitle.trim().endsWith(':') ? ' ' : ': '}
                        </strong>
                      )}
                      {stepDesc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subtle Divider */}
          <div
            style={{
              height: '1px',
              background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 0.9)',
              margin: '36px 0 32px 0',
            }}
          />

          {/* Part 2: Booking Form */}
          <div id="book-concierge">
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <Award size={36} color="#0284c7" style={{ margin: '0 auto 12px auto' }} />
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a', marginBottom: '8px' }}>
                {formTitle}
              </h2>
              <p style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.98rem' }}>
                {formSubtitle}
              </p>
            </div>

          {submitted ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                borderRadius: '20px',
                background: 'rgba(5, 150, 105, 0.1)',
                border: '1px solid rgba(5, 150, 105, 0.3)',
              }}
            >
              <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 16px auto' }} />
              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', marginBottom: '8px' }}>
                {isRw ? 'Ubusabe bwawe bwakiriwe neza!' : 'Agent Request Received!'}
              </h4>
              <p style={{ color: isDark ? '#cbd5e1' : '#334155', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
                {isRw
                  ? `Urakoze ${formState.fullName || 'musomyi'}. Umu-ajenti wacu aragufasha kuri telefone ${formState.phone} mu kanya gato.`
                  : `Thank you ${formState.fullName || 'valued candidate'}. An agent has logged your booking and will contact you via ${formState.phone} promptly.`}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSubmitted(false)}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                {isRw ? 'Ohereza ubundi busabe' : 'Submit Another Request'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Service Selection (Step 0) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '8px', color: isDark ? '#f1f5f9' : '#1e293b' }}>
                  {isRw ? 'Serivisi Wifuza' : 'Service Requested'} *
                </label>
                <select
                  value={formState.serviceType}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="input"
                  style={{ width: '100%', fontSize: '0.96rem', fontWeight: 600, padding: '11px 14px' }}
                >
                  {serviceOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progressive Completion Bar */}
              {orderedFieldKeys.length > 0 && (
                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(56, 189, 248, 0.06)' : 'rgba(2, 132, 199, 0.05)',
                    border: isDark ? '1px solid rgba(56, 189, 248, 0.18)' : '1px solid rgba(2, 132, 199, 0.15)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span style={{ color: isDark ? '#38bdf8' : '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} />
                      {isRw
                        ? `Intambwe ${Math.min(visibleStepCount, orderedFieldKeys.length)} kuri ${orderedFieldKeys.length}`
                        : `Step ${Math.min(visibleStepCount, orderedFieldKeys.length)} of ${orderedFieldKeys.length}`}
                    </span>
                    <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                      {Math.round((satisfiedCount / (orderedFieldKeys.length || 1)) * 100)}% {isRw ? 'byujujwe' : 'completed'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(satisfiedCount / (orderedFieldKeys.length || 1)) * 100}%`,
                        background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Progressive Fields Revealed in Order */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orderedFieldKeys.slice(0, visibleStepCount).map((fieldKey, idx) => {
                  const isSatisfied = isStepSatisfied(idx);
                  const isCurrentFrontier = idx === visibleStepCount - 1 && !isSatisfied;
                  const required = isFieldRequired(fieldKey);
                  const label = getFieldLabel(fieldKey);
                  const errorMsg = getFieldError(fieldKey);
                  const isDirty = !isFieldEmpty(fieldKey);
                  const hasError = isDirty && errorMsg !== '';

                  return (
                    <div
                      key={fieldKey}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '14px',
                        background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                        border: hasError
                          ? '1px solid #ef4444'
                          : (isCurrentFrontier
                            ? (isDark ? '1px solid #38bdf8' : '1px solid #0284c7')
                            : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0')),
                        boxShadow: hasError
                          ? '0 0 16px rgba(239, 68, 68, 0.2)'
                          : (isCurrentFrontier
                            ? (isDark ? '0 0 16px rgba(56, 189, 248, 0.12)' : '0 0 14px rgba(2, 132, 199, 0.08)')
                            : 'none'),
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: isSatisfied
                                ? '#059669'
                                : (hasError
                                  ? '#ef4444'
                                  : (isCurrentFrontier ? (isDark ? '#38bdf8' : '#0284c7') : (isDark ? '#334155' : '#cbd5e1'))),
                              color: '#ffffff',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {isSatisfied ? <Check size={13} /> : (hasError ? '!' : idx + 1)}
                          </span>
                          <label style={{ fontSize: '0.88rem', fontWeight: 700, color: hasError ? '#ef4444' : (isDark ? '#f1f5f9' : '#1e293b') }}>
                            {label} {required && '*'}
                          </label>
                        </div>

                        {/* Optional Skip button */}
                        {isCurrentFrontier && !required && (
                          <button
                            type="button"
                            onClick={() => setManuallyAdvancedSteps((prev) => ({ ...prev, [fieldKey]: true }))}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #cbd5e1',
                              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                              color: isDark ? '#94a3b8' : '#64748b',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <span>{isRw ? 'Komeza (Ntabwo ari itegeko)' : 'Skip (Optional)'}</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>

                      {/* Field Specific Inputs */}
                      {fieldKey === 'fullName' && (
                        <input
                          type="text"
                          required
                          placeholder="e.g. Eric Mugisha"
                          value={formState.fullName}
                          onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        />
                      )}

                      {fieldKey === 'phoneNumber' && (
                        <input
                          type="tel"
                          required
                          placeholder="0788 123 456"
                          value={formState.phone}
                          onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        />
                      )}

                      {fieldKey === 'nationalId' && (
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="1 1990 8 0000000 0 00"
                          value={formState.nationalId}
                          onChange={(e) => setFormState({ ...formState, nationalId: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        />
                      )}

                      {fieldKey === 'dateOfBirth' && (
                        <input
                          type="date"
                          value={formState.dateOfBirth}
                          onChange={(e) => setFormState({ ...formState, dateOfBirth: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        />
                      )}

                      {fieldKey === 'licenseCategory' && (
                        <select
                          value={formState.category}
                          onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        >
                          <option value="">{isRw ? '-- Hitamo Icyiciro (Ntabwo ari itegeko) --' : '-- Select License Category (Optional) --'}</option>
                          <option value="A">Category A (Moto / Motorcycle)</option>
                          <option value="B">Category B (Imodoka nto / Sedan & SUV)</option>
                          <option value="C">Category C (Ikamyo / Heavy Goods Vehicle)</option>
                          <option value="D">Category D (Bisi / Passenger Bus)</option>
                          <option value="E">Category E (Trailer / Remorque)</option>
                          <option value="F">Category F (Special Adapted)</option>
                        </select>
                      )}

                      {fieldKey === 'provisionalLicenseNumber' && (
                        <input
                          type="text"
                          placeholder="e.g. PRV-2024-001234"
                          value={formState.provisionalLicenseNumber}
                          onChange={(e) => setFormState({ ...formState, provisionalLicenseNumber: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        />
                      )}

                      {fieldKey === 'preferredDistrict' && (
                        <select
                          value={formState.preferredDistrict}
                          onChange={(e) => setFormState({ ...formState, preferredDistrict: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        >
                          <option value="">{isRw ? '-- Hitamo Akarere (Ntabwo ari itegeko) --' : '-- Select Preferred District (Optional) --'}</option>
                          {districtOptions.map((opt) => (
                            <option key={opt.key} value={opt.key}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {fieldKey === 'testingCenter' && (
                        <select
                          value={formState.testingCenter}
                          onChange={(e) => setFormState({ ...formState, testingCenter: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        >
                          <option value="">{isRw ? '-- Hitamo Ikigo (Ntabwo ari itegeko) --' : '-- Select Testing Center (Optional) --'}</option>
                          {testingCenterOptions.map((opt) => (
                            <option key={opt.key} value={opt.key}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {fieldKey === 'workingSite' && (
                        <select
                          value={formState.workingSite}
                          onChange={(e) => setFormState({ ...formState, workingSite: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        >
                          <option value="">{isRw ? '-- Hitamo Site (Ntabwo ari itegeko) --' : '-- Select Working Site (Optional) --'}</option>
                          {workingSiteOptions.map((opt) => (
                            <option key={opt.key} value={opt.key}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {fieldKey === 'teacher' && (
                        <select
                          value={formState.teacher}
                          onChange={(e) => setFormState({ ...formState, teacher: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        >
                          <option value="">{isRw ? '-- Hitamo Umwarimu (Ntabwo ari itegeko) --' : '-- Select Teacher (Optional) --'}</option>
                          {teacherOptions.map((opt) => (
                            <option key={opt.key} value={opt.key}>{opt.label}</option>
                          ))}
                        </select>
                      )}

                      {fieldKey === 'preferredDate' && (
                        <input
                          type="date"
                          required={!!formConfig.requirePreferredDate}
                          value={formState.preferredDate}
                          onChange={(e) => setFormState({ ...formState, preferredDate: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        />
                      )}

                      {fieldKey === 'notes' && (
                        <textarea
                          rows={3}
                          placeholder={
                            isRw
                              ? 'e.g. Nkeneye guhindura ikigo cy\'ikizamini cyangwa guhabwa itariki ya vuba...'
                              : 'e.g. I need exam slot booking assistance or to change my preferred testing center...'
                          }
                          value={formState.notes}
                          onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                          className="input"
                          style={{
                            width: '100%',
                            resize: 'vertical',
                            borderColor: hasError ? '#ef4444' : undefined,
                          }}
                        />
                      )}

                      {/* Error message if invalid */}
                      {hasError && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '7px',
                            fontSize: '0.78rem',
                            color: '#ef4444',
                            fontWeight: 600,
                          }}
                        >
                          <AlertCircle size={14} style={{ flexShrink: 0 }} />
                          <span>{errorMsg}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit button with disabled explanation */}
              <div style={{ marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={!isProcessCompleted}
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-xl)',
                    opacity: isProcessCompleted ? 1 : 0.45,
                    cursor: isProcessCompleted ? 'pointer' : 'not-allowed',
                    filter: isProcessCompleted ? 'none' : 'grayscale(40%)',
                    boxShadow: isProcessCompleted ? '0 4px 16px rgba(2, 132, 199, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Send size={18} />
                  <span>{submitBtnText}</span>
                </button>

                {!isProcessCompleted && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginTop: '8px',
                      fontSize: '0.8rem',
                      color: isDark ? '#94a3b8' : '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    <AlertCircle size={14} color="#f59e0b" />
                    <span>
                      {isRw
                        ? `Uzuza cyangwa ukomeze imyanya yose (${satisfiedCount}/${orderedFieldKeys.length}) kugira ngo wohereze fomu.`
                        : `Complete all steps (${satisfiedCount}/${orderedFieldKeys.length}) to enable submission.`}
                    </span>
                  </div>
                )}
              </div>
            </form>
          )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
