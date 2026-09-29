import type {
  SMSLogItem,
  SMSTemplateItem,
  GatewayStatusItem,
  PaginatedResult,
} from '../../core/services/AdminService';

export type NotificationsTab = 'LOGS' | 'SINGLE_SMS' | 'TEMPLATES' | 'GATEWAY';

export interface PresetSnippet {
  label: string;
  type: string;
  text: string;
}

export const PRESET_SNIPPETS: PresetSnippet[] = [
  {
    label: 'OTP Verification (Rwanda)',
    type: 'OTP',
    text: '[Sifo Drive] Kode yawe yo kwemeza ni: 482910. Imara iminota 10. Ntuyisangize undi muntu.',
  },
  {
    label: 'Live Class Reminder',
    type: 'LIVE_CLASS_REMINDER',
    text: '[Sifo Drive] Isomo ry amategeko y umuhanda ritangira mu minota 15! Kanda hano winjire: https://meet.google.com/abc-defg-hij',
  },
  {
    label: 'Irembo Booking Confirmed',
    type: 'BOOKING_CONFIRMED',
    text: '[Sifo Drive] Umwanya w ikizamini cyawe wemejwe! Itariki: 24/09/2026, Ikigo: Kigali Arena. Witwaze indangamuntu yawe.',
  },
  {
    label: 'Exam Result Notice',
    type: 'EXAM_RESULT',
    text: '[Sifo Drive] Amanota y ikizamini cyo kwimenyereza arabonetse: 18/20 (Watsinze). Reba raporo muri porogaramu.',
  },
];

export type {
  SMSLogItem,
  SMSTemplateItem,
  GatewayStatusItem,
  PaginatedResult,
};
