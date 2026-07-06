export const INTEREST_CATEGORIES = ['식사', '운동', '여행'] as const;

export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];

export function isInterestCategory(value: string): value is InterestCategory {
  return (INTEREST_CATEGORIES as readonly string[]).includes(value);
}

export function normalizeInterestCategories(values: unknown): InterestCategory[] {
  if (!Array.isArray(values)) return [];
  return values.filter((v): v is InterestCategory => typeof v === 'string' && isInterestCategory(v));
}
