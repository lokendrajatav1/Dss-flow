/**
 * Telephony & Web Phone Helper Utility
 * Configuration, sanitization, and preferences for in-app calling.
 */

export interface TelephonySettings {
  preferredProtocol?: 'in-app' | 'tel' | 'sip';
  sipServer?: string;
  sipPort?: string;
  sipDomain?: string;
  sipExtension?: string;
  sipPassword?: string;
  callerId?: string;
  autoRecordNotes: boolean;
}

const TELEPHONY_SETTINGS_KEY = 'crm_telephony_settings';

export const DEFAULT_TELEPHONY_SETTINGS: TelephonySettings = {
  preferredProtocol: 'in-app',
  sipServer: 'sip.tatateleservices.com',
  sipPort: '5060',
  sipDomain: 'tatateleservices.com',
  sipExtension: '101',
  sipPassword: '',
  callerId: '011-4500-1234',
  autoRecordNotes: true,
};

export function getTelephonySettings(): TelephonySettings {
  try {
    const saved = localStorage.getItem(TELEPHONY_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_TELEPHONY_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse telephony settings', e);
  }
  return DEFAULT_TELEPHONY_SETTINGS;
}

export function saveTelephonySettings(settings: Partial<TelephonySettings>): TelephonySettings {
  const current = getTelephonySettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(TELEPHONY_SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Sanitizes phone number by removing spaces, brackets, hyphens.
 * Preserves a leading + if present.
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
}

/**
 * Legacy dialer helper kept for backward compatibility.
 */
export function dialWithMicroSip(phoneNumber: string): string {
  return sanitizePhoneNumber(phoneNumber);
}
