import {
  createRecord,
  deleteRecord,
  escapeAirtableFormula,
  getRecord,
  listRecords,
  updateRecord,
} from './client';
import { requireAirtableConfig } from './config';
import { resolveAuthorAvatars } from '@/lib/users/avatars';

export type GatheringStatus = 'open' | 'closed';

export type AirtableGatheringFields = {
  Title?: string;
  Description?: string;
  Region?: string;
  'Cover Image'?: string;
  'Author ID'?: string;
  'Author Name'?: string;
  'Target Count'?: number;
  'Current Count'?: number;
  'Gathering Date'?: string;
  Status?: GatheringStatus;
};

export type GatheringRecord = {
  id: string;
  title: string;
  description: string;
  region: string;
  cover_image_url: string | null;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  target_count: number;
  current_count: number;
  gathering_date: string | null;
  status: GatheringStatus;
  created_at: string;
};

function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function mapGathering(record: {
  id: string;
  createdTime?: string;
  fields: AirtableGatheringFields;
}): GatheringRecord {
  return {
    id: record.id,
    title: record.fields.Title?.trim() || '',
    description: record.fields.Description?.trim() || '',
    region: record.fields.Region?.trim() || '',
    cover_image_url: record.fields['Cover Image']?.trim() || null,
    author_id: record.fields['Author ID']?.trim() || '',
    author_name: record.fields['Author Name']?.trim() || '',
    author_avatar_url: null,
    target_count: parseNumber(record.fields['Target Count'], 1),
    current_count: parseNumber(record.fields['Current Count'], 0),
    gathering_date: record.fields['Gathering Date']?.trim() || null,
    status: record.fields.Status === 'closed' ? 'closed' : 'open',
    created_at: record.createdTime ?? new Date().toISOString(),
  };
}

export async function listGatherings(): Promise<GatheringRecord[]> {
  const config = requireAirtableConfig();
  const records = await listRecords<AirtableGatheringFields>(config.gatheringsTable);

  const gatherings = records
    .map(mapGathering)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const avatars = await resolveAuthorAvatars(gatherings.map((g) => g.author_id));
  return gatherings.map((g) => ({
    ...g,
    author_avatar_url: avatars.get(g.author_id) ?? null,
  }));
}

export async function getGatheringById(id: string): Promise<GatheringRecord | null> {
  const config = requireAirtableConfig();
  try {
    const record = await getRecord<AirtableGatheringFields>(config.gatheringsTable, id);
    const gathering = mapGathering(record);
    if (!gathering.author_id) return gathering;
    const avatars = await resolveAuthorAvatars([gathering.author_id]);
    return {
      ...gathering,
      author_avatar_url: avatars.get(gathering.author_id) ?? null,
    };
  } catch {
    return null;
  }
}

export async function createGathering(input: {
  title: string;
  description: string;
  region: string;
  coverImageUrl?: string | null;
  authorId: string;
  authorName: string;
  targetCount: number;
  gatheringDate?: string | null;
}): Promise<GatheringRecord> {
  const config = requireAirtableConfig();
  const fields: AirtableGatheringFields = {
    Title: input.title.trim(),
    Description: input.description.trim(),
    Region: input.region.trim(),
    'Author ID': input.authorId,
    'Author Name': input.authorName.trim(),
    'Target Count': input.targetCount,
    'Current Count': 0,
    Status: 'open',
  };
  const coverImage = input.coverImageUrl?.trim();
  if (coverImage) {
    fields['Cover Image'] = coverImage;
  }
  if (input.gatheringDate) {
    fields['Gathering Date'] = input.gatheringDate;
  }

  const created = await createRecord<AirtableGatheringFields>(
    config.gatheringsTable,
    fields,
    { typecast: true },
  );
  const gathering = mapGathering(created);
  const avatars = await resolveAuthorAvatars([gathering.author_id]);
  return {
    ...gathering,
    author_avatar_url: avatars.get(gathering.author_id) ?? null,
  };
}

export async function findGatheringsByAuthor(authorId: string): Promise<GatheringRecord[]> {
  const config = requireAirtableConfig();
  const formula = `{Author ID}="${escapeAirtableFormula(authorId)}"`;
  const records = await listRecords<AirtableGatheringFields>(config.gatheringsTable, {
    filterByFormula: formula,
  });
  return records.map(mapGathering);
}

export async function updateGatheringCounts(
  gatheringId: string,
  input: { currentCount: number; status?: GatheringStatus },
): Promise<GatheringRecord> {
  const config = requireAirtableConfig();
  const fields: AirtableGatheringFields = {
    'Current Count': input.currentCount,
  };
  if (input.status) fields.Status = input.status;

  const updated = await updateRecord<AirtableGatheringFields>(
    config.gatheringsTable,
    gatheringId,
    fields,
    { typecast: true },
  );
  const gathering = mapGathering(updated);
  if (!gathering.author_id) return gathering;
  const avatars = await resolveAuthorAvatars([gathering.author_id]);
  return {
    ...gathering,
    author_avatar_url: avatars.get(gathering.author_id) ?? null,
  };
}

export async function updateGathering(
  gatheringId: string,
  input: {
    title: string;
    description: string;
    region: string;
    coverImageUrl?: string | null;
    targetCount: number;
    gatheringDate?: string | null;
    status: GatheringStatus;
  },
): Promise<GatheringRecord> {
  const config = requireAirtableConfig();
  const fields: AirtableGatheringFields = {
    Title: input.title.trim(),
    Description: input.description.trim(),
    Region: input.region.trim(),
    'Target Count': input.targetCount,
    Status: input.status,
    'Gathering Date': input.gatheringDate?.trim() || undefined,
  };

  // 날짜·대표 이미지 비우기: Airtable에 null로 전달
  const payloadFields: Record<string, unknown> = { ...fields };
  if (!input.gatheringDate?.trim()) {
    payloadFields['Gathering Date'] = null;
  }
  if (input.coverImageUrl !== undefined) {
    payloadFields['Cover Image'] = input.coverImageUrl?.trim() || null;
  }

  const updated = await updateRecord<AirtableGatheringFields>(
    config.gatheringsTable,
    gatheringId,
    payloadFields as AirtableGatheringFields,
    { typecast: true },
  );
  const gathering = mapGathering(updated);
  if (!gathering.author_id) return gathering;
  const avatars = await resolveAuthorAvatars([gathering.author_id]);
  return {
    ...gathering,
    author_avatar_url: avatars.get(gathering.author_id) ?? null,
  };
}

export async function deleteGathering(gatheringId: string): Promise<void> {
  const config = requireAirtableConfig();
  await deleteRecord(config.gatheringsTable, gatheringId);
}
