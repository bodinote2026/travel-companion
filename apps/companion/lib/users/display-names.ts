import {
  getUserById,
  maskDisplayName,
  userDisplayName,
  type AirtableUser,
} from '@/lib/airtable/users';

export const DEFAULT_AUTHOR_DISPLAY_NAME = '동행지기';
export const DEFAULT_USER_DISPLAY_NAME = '사용자';

/** Users 조회 성공 → 현재 Nickname, 실패 → storedName, 비어 있으면 defaultName */
export function resolveDisplayNameFromUser(
  user: { nickname?: string | null; name?: string | null } | null | undefined,
  storedName: string,
  defaultName: string = DEFAULT_USER_DISPLAY_NAME,
): string {
  if (user) {
    return userDisplayName(user);
  }
  const stored = storedName.trim();
  if (stored) return stored;
  return defaultName;
}

/** author_id 일괄 Users 조회 (아바타·별명 해석 공용) */
export async function resolveUsersByIds(
  userIds: string[],
): Promise<Map<string, AirtableUser | null>> {
  const unique = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))];
  const entries = await Promise.all(
    unique.map(async (id) => [id, await getUserById(id)] as const),
  );
  return new Map(entries);
}

type AuthorEnrichable = {
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
};

/** 글·댓글 작성자 — 배치 Users 조회 후 현재 별명·아바타 반영 */
export async function enrichWithAuthorProfiles<T extends AuthorEnrichable>(
  items: T[],
  options?: { defaultName?: string },
): Promise<T[]> {
  if (items.length === 0) return items;

  const defaultName = options?.defaultName ?? DEFAULT_AUTHOR_DISPLAY_NAME;
  const users = await resolveUsersByIds(items.map((item) => item.author_id));

  return items.map((item) => {
    const userId = item.author_id.trim();
    const user = userId ? (users.get(userId) ?? null) : null;
    return {
      ...item,
      author_name: resolveDisplayNameFromUser(user, item.author_name, defaultName),
      author_avatar_url: user?.avatarUrl ?? item.author_avatar_url ?? null,
    };
  });
}

/** 단일 레코드용 */
export async function enrichAuthorProfile<T extends AuthorEnrichable>(
  item: T,
  options?: { defaultName?: string },
): Promise<T> {
  const [enriched] = await enrichWithAuthorProfiles([item], options);
  return enriched;
}

type ParticipantDisplayEnrichable = {
  profile_id?: string | null;
  display_name: string;
};

/** 공동구매 참여자 — 현재 별명 조회 후 maskDisplayName 적용 */
export async function enrichParticipantDisplayNames<T extends ParticipantDisplayEnrichable>(
  participants: T[],
): Promise<T[]> {
  if (participants.length === 0) return participants;

  const users = await resolveUsersByIds(
    participants.map((p) => p.profile_id?.trim() ?? ''),
  );

  return participants.map((participant) => {
    const userId = participant.profile_id?.trim() ?? '';
    const user = userId ? (users.get(userId) ?? null) : null;
    const resolved = resolveDisplayNameFromUser(
      user,
      participant.display_name,
      DEFAULT_USER_DISPLAY_NAME,
    );
    return {
      ...participant,
      display_name: maskDisplayName(resolved),
    };
  });
}
