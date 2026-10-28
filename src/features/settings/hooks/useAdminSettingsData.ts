import { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import type {
  SettingsTab,
  SubscriptionPlan,
  PricingSettings,
  GuestTrialConfig,
  OperationalRules,
  NotificationSettings,
  AcademyProfile,
  PlatformFeatureFlag,
  PlatformEnvironmentConfig,
  PublicBackgroundConfig,
  PublicNavTabConfig,
  PublicAboutUsConfig,
  PublicContactConfig,
  PublicLegalConfig,
  PublicStatsConfig,
  PublicAgentServicesConfig,
  AgentServiceStep,
  AgentServicesBookingFormConfig,
  AgentServiceOption,
  BookingFormFieldVisibility,
  BookingFormFieldKey,
} from '../types';

export const DEFAULT_PUBLIC_BG_URL = '/default-public-bg.jpg';

export const DEFAULT_PUBLIC_BACKGROUND: PublicBackgroundConfig = {
  enabled: false,
  imageDataUrl: DEFAULT_PUBLIC_BG_URL,
  imageFileName: 'Highway Landscape (Default)',
  lightImageOpacity: 0.20,
  lightGradientOpacity: 0.85,
  darkImageOpacity: 0.15,
  darkGradientOpacity: 0.70,
};

export const DEFAULT_PUBLIC_ABOUT_US: PublicAboutUsConfig = {
  aboutUsTitle: 'About Us',
  aboutUsTitleRw: 'Ibyerekeye Sifo Drive',
  aboutUsSubtitle: 'Dedicated to modernizing driver education in Rwanda through accessible technology, rigorous traffic law training, and a deep commitment to national road safety.',
  aboutUsSubtitleRw: 'Twiyemeje kuvugurura uburezi bwo gutwara ibinyabiziga mu Rwanda binyuze mu ikoranabuhanga ryoroheye bose, inyigisho zizewe z\'amategeko y\'umuhanda, no kubungabunga umutekano wo mu muhanda.',
  whoWeAreTitle: 'Who We Are',
  whoWeAreTitleRw: 'Abo Turi Bo',
  whoWeAreDesc: 'Rwanda\'s premier digital driving academy ecosystem connecting learners, certified instructors, and driving schools. We bring official road safety curriculum, standardized traffic law preparation, and licensing support directly to your fingertips.',
  whoWeAreDescRw: 'Urubuga rw\'ikoranabuhanga mu Rwanda rwunganira abanyeshuri, abarimu babifitiye ububasha, n\'amashuri yo gutwara ibinyabiziga. Duhuza inyigisho zemewe z\'amategeko y\'umuhanda no kwitegura neza ibizamini bya Polisi.',
};

export const DEFAULT_PUBLIC_CONTACT: PublicContactConfig = {
  address: 'Kigali, Rwanda',
  addressRw: 'Kigali, u Rwanda',
  phone: '+250 788 123 456',
  email: 'support@sifodrive.rw',
  brandDescription: "Rwanda's leading digital driving academy. Preparing future drivers with high-standard theory, live tutoring, and seamless Irembo driving test booking concierge.",
  brandDescriptionRw: "Ishuri Rikuru ry'Ikoranabuhanga ryo Gutwara Ibinyabiziga mu Rwanda. Ritegura abanyeshuri kwiga amategeko y'umuhanda, amasomo y'imbonankubone, no kwiyandikisha ku kizamini kuri Irembo.",
};

export const DEFAULT_PUBLIC_STATS: PublicStatsConfig = {
  passRate: '98.4%',
  activeLearners: '15,000+',
  totalExams: '100+',
  serviceConcierge: '24/7',
};

export const DEFAULT_AGENT_SERVICE_STEPS: AgentServiceStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    title: 'Available Services',
    titleRw: 'Serivisi Ubona',
    description: 'Irembo practical & provisional exam bookings and slot tracking.',
    descriptionRw: "Kwandikisha ibizamini by'agateganyo na ngiro kuri Irembo.",
  },
  {
    id: 'step-2',
    stepNumber: 2,
    title: 'How to Book',
    titleRw: 'Uko Bisabwa',
    description: 'Fill your details below; an agent completes everything remotely.',
    descriptionRw: 'Uzuza fomu iri hasi, umu-ajenti ahita agukorera byose.',
  },
  {
    id: 'step-3',
    stepNumber: 3,
    title: 'Why Book',
    titleRw: 'Impamvu yo Gukoresha',
    description: 'Zero travel, immediate slot reservation, and instant SMS confirmation.',
    descriptionRw: 'Nta rugendo, kubona amatariki vuba, no kwakira SMS.',
  },
];

export const ALL_BOOKING_FIELD_KEYS: BookingFormFieldKey[] = [
  'fullName',
  'phoneNumber',
  'nationalId',
  'dateOfBirth',
  'licenseCategory',
  'provisionalLicenseNumber',
  'preferredDistrict',
  'testingCenter',
  'workingSite',
  'teacher',
  'preferredDate',
  'notes',
];

export const DEFAULT_SERVICE_FIELDS: Record<string, BookingFormFieldKey[]> = {
  irembo_provisional: [
    'fullName',
    'phoneNumber',
    'nationalId',
    'dateOfBirth',
    'preferredDistrict',
    'preferredDate',
    'notes',
  ],
  irembo_practical: [
    'fullName',
    'phoneNumber',
    'nationalId',
    'licenseCategory',
    'provisionalLicenseNumber',
    'preferredDistrict',
    'testingCenter',
    'workingSite',
    'teacher',
    'preferredDate',
    'notes',
  ],
  slot_reservation: [
    'fullName',
    'phoneNumber',
    'nationalId',
    'licenseCategory',
    'preferredDistrict',
    'testingCenter',
    'preferredDate',
    'notes',
  ],
  license_renewal: [
    'fullName',
    'phoneNumber',
    'nationalId',
    'licenseCategory',
    'notes',
  ],
};

