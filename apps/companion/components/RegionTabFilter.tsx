'use client';

import {
  DEFAULT_REGION_TAB,
  REGION_TABS,
  type RegionTabId,
} from '@/lib/regions/product-tabs';
import { PAGE_GUTTER_CLASS } from '@/lib/layout/page-container';
import { cn } from '@/lib/utils';

type Props = {
  active: RegionTabId;
  onChange: (value: RegionTabId) => void;
};

export function RegionTabFilter({
  active = DEFAULT_REGION_TAB,
  onChange,
}: Props) {
  return (
    <div className={cn(PAGE_GUTTER_CLASS, 'flex items-center gap-2.5 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden')}>
      {REGION_TABS.map(({ id, label }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              'flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              selected
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:bg-secondary',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
