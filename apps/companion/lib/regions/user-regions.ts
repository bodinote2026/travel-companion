import {
  coerceToUserRegion,
  DEFAULT_REGION,
  normalizeUserRegionList,
  type UserRegionValue,
} from './constants';

/** Airtable Region 필드(단일/복수, 라벨 또는 레거시 코드) → 정규화된 지역 배열 */
export function parseUserRegions(value: unknown): UserRegionValue[] {
  return normalizeUserRegionList(value);
}

/** 알려진 지역만 유지, 중복 제거, UI 표시 순서 정렬 */
export function normalizeUserRegions(codes: string[]): UserRegionValue[] {
  return normalizeUserRegionList(codes);
}

/** 채팅·세션 등 단일 region이 필요할 때 첫 번째 활동 지역 */
export function primaryRegion(regions: string[]): UserRegionValue {
  return normalizeUserRegionList(regions)[0] ?? DEFAULT_REGION;
}

export function formatRegionsDisplay(regions: string[]): string {
  const normalized = normalizeUserRegionList(regions);
  if (normalized.length === 0) return '';
  return normalized.join(' · ');
}

export function regionsEqual(a: string[], b: string[]): boolean {
  const left = normalizeUserRegionList(a);
  const right = normalizeUserRegionList(b);
  if (left.length !== right.length) return false;
  return left.every((code, index) => code === right[index]);
}

export { coerceToUserRegion };
