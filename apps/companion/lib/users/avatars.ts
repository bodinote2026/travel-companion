import { resolveUsersByIds } from '@/lib/users/display-names';

/** author_id → Avatar URL 일괄 조회 */
export async function resolveAuthorAvatars(
  authorIds: string[],
): Promise<Map<string, string | null>> {
  const users = await resolveUsersByIds(authorIds);
  const result = new Map<string, string | null>();
  for (const [id, user] of users) {
    result.set(id, user?.avatarUrl ?? null);
  }
  return result;
}
