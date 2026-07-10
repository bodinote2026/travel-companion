import { getUserById } from '@/lib/airtable/users';

/** author_id → Avatar URL 일괄 조회 */
export async function resolveAuthorAvatars(
  authorIds: string[],
): Promise<Map<string, string | null>> {
  const unique = [...new Set(authorIds.map((id) => id.trim()).filter(Boolean))];
  const entries = await Promise.all(
    unique.map(async (id) => {
      const user = await getUserById(id);
      return [id, user?.avatarUrl ?? null] as const;
    }),
  );
  return new Map(entries);
}