export const DEFAULT_AGENT_SERVICE_OPTIONS: AgentServiceOption[] = [
  {
    id: 'opt-provisional',
    key: 'irembo_provisional',
    label: 'Irembo Provisional Exam Booking',
    labelRw: 'Kwandikisha Ikizamini cy\'Agateganyo',
    enabled: true,
    fields: DEFAULT_SERVICE_FIELDS.irembo_provisional,
  },
  {
    id: 'opt-practical',
    key: 'irembo_practical',
    label: 'Irembo Practical Exam Booking',
    labelRw: 'Kwandikisha Ikizamini Ngiro',
    enabled: true,
    fields: DEFAULT_SERVICE_FIELDS.irembo_practical,
  },
  {
    id: 'opt-slot',
    key: 'slot_reservation',
    label: 'Fast-Track Exam Slot Booking',
    labelRw: 'Gushaka Itariki Yihuse (Slot Tracking)',
    enabled: true,
    fields: DEFAULT_SERVICE_FIELDS.slot_reservation,
  },
  {
    id: 'opt-renewal',
    key: 'license_renewal',
    label: 'Driving License Renewal / Duplicate',
    labelRw: 'Kongera Igihe cy\'Uruhushya / Karita Nshya',
    enabled: true,
    fields: DEFAULT_SERVICE_FIELDS.license_renewal,
  },
];

export const DEFAULT_DISTRICT_OPTIONS: AgentServiceOption[] = [
  { id: 'dist-1', key: 'GASABO', label: 'Gasabo', labelRw: 'Gasabo', enabled: true },
  { id: 'dist-2', key: 'KICUKIRO', label: 'Kicukiro', labelRw: 'Kicukiro', enabled: true },
  { id: 'dist-3', key: 'NYARUGENGE', label: 'Nyarugenge', labelRw: 'Nyarugenge', enabled: true },
  { id: 'dist-4', key: 'MUSANZE', label: 'Musanze', labelRw: 'Musanze', enabled: true },
  { id: 'dist-5', key: 'HUYE', label: 'Huye', labelRw: 'Huye', enabled: true },
  { id: 'dist-6', key: 'RUBAVU', label: 'Rubavu', labelRw: 'Rubavu', enabled: true },
  { id: 'dist-7', key: 'RWAMAGANA', label: 'Rwamagana', labelRw: 'Rwamagana', enabled: true },
];

export const DEFAULT_TESTING_CENTER_OPTIONS: AgentServiceOption[] = [
  { id: 'tc-1', key: 'REMERA', label: 'Remera - Amahoro Police Test Center', labelRw: 'Remera - Amahoro Police Test Center', enabled: true },
  { id: 'tc-2', key: 'BUSANZA', label: 'Busanza Automated Test Center', labelRw: 'Busanza Automated Test Center', enabled: true },
  { id: 'tc-3', key: 'NYAMIRAMBO', label: 'Nyamirambo Testing Center', labelRw: 'Nyamirambo Testing Center', enabled: true },
  { id: 'tc-4', key: 'MUSANZE_TC', label: 'Musanze Regional Police Center', labelRw: 'Musanze Regional Police Center', enabled: true },
  { id: 'tc-5', key: 'HUYE_TC', label: 'Huye Driving Exam Center', labelRw: 'Huye Driving Exam Center', enabled: true },
];

export const DEFAULT_WORKING_SITE_OPTIONS: AgentServiceOption[] = [
  { id: 'ws-1', key: 'BUSANZA AUTOMATED CENTER', label: 'BUSANZA AUTOMATED CENTER', labelRw: 'BUSANZA AUTOMATED CENTER', enabled: true },
  { id: 'ws-2', key: 'BUSANZA SITE (KIC)', label: 'BUSANZA SITE (KIC)', labelRw: 'BUSANZA SITE (KIC)', enabled: true },
  { id: 'ws-3', key: 'REMERA POLICE GROUNDS', label: 'Remera Police Grounds', labelRw: 'Remera Police Grounds', enabled: true },
  { id: 'ws-4', key: 'NYAMIRAMBO REGIONAL SITE', label: 'Nyamirambo Regional Site', labelRw: 'Nyamirambo Regional Site', enabled: true },
];

export const DEFAULT_TEACHER_OPTIONS: AgentServiceOption[] = [
  { id: 't-1', key: 'Jean Damascene Habimana', label: 'Jean Damascene Habimana', labelRw: 'Jean Damascene Habimana', enabled: true },
  { id: 't-2', key: 'Emmanuel Mugisha', label: 'Emmanuel Mugisha', labelRw: 'Emmanuel Mugisha', enabled: true },
  { id: 't-3', key: 'Clarisse Mukamana', label: 'Clarisse Mukamana', labelRw: 'Clarisse Mukamana', enabled: true },
  { id: 't-4', key: 'Patrick Nshimiyimana', label: 'Patrick Nshimiyimana', labelRw: 'Patrick Nshimiyimana', enabled: true },
];

export const DEFAULT_BOOKING_FIELD_VISIBILITY: BookingFormFieldVisibility = {
  fullName: true,
  phoneNumber: true,
  nationalId: true,
  dateOfBirth: true,
  serviceType: true,
  licenseCategory: true,
  provisionalLicenseNumber: true,
  preferredDistrict: true,
  testingCenter: true,
  workingSite: true,
  teacher: true,
  preferredDate: true,
  notes: true,
};

export const DEFAULT_AGENT_SERVICES_BOOKING_FORM: AgentServicesBookingFormConfig = {
  isEnabled: true,
  formTitle: 'Book Agent Service',
  formTitleRw: 'Kora Gahunda ya Agent',
  formSubtitle: 'Fill in your details below. A Sifo Drive agent will process your request remotely.',
  formSubtitleRw: 'Uzuza iyi myirondoro, umu-ajenti wa Sifo Drive aragufasha mu kanya gato.',
  fieldVisibility: DEFAULT_BOOKING_FIELD_VISIBILITY,
  serviceOptions: DEFAULT_AGENT_SERVICE_OPTIONS,
  districtOptions: DEFAULT_DISTRICT_OPTIONS,
  testingCenterOptions: DEFAULT_TESTING_CENTER_OPTIONS,
  workingSiteOptions: DEFAULT_WORKING_SITE_OPTIONS,
  teacherOptions: DEFAULT_TEACHER_OPTIONS,
  allowProvisionalExam: true,
  allowPracticalExam: true,
  allowSlotReservation: true,
  allowLicenseRenewal: true,
  requirePreferredDate: false,
  requireTestingCenter: false,
  showNotesField: true,
  defaultLocation: 'Remera - Amahoro Police Test Center',
  submitButtonText: 'Submit Agent Service Request',
  submitButtonTextRw: 'Ohereza Ubusabe bwa Agent',
};

