import Image from 'next/image';
import { User } from 'lucide-react';
import { categoryLabel } from '@/lib/companions/build-list';
import type { CompanionListItem } from '@/lib/companions/types';
import { formatDistance } from '@/lib/geo';
import { cn } from '@/lib/utils';
import { TemperatureRing } from './TemperatureRing';

type Props = {
  companion: CompanionListItem;
  active?: boolean;
  liveAngle?: number;
  onClick: () => void;
};

export function CompanionCard({ companion, active, liveAngle, onClick }: Props) {
  const ageLabel = companion.age != null ? ` · 만 ${companion.age}` : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left transition-colors',
        active ? 'border-primary shadow-sm' : 'border-border hover:bg-secondary/50',
      )}
    >
      <div className="relative flex size-[52px] shrink-0 flex-col items-center justify-center">
        {companion.temperature != null ? (
          <>
            <TemperatureRing temperature={companion.temperature} size={52} stroke={5} />
            {liveAngle != null && (
              <span className="absolute -bottom-1 rounded bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                {liveAngle.toFixed(0)}°
              </span>
            )}
          </>
        ) : (
          <span className="flex size-[52px] items-center justify-center rounded-full border border-border bg-muted text-sm font-bold text-muted-foreground">
            -
          </span>
        )}
      </div>

      {companion.avatar ? (
        <span className="relative size-11 shrink-0 overflow-hidden rounded-full border border-border">
          <Image
            src={companion.avatar}
            alt={`${companion.name} 프로필`}
            fill
            className="object-cover"
            sizes="44px"
          />
        </span>
      ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 text-primary">
          <User className="size-5" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">
            {companion.name}
            {ageLabel}
          </span>
          <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
            {categoryLabel(companion)}
          </span>
          {companion.activityActive && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              활동 중
            </span>
          )}
        </div>
        <p className="truncate text-sm text-foreground">{companion.headline}</p>
        <p className="text-xs text-muted-foreground">
          {companion.area} · {formatDistance(companion.distanceKm)}
          {companion.activityLabel && !companion.activityActive
            ? ` · ${companion.activityLabel}`
            : companion.activityActive
              ? ' · 지금 활동 중'
              : ''}
        </p>
      </div>
    </button>
  );
}
