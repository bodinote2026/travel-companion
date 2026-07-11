'use client';

import { useState } from 'react';
import { MemberProfileSheet } from '@/components/MemberProfileSheet';
import { UserAvatar } from '@/components/UserAvatar';
import type { GatheringMemberProfile } from '@/lib/db/gathering-participants';

type Props = {
  members: GatheringMemberProfile[];
};

export function GatheringParticipants({ members }: Props) {
  const [selected, setSelected] = useState<GatheringMemberProfile | null>(null);
  const participants = members.filter((m) => !m.is_author);

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
          {participants.map((member) => (
            <li key={member.user_id}>
              <button
                type="button"
                onClick={() => setSelected(member)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-left transition-colors hover:bg-secondary/40"
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
            </li>
          ))}
        </ul>
      )}

      <MemberProfileSheet member={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
