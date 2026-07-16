import { HomeClient } from '@/components/HomeClient';
import { PageShell } from '@/components/PageShell';

/** 위치 기반 동행 지도 */
export default function MapPage() {
  return (
    <PageShell active="map">
      <HomeClient />
    </PageShell>
  );
}
