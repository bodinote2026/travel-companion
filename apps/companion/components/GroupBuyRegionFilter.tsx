'use client';

import { RegionTabFilter } from '@/components/RegionTabFilter';
import type { RegionTabId } from '@/lib/regions/product-tabs';

type Props = {
  active: RegionTabId;
  onChange: (value: RegionTabId) => void;
};

/** @deprecated Prefer RegionTabFilter — 공동구매 호환용 래퍼 */
export function GroupBuyRegionFilter(props: Props) {
  return <RegionTabFilter {...props} />;
}
