'use client';

import { useState } from 'react';
import { GatheringCard } from '@/components/GatheringCard';
import { RegionTabFilter } from '@/components/RegionTabFilter';
import { listSurfaceClass } from '@/lib/design-system';
import type { GatheringRecord } from '@/lib/db/gatherings';
import {
  DEFAULT_REGION_TAB,
  filterByRegionTab,
  type RegionTabId,
} from '@/lib/regions/product-tabs';
import { cn } from '@/lib/utils';

type Props = {
  gatherings: GatheringRecord[];
};

export function GatheringList({ gatherings }: Props) {
  const [tab, setTab] = useState<RegionTabId>(DEFAULT_REGION_TAB);
  const filtered = filterByRegionTab(gatherings, tab);

  return (
    <>
      <RegionTabFilter active={tab} onChange={setTab} />

      <div className="flex flex-col gap-3 px-4 pb-4 pt-2">
        {filtered.length === 0 ? (
          <p
            className={cn(
              listSurfaceClass,
              'px-4 py-10 text-center text-sm text-muted-foreground',
            )}
          >
            이 지역에 모집글이 없습니다.
          </p>
        ) : (
          filtered.map((gathering) => (
            <GatheringCard key={gathering.id} gathering={gathering} />
          ))
        )}
      </div>
    </>
  );
}
