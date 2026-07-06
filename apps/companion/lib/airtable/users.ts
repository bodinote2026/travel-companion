import { getRegion } from '@/lib/regions';
import { normalizePhone } from '@/lib/user-profile';
import type { ProfileRow } from '@/lib/chat/types';
import {
  createRecord,
  escapeAirtableFormula,
  getRecord,
  listRecords,
  updateRecord,
} from './client';
import { getAirtableConfig, requireAirtableConfig } from './config';

export type AirtableUserFields = {
  Phone: string;
  Name: string;
  Region: string;
  'Avatar URL'?: string;
  'Companion Seed ID'?: string;
};

export type AirtableUser = {
  id: string;
  phone: string;
  name: string;
  region: string;
  avatarUrl: string | null;
  companionSeedId: string | null;
};

function mapUser(record: { id: string; fields: AirtableUserFields }): AirtableUser {
  return {
    id: record.id,
    phone: record.fields.Phone,
    name: record.fields.Name,
    region: record.fields.Region,
    avatarUrl: record.fields['Avatar URL'] ?? null,
    companionSeedId: record.fields['Companion Seed ID'] ?? null,
  };
}

export function toProfileRow(user: AirtableUser, createdAt?: string): ProfileRow {
  const now = new Date().toISOString();
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    region: user.region,
    avatar_url: user.avatarUrl,
    companion_seed_id: user.companionSeedId,
    created_at: createdAt ?? now,
    updated_at: now,
  };
}

export async function getUserById(id: string): Promise<AirtableUser | null> {
  const config = getAirtableConfig();
  if (!config) return null;

  try {
    const record = await getRecord<AirtableUserFields>(config.usersTable, id);
    return mapUser(record);
  } catch {
    return null;
  }
}

export async function findUserByCompanionSeedId(
  companionSeedId: string,
): Promise<AirtableUser | null> {
  const config = getAirtableConfig();
  if (!config) return null;

  const formula = `{Companion Seed ID}="${escapeAirtableFormula(companionSeedId)}"`;
  const records = await listRecords<AirtableUserFields>(config.usersTable, {
    filterByFormula: formula,
    maxRecords: 1,
  });

  if (records.length === 0) return null;
  return mapUser(records[0]);
}

export async function findUserByPhone(phone: string, region: string): Promise<AirtableUser | null> {
  const config = getAirtableConfig();
  if (!config) return null;

  const normalized = normalizePhone(phone);
  const formula = `AND({Phone}="${escapeAirtableFormula(normalized)}",{Region}="${escapeAirtableFormula(region)}")`;
  const records = await listRecords<AirtableUserFields>(config.usersTable, {
    filterByFormula: formula,
    maxRecords: 1,
  });

  if (records.length === 0) return null;
  return mapUser(records[0]);
}

export async function upsertUser(input: {
  phone: string;
  name: string;
  region: string;
}): Promise<AirtableUser> {
  const config = requireAirtableConfig();
  const phone = normalizePhone(input.phone);
  const name = input.name.trim();
  const region = input.region;

  const existing = await findUserByPhone(phone, region);
  if (existing) {
    if (existing.name === name) return existing;
    const updated = await updateRecord<AirtableUserFields>(config.usersTable, existing.id, {
      Name: name,
    });
    return mapUser(updated);
  }

  const created = await createRecord<AirtableUserFields>(config.usersTable, {
    Phone: phone,
    Name: name,
    Region: region,
  });
  return mapUser(created);
}

export async function getOrCreateCompanionUser(
  companionSeedId: string,
  regionCode: string,
): Promise<AirtableUser> {
  const existing = await findUserByCompanionSeedId(companionSeedId);
  if (existing) return existing;

  const region = getRegion(regionCode);
  const companion = region.companions.find((c) => c.id === companionSeedId);
  if (!companion) throw new Error('동행자를 찾을 수 없습니다.');

  const config = requireAirtableConfig();
  const created = await createRecord<AirtableUserFields>(config.usersTable, {
    Phone: `seed:${companionSeedId}`,
    Name: companion.name,
    Region: regionCode,
    'Avatar URL': companion.avatar,
    'Companion Seed ID': companionSeedId,
  });
  return mapUser(created);
}
