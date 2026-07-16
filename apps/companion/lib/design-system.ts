export const categoryBadgeClass = {
  meal: 'bg-category-meal-muted text-category-meal',
  exercise: 'bg-category-exercise-muted text-category-exercise',
  travel: 'bg-category-travel-muted text-category-travel',
} as const;

export function getCategoryBadgeClass(category: 'meal' | 'exercise' | 'travel' | string): string {
  if (category in categoryBadgeClass)
    return categoryBadgeClass[category as keyof typeof categoryBadgeClass];
  return 'bg-accent text-accent-foreground';
}

export const pageHeaderClass = 'pt-12 pb-3 px-4';
export const cardClass = 'rounded-2xl border border-border bg-card p-4';
/** 목록 카드·빈 상태 — 테두리로만 구분, shadow 없음 */
export const listSurfaceClass = 'rounded-2xl border border-border bg-card';
/** 탭 상단 안내 배너 (연한 주황) */
export const infoBannerClass =
  'overflow-hidden rounded-2xl border border-primary/20 bg-primary-muted/60 px-4 py-3';
export const primaryButtonClass =
  'flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-base font-semibold text-primary-foreground';
export const captionClass = 'text-xs text-muted-foreground';
export const microClass = 'text-micro';
