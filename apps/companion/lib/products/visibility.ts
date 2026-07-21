import type { RegionProduct } from '@/lib/regions/types';

/** Airtable Hidden 체크박스 — 빈 값·false = 노출 */
export function parseProductHidden(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
  }
  return false;
}

export function isProductHidden(product: Pick<RegionProduct, 'hidden'>): boolean {
  return product.hidden === true;
}

/** 공개 목록(공동구매 탭 등)용 — Hidden 상품 제외 */
export function filterListedProducts<T extends Pick<RegionProduct, 'hidden'>>(
  products: T[],
): T[] {
  return products.filter((product) => !isProductHidden(product));
}