export const DEFAULT_PUBLIC_AGENT_SERVICES: PublicAgentServicesConfig = {
  enableBooking: true,
  autoAssignAgent: true,
  iremboSyncEnabled: true,
  hotlinePhone: '+250 788 123 456',
  hotlineWhatsapp: '+250 788 123 456',
  noticeEn: 'Our verified field agents assist candidates with Irembo test bookings, documentation, and queue management without physical travel.',
  noticeRw: 'Abakozi bacu babifitiye ububasha bafasha abakandida kwiyandikisha ku bizamini bya Irembo no gukemura ibibazo bitabaye ngombwa ko uhasanga umuntu imbonankubone.',
  howItWorksTitle: 'How It Works & Booking Steps',
  howItWorksTitleRw: 'Uko Bikora & Ibyiza',
  steps: DEFAULT_AGENT_SERVICE_STEPS,
  bookingForm: DEFAULT_AGENT_SERVICES_BOOKING_FORM,
};

export const DEFAULT_PUBLIC_LEGAL: PublicLegalConfig = {
  privacyPolicy: 'Privacy Policy',
  privacyPolicyRw: 'Politiki yo Kurinda Amakuru Bwite',
  termsAndConditions: 'Terms & Conditions',
  termsAndConditionsRw: 'Amabwiriza n\'Ibisabwa',
  cookies: 'Cookies',
  cookiesRw: 'Amakuru y\'Inyandiko (Cookies)',
  privacyPolicyContent: `1. Introduction & Overview
Sifo Drive is committed to protecting your personal data in full compliance with Rwandan Data Protection Laws (Law Nº 058/2021). This Privacy Policy explains how we collect, process, and safeguard your information when you access our driver education platform, mobile services, and examination practice systems.

2. Information We Collect
We collect personal identification data (including your national identification number, legal name, telephone number, and email address), driving license test booking references, learning progress records, quiz score history, and payment transaction metadata processed via licensed payment service providers in Rwanda (such as MTN MoMo, Airtel Money, or approved banking gateways).

3. How We Use Your Data
Your personal data is strictly utilized to:
- Deliver personalized driving education curricula, mock tests, and road safety modules.
- Facilitate official driving school scheduling and Irembo examination coordination.
- Maintain transparent academic logs and issue verified completion certificates.
- Prevent fraudulent activity, automated abuse, and maintain overall platform security.

4. Data Sharing & Third Parties
We do not sell, rent, or trade your personal information. Data may only be shared with authorized Rwandan regulatory authorities (such as Rwanda National Police and RTDA) when required for driving test validation, or with certified technological partners under strict confidentiality agreements.

5. Data Security & Storage
All student records and examination logs are encrypted in transit and at rest using modern encryption protocols. Access is restricted to authorized administrative personnel on a least-privilege basis.

6. Your Rights
Under Rwandan law, you have the right to request access to your personal records, rectify inaccuracies, request deletion subject to statutory retention obligations, and revoke consent at any time by contacting our privacy officer at support@sifodrive.rw.`,
  privacyPolicyContentRw: `1. Intangiriro
Sifo Drive yiyemeje gucunga no kurinda amakuru yawe bwite hakurikijwe amategeko y'u Rwanda agenga kurinda amakuru n'ubuzima bwite (Itegeko Nº 058/2021). Iyi politiki isobanura uburyo dukusanya, dukoresha, kandi turinda amakuru yawe iyo ukoresha imbuga n'amasomo yacu yo kwiga gutwara ibinyabiziga.

2. Amakuru Dukusanya
Dukusanya imyirondoro y'umunyeshuri (izina ryose, nimero y'indangamuntu, nomero ya telefoni, na imeli), amakuru ajyanye no kwiyandikisha ku bizamini, imitsindire y'ibizamini by'igerageza, hamwe n'amakuru y'ubwishyu anyura ku buryo bwemewe mu Rwanda (MTN MoMo, Airtel Money, cyangwa amabanki).

3. Uburyo Dukoreshamo Amakuru
Amakuru yawe akoreshwa gusa mu:
- Gushyikiriza abanyeshuri amasomo y'amategeko y'umuhanda n'ibizamini by'imyitozo.
- Korohereza iyandikishwa ku bizamini by'uruhushya rwo gutwara ibinyabiziga binyuze kuri Irembo na Polisi y'u Rwanda.
- Kubika no kumenyekanisha intambwe umunyeshuri agezeho n'impamyabumenyi z'amasomo.
- Gukumira uburiganya no gucunga umutekano w'urubuga.

4. Isaranganya ry'Amakuru
Ntiducuruza cyangwa ngo dusangize abandi amakuru yawe bwite ku mpamvu z'ubucuruzi. Amakuru ashobora gusangizwa inzego za Leta zibifitiye ububasha (nk'Ishami rya Polisi y'u Rwanda rishinzwe Umutekano wo mu Muhanda cyangwa RTDA) gusa iyo bikenewe mu kwemeza ibizamini by'uruhushya rwo gutwara ibinyabiziga.

5. Umutekano w'Amakuru
Amakuru yose acungirwa umutekano ukomeye hakoreshejwe tekinoloji zigezweho zo gukingira amakuru (encryption). Abakozi babifitiye uburenganzira gusa nibo bemerewe kuyageraho.

6. Uburenganzira Bwawe
Ufite uburenganzira bwo gusaba kureba amakuru yawe, kuyakosora, cyangwa gusaba ko akurwaho hakurikijwe amategeko y'u Rwanda, unyuze kuri imeli support@sifodrive.rw.`,
  termsAndConditionsContent: `1. Acceptance of Terms
By creating an account, accessing learning modules, or taking mock driving tests on Sifo Drive, you agree to be bound by these Terms & Conditions. If you do not accept these terms in full, you must discontinue using our services immediately.

2. Eligibility & Account Security
Users must provide accurate, current, and complete identification details during registration. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your registered account. Sharing accounts or test access credentials is strictly prohibited.

3. Educational Content & Intellectual Property
All pedagogical materials, including traffic code explanations, illustrated road signs, animated scenario questions, and audio explanations, are the exclusive intellectual property of Sifo Drive Ltd. You may not reproduce, redistribute, record, or scrape content without prior written authorization.

4. Mock Exams & Official License Testing
Sifo Drive provides high-fidelity training simulations designed to reflect the standards of Rwanda National Police (RNP) and RTDA examinations. While our platform is engineered to maximize pass rates, official driving licenses and test verdicts are issued exclusively by national authorities.

5. Subscriptions, Payments & Refunds
Access fees for practice exams, premium courses, or private tutoring concierge services must be settled in Rwandan Francs (RWF) via supported mobile money or banking channels. Fees for activated digital services are non-refundable once content has been accessed, except where mandated by applicable consumer protection laws.

6. User Conduct & Code of Ethics
Users must not attempt to circumvent platform security, employ automated bots, reverse engineer assessment algorithms, or post defamatory content within community discussion forums. Violations will result in immediate account termination.

7. Governing Law & Dispute Resolution
These Terms & Conditions are governed by and construed in accordance with the laws of the Republic of Rwanda. Any dispute arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts of Kigali, Rwanda.`,
  termsAndConditionsContentRw: `1. Kwemera Amabwiriza
Mu gihe ufunguye konti, winjiye mu masomo, cyangwa witoza ibizamini by'amategeko y'umuhanda kuri Sifo Drive, uba wemeye kubahiriza aya mabwiriza n'ibisabwa. Niba utemera aya mabwiriza yose, urasabwa guhagarika gukoresha iyi serivisi ako kanya.

2. Uburenganzira bwo Gukoresha Konti
Buri mukoresha asabwa gutanga imyirondoro yukuri igihe yiyandikisha. Ni inshingano zawe gucunga umutekano w'ijambobanga ryawe. Birabujijwe gusangiza abandi konti yawe cyangwa kugurisha uburenganzira bwo gukora ibizamini.

3. Umutungo mu By'ubwenge
Amasomo yose, ibimenyetso by'umuhanda bibarizwaho, amashusho yigisha, n'ibibazo by'ibizamini byateguwe na Sifo Drive ni umutungo witegeko w'urubuga. Ntibyemewe kubikoporora, kubikwirakwiza, cyangwa kubikoresha mu zindi nyungu z'ubucuruzi utabiherewe uburenganzira mu nyandiko.

4. Imyitozo y'Ibizamini n'Ibyangombwa bya Leta
Sifo Drive itanga ubumenyi n'imyitozo byo ku rwego rwo hejuru bifasha gutsinda ibizamini bya Polisi y'u Rwanda (RNP) na RTDA. Icyakora, inzego za Leta zibifitiye ububasha nizo zonyine zitanga uruhushya rwo gutwara ibinyabiziga.

5. Amafaranga y'Amasomo no Kwishyura
Ubwishyu bwose bw'amasomo, ibizamini byo kwitoza, cyangwa serivisi zihariye bukorwa mu mafaranga y'u Rwanda (RWF) binyuze kuri MTN MoMo, Airtel Money, cyangwa amakarita ya banki. Amafaranga yishyuwe kuri serivisi zamaze gutangira ntasubizwa, uretse aho amategeko abiteganya.

6. Imyitwarire Myiza n'Ibisabwa
Birabujijwe gushaka gucengera umutekano w'urubuga, gukoresha porogaramu zitemewe (bots), cyangwa gukwirakwiza ubutumwa butajyanye n'amasomo. Uwishe aya mabwiriza ahagarikirwa konti ako kanya.

7. Amategeko Agenga Amasezerano
Aya mabwiriza agengwa kandi agasobanurwa hakurikijwe amategeko ya Repubulika y'u Rwanda. Amakimbirane yose yaturuka kuri aya masezerano azakemurirwa mu nkiko zibifitiye ububasha mu mujyi wa Kigali, u Rwanda.`,
};

