import { getAirtableConfig } from '@/lib/airtable/config';
import {
  createGathering as createAirtableGathering,
  deleteGathering as deleteAirtableGathering,
  findGatheringsByAuthor as findAirtableGatheringsByAuthor,
  getGatheringById as getAirtableGatheringById,
  listGatherings as listAirtableGatherings,
  updateGathering as updateAirtableGathering,
  updateGatheringCounts as updateAirtableGatheringCounts,
  type GatheringRecord,
  type GatheringStatus,
} from '@/lib/airtable/gatherings';
import {
  deleteParticipantsByGathering as deleteAirtableParticipantsByGathering,
  listAppliedParticipants as listAirtableAppliedParticipants,
} from '@/lib/airtable/gathering-participants';

export type { GatheringRecord, GatheringStatus };

const memoryGatherings = new Map<string, GatheringRecord>();

export async function listGatherings(): Promise<GatheringRecord[]> {
  if (getAirtableConfig()) {
    return listAirtableGatherings();
  }
  return [...memoryGatherings.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function getGatheringById(id: string): Promise<GatheringRecord | null> {
  if (getAirtableConfig()) {
    return getAirtableGatheringById(id);
  }
  return memoryGatherings.get(id) ?? null;
}

export async function findGatheringsByAuthor(authorId: string): Promise<GatheringRecord[]> {
  if (getAirtableConfig()) {
    return findAirtableGatheringsByAuthor(authorId);
  }
  return [...memoryGatherings.values()]
    .filter((g) => g.author_id === authorId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
  if (getAirtableConfig()) {
    return createAirtableGathering(input);
  }

  const row: GatheringRecord = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
    region: input.region.trim(),
    cover_image_url: input.coverImageUrl?.trim() || null,
    author_id: input.authorId,
    author_name: input.authorName.trim(),
    author_avatar_url: null,
    target_count: input.targetCount,
    current_count: 0,
    gathering_date: input.gatheringDate?.trim() || null,
    status: 'open',
    created_at: new Date().toISOString(),
  };
  memoryGatherings.set(row.id, row);
  return row;
}

export async function updateGatheringCounts(
  gatheringId: string,
  input: { currentCount: number; status?: GatheringStatus },
): Promise<GatheringRecord> {
  if (getAirtableConfig()) {
    return updateAirtableGatheringCounts(gatheringId, input);
  }

  const existing = memoryGatherings.get(gatheringId);
  if (!existing) {
    throw new Error('모집글을 찾을 수 없습니다.');
  }
  const updated: GatheringRecord = {
    ...existing,
    current_count: input.currentCount,
    status: input.status ?? existing.status,
  };
  memoryGatherings.set(gatheringId, updated);
  return updated;
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
  if (getAirtableConfig()) {
    return updateAirtableGathering(gatheringId, input);
  }

  const existing = memoryGatherings.get(gatheringId);
  if (!existing) {
    throw new Error('모집글을 찾을 수 없습니다.');
  }
  const updated: GatheringRecord = {
    ...existing,
    title: input.title.trim(),
    description: input.description.trim(),
    region: input.region.trim(),
    cover_image_url:
      input.coverImageUrl !== undefined
        ? input.coverImageUrl?.trim() || null
        : existing.cover_image_url,
    target_count: input.targetCount,
    gathering_date: input.gatheringDate?.trim() || null,
    status: input.status,
  };
  memoryGatherings.set(gatheringId, updated);
  return updated;
}

/**
 * 신청 상태 참여자 수 (동행지기 제외).
 * Gathering_Participants에 작성자 row가 있어도 카운트하지 않는다.
 */
export async function countAppliedApplicants(gatheringId: string): Promise<number> {
  const gathering = await getGatheringById(gatheringId);
  if (!gathering) return 0;

  if (getAirtableConfig()) {
    const rows = await listAirtableAppliedParticipants(gatheringId);
    return rows.filter((p) => p.user_id !== gathering.author_id).length;
  }

  // memory: gathering-participants 모듈의 Map을 직접 세지 못하므로
  // 저장된 current_count를 신뢰 (신청/취소 시 sync가 갱신)
  return Math.max(0, gathering.current_count);
}

/**
 * Gathering_Participants(applied, 동행지기 제외) 기준으로 Current Count를 맞춘다.
 * 예전 생성분(1로 시작) 보정·신청/취소 후 정합성 유지용.
 */
export async function syncGatheringParticipantCount(
  gatheringId: string,
): Promise<GatheringRecord | null> {
  const gathering = await getGatheringById(gatheringId);
  if (!gathering) return null;

  const count = await countAppliedApplicants(gatheringId);
  // 정원 도달 시에만 자동 마감. 수동 closed는 상세 조회 sync로 다시 열지 않음.
  const nextStatus =
    count >= gathering.target_count ? 'closed' : gathering.status;

  if (gathering.current_count === count && gathering.status === nextStatus) {
    return gathering;
  }

  return updateGatheringCounts(gatheringId, {
    currentCount: count,
    status: nextStatus,
  });
}

/** 전체 모집글 Current Count를 신청자 수(동행지기 제외)로 일괄 보정 */
export async function reconcileAllGatheringParticipantCounts(): Promise<{
  checked: number;
  updated: number;
  details: { id: string; title: string; before: number; after: number }[];
}> {
  const gatherings = await listGatherings();
  const details: { id: string; title: string; before: number; after: number }[] =
    [];
  let updated = 0;

  for (const g of gatherings) {
    const after = await countAppliedApplicants(g.id);
    if (g.current_count !== after) {
      const nextStatus = after >= g.target_count ? 'closed' : g.status;
      await updateGatheringCounts(g.id, {
        currentCount: after,
        status: nextStatus,
      });
      updated += 1;
      details.push({
        id: g.id,
        title: g.title,
        before: g.current_count,
        after,
      });
    }
  }

  return { checked: gatherings.length, updated, details };
}

export async function deleteGatheringWithParticipants(gatheringId: string): Promise<void> {
  if (getAirtableConfig()) {
    await deleteAirtableParticipantsByGathering(gatheringId);
    await deleteAirtableGathering(gatheringId);
    return;
  }
  memoryGatherings.delete(gatheringId);
}
