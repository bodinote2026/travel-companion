'use client';

import { Users } from 'lucide-react';
import type { GatheringRecord } from '@/lib/db/gatherings';
import { getRegionDisplayName } from '@/lib/regions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

function formatGatheringDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

type Props = {
  gathering: GatheringRecord;
};

export function GatheringCard({ gathering }: Props) {
  const dateLabel = formatGatheringDate(gathering.gathering_date);
  const closed = gathering.status === 'closed';

  return (
    <Link
      href={`/gatherings/${gathering.id}`}
      className={cn(
        'block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold text-foreground">{gathering.title}</p>
        <span className="shrink-0 rounded-md bg-primary-muted px-1.5 py-0.5 text-micro font-bold text-primary">
          {getRegionDisplayName(gathering.region)}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {gathering.description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-medium text-primary">
          <Users className="size-3.5" />
          {gathering.current_count}/{gathering.target_count}명
          {closed ? ' · 마감' : ''}
        </span>
        {dateLabel && <span>{dateLabel}</span>}
        <span className="ml-auto font-medium text-foreground">{gathering.author_name}</span>
      </div>
    </Link>
  );
}