export const DEFAULT_PUBLIC_NAV_TABS: PublicNavTabConfig[] = [
  {
    id: 'home',
    label: 'Home',
    labelKinyarwanda: 'Ahabanza',
    path: '/',
    isEnabled: true,
    order: 1,
    description: 'Main public landing portal',
  },
  {
    id: 'service_concierge',
    label: 'Agent Services',
    labelKinyarwanda: 'Serivisi za agent',
    path: '/services',
    isEnabled: true,
    order: 2,
    description: 'VIP test car rental, private tutoring & Irembo registration',
  },
  {
    id: 'school_program',
    label: 'School Program',
    labelKinyarwanda: 'Gahunda y\'Ishuri',
    path: '/school-program',
    isEnabled: true,
    order: 3,
    description: 'Auto-school partnerships, youth driving literacy & fleet training',
  },
  {
    id: 'newsroom',
    label: 'Newsroom',
    labelKinyarwanda: 'Amakuru & Amatangazo',
    path: '/newsroom',
    isEnabled: true,
    order: 4,
    description: 'Rwanda traffic updates, road safety campaigns & police news',
  },
  {
    id: 'partner',
    label: 'Partner with us',
    labelKinyarwanda: 'Fatanya Natwe',
    path: '/partner',
    isEnabled: true,
    order: 5,
    description: 'Driving schools, certified instructors & corporate fleet partners',
  },
  {
    id: 'contact',
    label: 'Contact',
    labelKinyarwanda: 'Twandikire',
    path: '/contact',
    isEnabled: true,
    order: 6,
    description: 'Kigali headquarters, direct phone hotline & live inquiry',
  },
];

