import { normalizePhone } from '@/lib/user-profile';
import { getOtpExpiresMinutes, getOtpResendCooldownSeconds } from '@/lib/auth/constants';
import { createRecord, escapeAirtableFormula, listRecords, updateRecord } from './client';
import { getAirtableConfig, requireAirtableConfig } from './config';

type OtpFields = {
  Phone: string;
  Code: string;
  'Expires At': string;
  Used?: boolean;
};

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function assertCanSendOtp(phone: string): Promise<void> {
  const config = getAirtableConfig();
  if (!config) throw new Error('Airtable OTP 설정이 없습니다.');

  const normalized = normalizePhone(phone);
  const cooldownSec = getOtpResendCooldownSeconds();
  if (cooldownSec <= 0) return;

  const records = await listRecords<OtpFields>(config.otpTable, {
    filterByFormula: `{Phone}="${escapeAirtableFormula(normalized)}"`,
    maxRecords: 1,
    sortField: 'Created At',
    sortDirection: 'desc',
  });

  const latest = records[0];
  if (!latest?.createdTime) return;

  const elapsedMs = Date.now() - new Date(latest.createdTime).getTime();
  if (elapsedMs < cooldownSec * 1000) {
    const waitSec = Math.ceil(cooldownSec - elapsedMs / 1000);
    throw new Error(`${waitSec}초 후에 재발송할 수 있습니다.`);
  }
}

export async function saveOtpCode(phone: string, code: string): Promise<void> {
  const config = requireAirtableConfig();
  const normalized = normalizePhone(phone);
  const expiresAt = new Date(Date.now() + getOtpExpiresMinutes() * 60 * 1000).toISOString();

  await createRecord<OtpFields>(config.otpTable, {
    Phone: normalized,
    Code: code,
    'Expires At': expiresAt,
    Used: false,
  });
}

export async function verifyOtpCode(phone: string, code: string): Promise<boolean> {
  const config = requireAirtableConfig();
  const normalized = normalizePhone(phone);
  const trimmedCode = code.trim();

  const formula = `AND({Phone}="${escapeAirtableFormula(normalized)}",{Code}="${escapeAirtableFormula(trimmedCode)}",NOT({Used}))`;
  const records = await listRecords<OtpFields>(config.otpTable, {
    filterByFormula: formula,
    maxRecords: 1,
    sortField: 'Created At',
    sortDirection: 'desc',
  });

  const record = records[0];
  if (!record) return false;

  const expiresAt = new Date(record.fields['Expires At']).getTime();
  if (Number.isNaN(expiresAt) || expiresAt < Date.now()) return false;

  await updateRecord<OtpFields>(config.otpTable, record.id, { Used: true });
  return true;
}
