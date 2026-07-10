import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { GatheringCreateForm } from '@/components/GatheringCreateForm';
import { PageShell } from '@/components/PageShell';

export default function GatheringNewPage() {
  return (
    <PageShell active="gatherings" hideNav>
      <header className="flex items-center gap-3 px-4 pb-3 pt-12">
        <Link
          href="/gatherings"
          aria-label="뒤로"
          className="flex size-10 items-center justify-center rounded-full border border-border bg-card"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold">모집글 작성</h1>
          <p className="text-xs text-muted-foreground">동행할 사람을 모집해 보세요</p>
        </div>
      </header>

      <GatheringCreateForm />
    </PageShell>
  );
}
