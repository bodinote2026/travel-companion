import { MapPin } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import type { CompanionListItem } from '@/lib/companions/types';
import { CATEGORY_LABELS } from '@/lib/regions/types';
import { getCategoryBadgeClass } from '@/lib/design-system';
import { formatDistance } from '@/lib/geo';
import { cn } from '@/lib/utils';

type Props = {
  companion: CompanionListItem;
  active?: boolean;
  /** false면 거리 대신 지역명만 표시 (위치 미확인 시) */
  showDistance?: boolean;
  onClick: () => void;
};

export function CompanionCard({
  companion,
  active,
  showDistance = true,
  onClick,
}: Props) {
  const ageLabel = companion.age != null ? ` · ${companion.age}` : '';
  const bioLine = companion.bio?.trim() || companion.headline;
  const categoryTags =
    companion.categories.length > 0
      ? companion.categories
      : [companion.primaryCategory];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-[1.25rem] border bg-card p-4 text-left transition-colors',
        active ? 'border-primary shadow-sm' : 'border-border hover:bg-secondary/50',
      )}
    >
      <UserAvatar
        name={companion.name}
        avatarUrl={companion.avatar}
        size="lg"
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-foreground">
            {companion.name}
            {ageLabel}
          </span>
          {companion.temperature != null && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-micro font-semibold text-primary">
              {companion.temperature.toFixed(1)}
            </span>
          )}
          {companion.activityActive && (
            <span className="flex items-center gap-1 text-micro font-semibold text-success">
              <span className="size-1.5 rounded-full bg-success" />
              활동 중
            </span>
          )}
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-foreground/90">{bioLine}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {categoryTags.map((cat) => (
            <span
              key={cat}
              className={cn(
                'rounded-md px-1.5 py-0.5 text-micro font-semibold',
                getCategoryBadgeClass(cat),
              )}
            >
              {CATEGORY_LABELS[cat]}
            </span>
          ))}
        </div>

        <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">
            {showDistance
              ? `${companion.area} · ${formatDistance(companion.distanceKm)}`
              : companion.area}
            {companion.activityLabel && !companion.activityActive
              ? ` · ${companion.activityLabel}`
              : ''}
          </span>
        </p>
      </div>
    </button>
  );
}
