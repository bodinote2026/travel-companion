import { mukhoRegion } from './mukho';
import { seoulRegion } from './seoul';
import type { RegionConfig } from './types';

/** Airtable Region — 지역 무관(온라인 배송·전국 모집 등) */
export const NATIONAL_REGION_CODE = 'national';

export const DEFAULT_REGION_TAB = 'all';

/**
 * 공동구매·동행 모집 지역 탭에 노출할 서비스 지역 (표시 순서).
 * 새 지역 탭 추가: 1) regions/{code}.ts 작성 2) 이 배열에 push
 */
const BOARD_TAB_REGIONS: RegionConfig[] = [mukhoRegion, seoulRegion];

export type RegionTabId = 'all' | typeof NATIONAL_REGION_CODE | string;

export const REGION_TABS: { id: RegionTabId; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: NATIONAL_REGION_CODE, label: '전국' },
  ...BOARD_TAB_REGIONS.map((region) => ({
    id: region.code,
    label: region.name,
  })),
];

/** 모집글 작성 시 선택 가능한 지역 (전체 제외) */
export const GATHERING_REGION_OPTIONS: { code: string; name: string }[] = [
  { code: NATIONAL_REGION_CODE, name: '전국' },
  ...BOARD_TAB_REGIONS.map((region) => ({
    code: region.code,
    name: region.name,
  })),
];

export function filterByRegionTab<T extends { region: string }>(
  items: T[],
  tab: RegionTabId,
): T[] {
  if (tab === 'all') return items;
  return items.filter((item) => item.region === tab);
}

/** @deprecated Use NATIONAL_REGION_CODE */
export const NATIONAL_PRODUCT_REGION = NATIONAL_REGION_CODE;
/** @deprecated Use DEFAULT_REGION_TAB */
export const DEFAULT_PRODUCT_REGION_TAB = DEFAULT_REGION_TAB;
/** @deprecated Use REGION_TABS */
export const PRODUCT_REGION_TABS = REGION_TABS;
/** @deprecated Use RegionTabId */
export type ProductRegionTabId = RegionTabId;
/** @deprecated Use filterByRegionTab */
export const filterProductsByRegionTab = filterByRegionTab;
