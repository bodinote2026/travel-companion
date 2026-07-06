import { normalizePhone } from '@/lib/user-profile';
import { createRecord, escapeAirtableFormula, listRecords, updateRecord } from './client';
import { getAirtableConfig, requireAirtableConfig } from './config';

export type AirtableUserFields = {
  Phone: string;
  Name: string;
  Region: string;
  'Avatar URL'?: string;
};

export type AirtableUser = {
  id: string;
  phone: string;
  name: string;
  region: string;
  avatarUrl: string | null;
};

function mapUser(record: { id: string; fields: AirtableUserFields }): AirtableUser {
  return {
    id: record.id,
    phone: record.fields.Phone,
    name: record.fields.Name,
    region: record.fields.Region,
    avatarUrl: record.fields['Avatar URL'] ?? null,
  };
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
    const updated = await updateRecord<AirtableUserFields>(config.usersTable, existing.id, { Name: name });
    return mapUser(updated);
  }

  const created = await createRecord<AirtableUserFields>(config.usersTable, {
    Phone: phone,
    Name: name,
    Region: region,
  });
  return mapUser(created);
}
