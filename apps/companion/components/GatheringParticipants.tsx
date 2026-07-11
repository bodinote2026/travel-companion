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
  const participantCount = members.filter((m) => !m.is_author).length;

  return (
    <section className="mt-6 px-5">
      <h3 className="text-sm font-semibold text-foreground">
        참여 중인 동행
        <span className="ml-1.5 font-medium text-muted-foreground">
          참여자 {participantCount}명
        </span>
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        동행지기는 목록 맨 위에 표시되며 참여자 수에는 포함되지 않아요.
      </p>

      <ul className="mt-3 flex flex-col gap-2.5">
        {members.map((member) => (
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
              {member.is_author && (
                <span className="shrink-0 rounded-full bg-primary-muted px-2 py-0.5 text-micro font-semibold text-primary">
                  동행지기
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <MemberProfileSheet member={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
