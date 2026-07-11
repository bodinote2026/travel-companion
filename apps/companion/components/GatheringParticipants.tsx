'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { MemberProfileSheet } from '@/components/MemberProfileSheet';
import { UserAvatar } from '@/components/UserAvatar';
import type { GatheringMemberProfile } from '@/lib/db/gathering-participants';

type Props = {
  gatheringId: string;
  members: GatheringMemberProfile[];
  /** 동행지기일 때만 참여자 취소 버튼 표시 */
  canManage?: boolean;
};

export function GatheringParticipants({
  gatheringId,
  members,
  canManage = false,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<GatheringMemberProfile | null>(null);
  const [list, setList] = useState(members);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const participants = list.filter((m) => !m.is_author);

  async function handleRemove(member: GatheringMemberProfile) {
    if (!canManage || removingId) return;
    if (!window.confirm('이 참여자를 취소하시겠어요?')) return;

    setError('');
    setRemovingId(member.user_id);
    try {
      const res = await fetch(
        `/api/gatherings/${encodeURIComponent(gatheringId)}/participants/${encodeURIComponent(member.user_id)}`,
        { method: 'DELETE' },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? '참여자 취소 실패');

      setList((prev) => prev.filter((m) => m.user_id !== member.user_id));
      if (selected?.user_id === member.user_id) setSelected(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '참여자 취소 실패');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="mt-6 px-5">
      <h3 className="text-sm font-semibold text-foreground">
        참여자 {participants.length}명
      </h3>

      {participants.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
          아직 참여자가 없어요.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {participants.map((member) => {
            const removing = removingId === member.user_id;
            return (
              <li key={member.user_id}>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => setSelected(member)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:opacity-80"
                  >
                    <UserAvatar
                      name={member.name}
                      avatarUrl={member.avatar_url}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {member.name}
                      </p>
                    </div>
                  </button>
                  {canManage && (
                    <button
                      type="button"
                      disabled={!!removingId}
                      onClick={() => handleRemove(member)}
                      aria-label={`${member.name} 참여 취소`}
                      className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-border px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive-muted hover:text-destructive disabled:opacity-60"
                    >
                      {removing ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <X className="size-3.5" />
                      )}
                      취소
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="mt-2 rounded-xl bg-destructive-muted px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <MemberProfileSheet member={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
