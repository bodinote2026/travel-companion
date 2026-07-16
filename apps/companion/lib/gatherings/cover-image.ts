import { NATIONAL_REGION_CODE } from '@/lib/regions/product-tabs';
import { REGION_MUKHO, REGION_SEOUL } from '@/lib/regions/constants';

/** Cover Image가 없을 때 지역(카테고리)별 기본 썸네일 */
export const GATHERING_REGION_PLACEHOLDERS: Record<string, string> = {
  [NATIONAL_REGION_CODE]: '/gathering-placeholder-national.svg',
  [REGION_MUKHO]: '/gathering-placeholder-mukho.svg',
  [REGION_SEOUL]: '/gathering-placeholder-seoul.svg',
};

export function resolveGatheringCoverImageUrl(
  coverUrl: string | null | undefined,
  region: string,
): string | null {
  const trimmed = coverUrl?.trim();
  if (trimmed) return trimmed;

  const regionKey = region.trim();
  return GATHERING_REGION_PLACEHOLDERS[regionKey] ?? null;
}
