import Link from 'next/link';
import { Plus } from 'lucide-react';
import { GatheringList } from '@/components/GatheringList';
import { PageShell } from '@/components/PageShell';
import { listGatherings } from '@/lib/db/gatherings';

export default async function GatheringsPage() {
  const gatherings = await listGatherings();

  return (
    <PageShell active="gatherings">
      <header className="flex items-center gap-3 px-4 pb-3 pt-12">
        <div className="flex-1">
          <h1 className="text-lg font-bold">동행 모집</h1>
          <p className="text-xs text-muted-foreground">함께할 사람을 모집해 보세요</p>
        </div>
        <Link
          href="/gatherings/new"
          className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-primary"
          aria-label="모집글 작성"
        >
          <Plus className="size-5" />
        </Link>
      </header>

      <GatheringList gatherings={gatherings} />
    </PageShell>
  );
}
