import { listAllProducts } from '@/lib/db/products';
import { HomeClient } from '@/components/HomeClient';

/** 위치 기반 동행 지도 */
export default async function MapPage() {
  const products = await listAllProducts();
  return <HomeClient products={products} />;
}