export const DEFAULT_PLATFORM_CONFIG: PlatformEnvironmentConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'Sifo Drive is currently performing scheduled system upgrades. Regular services will resume shortly.',
  maintenanceMessageKinyarwanda: 'Sifo Drive iri gukora ivugurura rya sisitemu ryo kwagura serivisi. Serivisi zisanzwe zirasubukurwa mu mwanya muto.',
  readOnlyMode: false,
  sandboxSimulation: false,
  debugTelemetry: true,
  strictDeviceLockdown: true,
  aiProctoringStrictness: 'MODERATE',
  rateLimitingTier: 'STANDARD',
  betaTestingCohortPercentage: 25,

  // Public Sub-section Settings
  allowPublicGuestCheckout: true,
  publicCatalogVisible: true,
  publicSelfRegistration: true,
  publicSignsFreeAccess: true,
  guestTrialExamCount: 2,
  captchaOnGuestCheckout: false,
  publicBackground: DEFAULT_PUBLIC_BACKGROUND,
  publicNavTabs: DEFAULT_PUBLIC_NAV_TABS,
  publicAboutUs: DEFAULT_PUBLIC_ABOUT_US,
  publicContact: DEFAULT_PUBLIC_CONTACT,
  publicLegal: DEFAULT_PUBLIC_LEGAL,
  publicStats: DEFAULT_PUBLIC_STATS,
  publicAgentServices: DEFAULT_PUBLIC_AGENT_SERVICES,

  // Student Sub-section Settings
  studentAudioNarration: true,
  studentInstantFeedback: false,
  studentOfflinePwaMode: true,
  studentRetakeCooldownMinutes: 15,
  studentPassingScorePercent: 80,

  // Tutor Sub-section Settings
  tutorLiveClassWebRtc: true,
  tutorQrAttendanceScan: true,
  tutorGpsRouteTracking: true,
  tutorDirectMessaging: true,
  tutorAutoDispatch: true,

  // Admin Sub-section Settings
  adminTwoFactorRequired: false,
  adminAuditLogRetentionDays: 90,
  adminConcurrentSessionLimit: 2,

  // General Sub-section Settings
  defaultLanguage: 'rw',
  smsGatewayEnabled: true,
};

