import { PageShell } from '@/components/PageShell';
import { MypageContent } from '@/components/MypageContent';

export default function MypagePage() {
  return (
    <PageShell active="profile">
      <header className="px-4 pb-3 pt-12">
        <h1 className="text-lg font-bold">마이페이지</h1>
        <p className="text-xs text-muted-foreground">내 정보 · 공동구매 참여 내역</p>
      </header>
      <MypageContent />
    </PageShell>
  );
}
