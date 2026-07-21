import { findUserProductReservation } from '@/lib/db/product-reservations';
import { listOrdersByProfileId } from '@/lib/db/orders';
import { isProductHidden } from '@/lib/products/visibility';
import type { RegionProduct } from '@/lib/regions/types';

/** 주문·예약 이력이 있는 사용자 — Hidden 상품 상세 접근 허용 */
export async function userHasProductParticipation(
  productId: string,
  userId: string,
): Promise<boolean> {
  const [orders, reservation] = await Promise.all([
    listOrdersByProfileId(userId),
    findUserProductReservation(productId, userId),
  ]);
  return (
    orders.some((order) => order.product_id === productId) || reservation != null
  );
}

export async function canViewProduct(
  product: RegionProduct,
  userId: string | null | undefined,
): Promise<boolean> {
  if (!isProductHidden(product)) return true;
  if (!userId) return false;
  return userHasProductParticipation(product.id, userId);
}

export function assertProductAvailableForNewParticipation(product: RegionProduct): void {
  if (isProductHidden(product)) {
    throw new Error('현재 모집 중이 아닌 상품입니다.');
  }
}
