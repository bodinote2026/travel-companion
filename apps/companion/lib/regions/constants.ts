/** Airtable Users.Region Multiple select 옵션 — 앱 전역에서 이 값만 사용 */
export const REGION_SEOUL = '서울' as const;
export const REGION_MUKHO = '묵호' as const;

export const USER_REGION_VALUES = [REGION_SEOUL, REGION_MUKHO] as const;
export type UserRegionValue = (typeof USER_REGION_VALUES)[number];

export const DEFAULT_REGION: UserRegionValue = REGION_MUKHO;

/** @deprecated 영문 코드 — 레거시 데이터·세션 호환용 */
const LEGACY_REGION_ALIASES: Record<string, UserRegionValue> = {
  seoul: REGION_SEOUL,
  mukho: REGION_MUKHO,
};

/** JSON.stringify 등으로 감싸진 따옴표 제거 */
export function sanitizeRegionToken(raw: string): string {
  let value = raw.trim();
  while (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

/** 단일 값 → 정규 지역. 알 수 없으면 null */
export function coerceToUserRegion(raw: string): UserRegionValue | null {
  const value = sanitizeRegionToken(raw);
  if (!value) return null;
  if ((USER_REGION_VALUES as readonly string[]).includes(value)) {
    return value as UserRegionValue;
  }
  return LEGACY_REGION_ALIASES[value] ?? null;
}

function expandRegionInput(value: unknown): string[] {
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      /* treat as plain string */
    }
  }

  return [trimmed];
}

/** 폼·API·Airtable 읽기 공통 — 순수 "서울"|"묵호" 배열로 정규화 */
export function normalizeUserRegionList(values: unknown): UserRegionValue[] {
  const rawItems: string[] = [];

  if (Array.isArray(values)) {
    for (const value of values) {
      rawItems.push(...expandRegionInput(value));
    }
  } else {
    rawItems.push(...expandRegionInput(values));
  }

  const seen = new Set<UserRegionValue>();
  const result: UserRegionValue[] = [];

  for (const item of rawItems) {
    const region = coerceToUserRegion(item);
    if (region && !seen.has(region)) {
      seen.add(region);
      result.push(region);
    }
  }

  return result.sort(
    (a, b) => USER_REGION_VALUES.indexOf(a) - USER_REGION_VALUES.indexOf(b),
  );
}

/** Airtable 쓰기용 Region 필드 — 빈 배열이면 undefined (필드 생략) */
export function buildAirtableRegionField(values: unknown): UserRegionValue[] | undefined {
  const normalized = normalizeUserRegionList(values);
  return normalized.length > 0 ? normalized : undefined;
}

export function isKnownUserRegion(value: string): boolean {
  return coerceToUserRegion(value) != null;
}
