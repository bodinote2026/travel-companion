'use client';

import { useState } from 'react';
import { GroupBuyCard } from '@/components/GroupBuyCard';
import { RegionTabFilter } from '@/components/RegionTabFilter';
import {
  DEFAULT_REGION_TAB,
  filterByRegionTab,
  type RegionTabId,
} from '@/lib/regions/product-tabs';
import type { RegionProduct } from '@/lib/regions/types';

type Props = {
  products: RegionProduct[];
};

export function GroupBuyProductList({ products }: Props) {
  const [tab, setTab] = useState<RegionTabId>(DEFAULT_REGION_TAB);
  const filtered = filterByRegionTab(products, tab);

  return (
    <>
      <RegionTabFilter active={tab} onChange={setTab} />

      <div className="flex flex-col gap-3.5 px-4 pb-4">
        {filtered.length === 0 ? (
          <p className="rounded-[1.25rem] border border-border/80 bg-card py-10 text-center text-sm text-muted-foreground shadow-[var(--shadow-card)]">
            이 지역에 진행 중인 공동구매가 없습니다.
          </p>
        ) : (
          filtered.map((product) => <GroupBuyCard key={product.id} product={product} />)
        )}
      </div>
    </>
  );
}