export const DEFAULT_FEATURE_FLAGS: PlatformFeatureFlag[] = [
  {
    id: 'exam_fullscreen_lockdown',
    name: 'Fullscreen & Anti-Cheating Exam Lockdown',
    nameKinyarwanda: 'Gufunga ikizamini muri Ecran Yuzuye no kubuza gushukana',
    category: 'examinations',
    scope: 'student',
    description: 'Enforces fullscreen browser mode during practice and official exams. Automatically flags and limits tab switches.',
    descriptionKinyarwanda: 'Gutegeka gukorera ikizamini muri ecran yuzuye no kubuza gufungura andi mafishi mu gihe cyo gukora ikizamini.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'LOW',
    version: 'v2.4.0',
    lastToggledAt: '2026-10-23T08:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'ai_automated_proctoring',
    name: 'AI Automated Proctoring & Face Liveness',
    nameKinyarwanda: 'Ikoranabuhanga rya AI rigenzura isura n’umwirondoro w’ukora ikizamini',
    category: 'examinations',
    scope: 'student',
    description: 'Runs real-time webcam face tracking and periodic snapshot telemetry to guarantee the identity of the examination candidate.',
    descriptionKinyarwanda: 'Kugenzura isura y’umukandida mu gihe akora ikizamini hifashishijwe kamera ya mudasobwa.',
    isEnabled: true,
    status: 'BETA',
    targetAudience: 'ALL',
    riskLevel: 'MEDIUM',
    version: 'v2.6.0-beta',
    lastToggledAt: '2026-10-23T08:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'exam_audio_readout',
    name: 'Multilingual Audio Question Readout (Accessibility)',
    nameKinyarwanda: 'Gusoma ibibazo mu majwi mu Kinyarwanda no mu Gifaransa',
    category: 'examinations',
    scope: 'student',
    description: 'Provides native voice narration of questions and answers in Kinyarwanda and French for non-literate candidates.',
    descriptionKinyarwanda: 'Gutega amatwi ibibazo n’ibisubizo bisomwa mu majwi meza ku batabasha gusoma neza.',
    isEnabled: true,
    status: 'BETA',
    targetAudience: 'BETA_TESTERS',
    riskLevel: 'LOW',
    version: 'v2.5.2',
    lastToggledAt: '2026-10-22T19:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'exam_adaptive_irt',
    name: 'Adaptive Exam Question Difficulty (IRT Scoring Engine)',
    nameKinyarwanda: 'Kugena ubukana bw’ibibazo hagendewe ku bushobozi bw’umunyeshuri (IRT)',
    category: 'experimental',
    scope: 'student',
    description: 'Dynamically selects next questions based on candidate response patterns using Item Response Theory psychometrics.',
    descriptionKinyarwanda: 'Guhindura urwego rw’ibibazo bikurikira hagendewe ku buryo umukandida asubiza ibibazo bibanza.',
    isEnabled: false,
    status: 'ALPHA',
    targetAudience: 'STAFF_ONLY',
    riskLevel: 'HIGH',
    version: 'v3.0.0-alpha',
    lastToggledAt: '2026-10-20T12:00:00Z',
    toggledBy: 'Lead Architect',
  },
  {
    id: 'momo_automated_webhooks',
    name: 'Instant MTN MoMo & Airtel Money Webhooks',
    nameKinyarwanda: 'Kwakira no kwemeza ubwishyu bwa MoMo ako kanya',
    category: 'payments',
    scope: 'public',
    description: 'Instant auto-credit reconciliation when candidates pay for exam packages via Mobile Money USSD push.',
    descriptionKinyarwanda: 'Kongera ibizamini ako kanya mu gihe umunyeshuri amaze kwishyura akoresheje MTN MoMo cyangwa Airtel.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'LOW',
    version: 'v2.1.0',
    lastToggledAt: '2026-10-21T10:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'guest_one_click_checkout',
    name: 'Guest Pay-As-You-Go Public Checkout',
    nameKinyarwanda: 'Kugura ibizamini byihuse ku bashyitsi badafite konti',
    category: 'payments',
    scope: 'public',
    description: 'Allows unregistered candidates to purchase practice exam bundles with just their Rwandan phone number.',
    descriptionKinyarwanda: 'Kwemerera abantu bose kugura no gukora ibizamini batiriwe bafungura konti yuzuye.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'LOW',
    version: 'v2.2.0',
    lastToggledAt: '2026-10-22T14:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'webrtc_virtual_classroom',
    name: 'Live Interactive Virtual Classrooms (WebRTC)',
    nameKinyarwanda: 'Ibyumba by’amashuri imbona-nkubone ku murongo (WebRTC)',
    category: 'lms',
    scope: 'tutors',
    description: 'Interactive high-definition live video lectures, whiteboard sharing, and attendance tracking for driving theory classes.',
    descriptionKinyarwanda: 'Gukurikira amasomo y’amategeko y’umuhanda muri videwo imbona-nkubone n’abigisha.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'MEDIUM',
    version: 'v2.3.1',
    lastToggledAt: '2026-10-21T16:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'ai_traffic_sign_vision',
    name: 'AI Traffic Sign Camera Scanner (Vision Model)',
    nameKinyarwanda: 'Gufata ifoto y’icyapa cyo ku muhanda AI ikagisobanura',
    category: 'experimental',
    scope: 'student',
    description: 'Pre-release feature enabling students to photograph any road sign with their phone camera for instant AI explanation and quiz questions.',
    descriptionKinyarwanda: 'Gufotora icyapa cyo ku muhanda telefone igahita isobanura icyo gisobanura n’amategeko akigenga.',
    isEnabled: true,
    status: 'BETA',
    targetAudience: 'BETA_TESTERS',
    riskLevel: 'LOW',
    version: 'v2.7.0-beta',
    lastToggledAt: '2026-10-23T06:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'biometric_nida_verification',
    name: 'Rwanda National ID (NIDA) Digital Verification',
    nameKinyarwanda: 'Guhuza n’ikigo cy’indangamuntu NIDA mu kwemeza umwirondoro',
    category: 'security',
    scope: 'admins',
    description: 'Validates candidate national ID numbers against official identity records before issuing completion certificates.',
    descriptionKinyarwanda: 'Kugenzura nimero y’indangamuntu mbere yo gutanga icyemezo cyo gusoza amasomo.',
    isEnabled: false,
    status: 'ALPHA',
    targetAudience: 'STAFF_ONLY',
    riskLevel: 'HIGH',
    version: 'v1.0.0-rc1',
    lastToggledAt: '2026-10-18T09:00:00Z',
    toggledBy: 'Security Lead',
  },
  {
    id: 'anti_ddos_rate_limiting',
    name: 'Dynamic IP & Phone Rate Limiter Shield',
    nameKinyarwanda: 'Kwirinda ibitero no guhagarika ubutumwa bwinshi budasanzwe',
    category: 'security',
    scope: 'public',
    description: 'Protects MoMo payment requests and SMS OTP endpoints against spamming and brute-force abuse.',
    descriptionKinyarwanda: 'Gukumira abashobora kohereza ubutumwa bwinshi kuri seriveri mu buryo butemewe.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'LOW',
    version: 'v2.4.2',
    lastToggledAt: '2026-10-22T08:00:00Z',
    toggledBy: 'System Administrator',
  },
  {
    id: 'fleet_gps_telemetry',
    name: 'Live Training Fleet GPS & OBD-II Telematics',
    nameKinyarwanda: 'Gukurikirana imodoka z’ishuri ziri mu muhanda kuri GPS',
    category: 'core',
    scope: 'tutors',
    description: 'Real-time vehicle location and speed monitoring during practical in-car driving lessons in Kigali.',
    descriptionKinyarwanda: 'Kureba aho imodoka z’ishuri ziherereye mu gihe abanyeshuri bari kwiga gutwara.',
    isEnabled: true,
    status: 'STABLE',
    targetAudience: 'ALL',
    riskLevel: 'LOW',
    version: 'v1.8.0',
    lastToggledAt: '2026-10-19T11:00:00Z',
    toggledBy: 'Operations Lead',
  },
  {
    id: 'crypto_usdt_checkout',
    name: 'Web3 USDT Micro-Payments for Regional Candidates',
    nameKinyarwanda: 'Kwishyura ukoresheje amadolari ya Crypto (USDT)',
    category: 'experimental',
    scope: 'admins',
    description: 'Pre-release checkout adapter allowing regional candidates outside Rwanda to pay with stablecoins.',
    descriptionKinyarwanda: 'Kwemerera abantu baturutse mu bindi bihugu kwishyura ibizamini bakoresheje Crypto.',
    isEnabled: false,
    status: 'EXPERIMENTAL',
    targetAudience: 'DISABLED',
    riskLevel: 'HIGH',
    version: 'v0.9.0-dev',
    lastToggledAt: '2026-10-15T15:00:00Z',
    toggledBy: 'Fintech Specialist',
  },
];

