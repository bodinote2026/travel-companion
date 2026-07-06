import type { CompanionCategory } from '@/lib/regions/types';
import { INTEREST_CATEGORIES } from '@/lib/profile/constants';

const INTEREST_TO_CATEGORY: Record<string, CompanionCategory> = {
  식사: 'meal',
  운동: 'exercise',
  여행: 'travel',
};

export function interestToCategories(interests: string[]): CompanionCategory[] {
  return interests
    .filter((i) => (INTEREST_CATEGORIES as readonly string[]).includes(i))
    .map((i) => INTEREST_TO_CATEGORY[i])
    .filter(Boolean);
}

export function primaryCategory(categories: CompanionCategory[]): CompanionCategory {
  return categories[0] ?? 'travel';
}