export const useAdminSettingsData = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('platform');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 0. Platform Settings & Feature Flags (with localStorage hydration fallback)
  const [platformConfig, setPlatformConfig] = useState<PlatformEnvironmentConfig>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_platform_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        const navTabs = parsed.publicNavTabs && Array.isArray(parsed.publicNavTabs)
          ? DEFAULT_PUBLIC_NAV_TABS.map((def) => {
              const existing = parsed.publicNavTabs.find((t: any) => t.id === def.id);
              return existing ? { ...def, ...existing } : def;
            })
          : DEFAULT_PUBLIC_NAV_TABS;

        return {
          ...DEFAULT_PLATFORM_CONFIG,
          ...parsed,
          publicNavTabs: navTabs,
          publicBackground: {
            ...DEFAULT_PUBLIC_BACKGROUND,
            ...(parsed.publicBackground || {}),
            imageDataUrl: (parsed.publicBackground?.imageDataUrl && parsed.publicBackground.imageDataUrl.trim() !== '')
              ? parsed.publicBackground.imageDataUrl
              : DEFAULT_PUBLIC_BG_URL,
            imageFileName: parsed.publicBackground?.imageFileName || 'Highway Landscape (Default)',
          },
          publicAboutUs: {
            ...DEFAULT_PUBLIC_ABOUT_US,
            ...(parsed.publicAboutUs || {}),
          },
          publicContact: {
            ...DEFAULT_PUBLIC_CONTACT,
            ...(parsed.publicContact || {}),
          },
          publicLegal: {
            ...DEFAULT_PUBLIC_LEGAL,
            ...(parsed.publicLegal || {}),
          },
        };
      }
    } catch {}
    return DEFAULT_PLATFORM_CONFIG;
  });

  const [featureFlags, setFeatureFlags] = useState<PlatformFeatureFlag[]>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_feature_flags');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_FEATURE_FLAGS;
  });

  // Fetch shared platform configuration from server on mount so changes are unified
  useEffect(() => {
    const syncFromServer = async () => {
      try {
        const res = await fetch(`/platform-settings-sync?t=${Date.now()}`);
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && typeof serverData === 'object') {
            setPlatformConfig((prev) => {
              // If local has custom uploaded image that server doesn't have yet, push to server
              if (prev.publicBackground?.imageDataUrl && prev.publicBackground.imageDataUrl.startsWith('data:')) {
                fetch('/platform-settings-sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(prev),
                }).catch(() => {});
                return prev;
              }

              const resolvedNavTabs = Array.isArray(serverData.publicNavTabs) && serverData.publicNavTabs.length > 0
                ? serverData.publicNavTabs
                : (prev.publicNavTabs || DEFAULT_PUBLIC_NAV_TABS);

              return {
                ...prev,
                ...serverData,
                publicNavTabs: resolvedNavTabs,
                publicBackground: {
                  ...DEFAULT_PUBLIC_BACKGROUND,
                  ...(serverData.publicBackground || {}),
                },
                publicAboutUs: {
                  ...DEFAULT_PUBLIC_ABOUT_US,
                  ...(serverData.publicAboutUs || {}),
                },
                publicContact: {
                  ...DEFAULT_PUBLIC_CONTACT,
                  ...(serverData.publicContact || {}),
                },
                publicLegal: {
                  ...DEFAULT_PUBLIC_LEGAL,
                  ...(serverData.publicLegal || {}),
                },
              };
            });
          }
        }
      } catch {}
    };
    syncFromServer();
  }, []);

  // Auto-save & real-time broadcast platform configuration changes
  useEffect(() => {
    try {
      localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(platformConfig));
      window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: platformConfig }));
      fetch('/platform-settings-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platformConfig),
      }).catch(() => {});
    } catch (e) {
      console.warn('Failed to auto-save platformConfig', e);
    }
  }, [platformConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('sifo_admin_settings_feature_flags', JSON.stringify(featureFlags));
      window.dispatchEvent(new CustomEvent('sifo_feature_flags_updated', { detail: featureFlags }));
    } catch (e) {
      console.warn('Failed to auto-save featureFlags', e);
    }
  }, [featureFlags]);

  const handleResetPlatformDefaults = () => {
    setPlatformConfig(DEFAULT_PLATFORM_CONFIG);
    setFeatureFlags(DEFAULT_FEATURE_FLAGS);
    localStorage.removeItem('sifo_admin_settings_platform_config');
    localStorage.removeItem('sifo_admin_settings_feature_flags');
    window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: DEFAULT_PLATFORM_CONFIG }));
    showToast('Platform settings reset to default state', 'info');
  };

  // 1. Pricing & Fee Schedule (with localStorage hydration fallback)
  const [pricing, setPricing] = useState<PricingSettings>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_pricing');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      fullTuitionCourse: 120000,
      theoryOnlyCourse: 45000,
      practicalLessonPerHour: 12000,
      examCarRental: 25000,
      policeMockExamSitting: 2000,
      certificateVerificationFee: 10000,
      expressCertProcessing: 5000,
      corporatePerDriver: 250000,
      fleetDefensiveWorkshop: 650000,
      commercialHeavyVehicleCourse: 180000,
      weekendHolidaySurcharge: 3000,
      lateCancellationPenalty: 5000,
    };
  });

  // Guest & Free Trial Settings with Automatic Bundle Discounts
  const [guestTrialConfig, setGuestTrialConfig] = useState<GuestTrialConfig>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_guest_trials');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      freeTrialExamsOnSignup: 1,
      singleExamPrice: 500,
      tier1Threshold: 5,
      tier1DiscountPercent: 5,
      tier2Threshold: 10,
      tier2DiscountPercent: 10,
      allowGuestPayAsYouGo: true,
      creditsNeverExpire: true,
    };
  });

  // Interactive bundle stepper state
  const [bundleCount, setBundleCount] = useState<number>(6);

  // Dynamic automatic calculation for Single & Multi-Exam bundles
  const calculateBundlePrice = (count: number, unitPrice: number = guestTrialConfig.singleExamPrice) => {
    const safeCount = Math.max(1, count);
    const rawTotal = safeCount * unitPrice;
    let discountPercent = 0;
    if (safeCount > guestTrialConfig.tier2Threshold) {
      discountPercent = guestTrialConfig.tier2DiscountPercent;
    } else if (safeCount > guestTrialConfig.tier1Threshold) {
      discountPercent = guestTrialConfig.tier1DiscountPercent;
    }
    const discountAmount = Math.round((rawTotal * discountPercent) / 100);
    const finalTotal = rawTotal - discountAmount;
    const unitEffective = Math.round(finalTotal / safeCount);
    return { count: safeCount, rawTotal, discountPercent, discountAmount, finalTotal, unitEffective };
  };

  // 2. Subscription Plans
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_plans');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'plan_single_exam',
        name: 'Single & Multi-Exam Pass',
        category: 'Guest / Pay-As-You-Go',
        price: 500,
        interval: 'Per Exam Sitting',
        badge: '1 Free Trial Included',
        features: [
          '1 Free Trial Exam automatically granted upon registration',
          'Flexible bundle: use + and - to select any number of exams',
          'Buy > 5 exams: 5% automatic volume discount applied',
          'Buy > 10 exams: 10% automatic volume discount applied',
          'Official 20-question Rwanda Police timed simulation',
          'Exam credits never expire — practice at your own pace',
        ],
        isActive: true,
      },
      {
        id: 'plan_express_24h',
        name: '24-Hour Express Pass',
        category: 'Practice Quiz Bank',
        price: 1000,
        interval: '24 Hours',
        badge: 'Quick Prep',
        features: [
          'Unlimited access to all 400+ Kinyarwanda questions',
          'Official Police mock test simulation timer',
          'Instant answers with official law explanations',
          'Mobile-friendly practice anywhere',
        ],
        isActive: true,
      },
      {
        id: 'plan_weekly_pass',
        name: 'Weekly Student Pass',
        category: 'Practice & Flashcards',
        price: 4000,
        interval: '7 Days',
        badge: 'Popular',
        features: [
          'Full question bank with road sign recognition',
          'Category-by-category weak spots breakdown',
          'Pass readiness predictor score',
          'Priority mobile support in Kinyarwanda',
        ],
        isActive: true,
      },
      {
        id: 'plan_monthly_mastery',
        name: 'Full Course Theory Pass',
        category: 'Curriculum & Live Replays',
        price: 15000,
        interval: '30 Days',
        badge: 'Best Value',
        features: [
          'Complete multimedia video lesson catalog',
          'Live virtual theory classroom replays',
          'Unlimited practice exam sittings',
          'Official certificate eligibility upon completion',
        ],
        isActive: true,
      },
      {
        id: 'plan_enterprise_fleet',
        name: 'Corporate Fleet Safety Tier',
        category: 'Enterprise Training',
        price: 85000,
        interval: 'Per Month / 10 Drivers',
        badge: 'Enterprise',
        features: [
          'Admin dashboard for fleet training management',
          'Defensive driving & safety audit modules',
          'Driver pass certification tracking',
          'Quarterly compliance reports for RDB/Police',
        ],
        isActive: true,
      },
    ];
  });

  // 3. School Booking & Operational Rules
  const [rules, setRules] = useState<OperationalRules>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_rules');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      maxLessonsPerWeek: 3,
      minAdvanceBookingHours: 12,
      cancellationCutoffHours: 6,
      maxConcurrentBookings: 2,
      lessonDurationMinutes: 60,
      openingTime: '07:30',
      closingTime: '18:30',
      maxInstructorHoursPerDay: 7,
      allowTransmissionChoice: true,
      openOnSaturdays: true,
      openOnSundays: false,
    };
  });

  // 4. Notifications & SMS Alerts
  const [notifications, setNotifications] = useState<NotificationSettings>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_notifs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      smsLessonReminderHoursBefore: 2,
      sendPaymentReceiptSms: true,
      sendExamScheduleSms: true,
      sendCertificateReadySms: true,
      dailyInstructorScheduleSms: true,
      alertAdminLowAttendance: true,
      lowAttendanceThreshold: 60,
    };
  });

  // 5. Academy Profile
  const [academy, setAcademy] = useState<AcademyProfile>(() => {
    try {
      const stored = localStorage.getItem('sifo_admin_settings_academy');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      name: 'Sifo Drive Academy Rwanda',
      licenseNumber: 'RDB-DRV-2023-8842',
      supportPhone: '+250 788 123 456',
      whatsappPhone: '+250 788 123 456',
      email: 'info@sifodrive.rw',
      mainBranch: 'Kigali, Nyarugenge (Camp Kigali Practical Yard)',
      secondBranch: 'Kicukiro, Sonatubes Theory Classroom',
      workingDaysLabel: 'Monday to Saturday, 07:30 - 18:30 CAT',
    };
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem('sifo_admin_settings_platform_config', JSON.stringify(platformConfig));
        localStorage.setItem('sifo_admin_settings_feature_flags', JSON.stringify(featureFlags));
        localStorage.setItem('sifo_admin_settings_pricing', JSON.stringify(pricing));
        localStorage.setItem('sifo_admin_settings_guest_trials', JSON.stringify(guestTrialConfig));
        localStorage.setItem('sifo_admin_settings_plans', JSON.stringify(plans));
        localStorage.setItem('sifo_admin_settings_rules', JSON.stringify(rules));
        localStorage.setItem('sifo_admin_settings_notifs', JSON.stringify(notifications));
        localStorage.setItem('sifo_admin_settings_academy', JSON.stringify(academy));
        window.dispatchEvent(new CustomEvent('sifo_platform_config_updated', { detail: platformConfig }));
        window.dispatchEvent(new CustomEvent('sifo_feature_flags_updated', { detail: featureFlags }));
        fetch('/platform-settings-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(platformConfig),
        }).catch(() => {});
        showToast('Changes saved successfully', 'success');
      } catch (err) {
        console.error('Error saving settings to storage:', err);
        showToast('Storage limit reached. Please use a smaller image file.', 'error');
      } finally {
        setIsSaving(false);
      }
    }, 150);
  };

  const handlePlanPriceChange = (id: string, newPrice: number) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
    );
  };

  const handleTogglePlan = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const formatRwf = (val: number) => {
    return new Intl.NumberFormat('en-RW').format(val) + ' RWF';
  };

  return {
    activeTab,
    setActiveTab,
    isSaving,
    platformConfig,
    setPlatformConfig,
    featureFlags,
    setFeatureFlags,
    handleResetPlatformDefaults,
    pricing,
    setPricing,
    guestTrialConfig,
    setGuestTrialConfig,
    bundleCount,
    setBundleCount,
    calculateBundlePrice,
    plans,
    setPlans,
    rules,
    setRules,
    notifications,
    setNotifications,
    academy,
    setAcademy,
    handleSave,
    handlePlanPriceChange,
    handleTogglePlan,
    formatRwf,
  };
};
