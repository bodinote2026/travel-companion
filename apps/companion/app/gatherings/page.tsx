import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { GatheringList } from '@/components/GatheringList';
import { PageShell } from '@/components/PageShell';
import { listGatherings } from '@/lib/db/gatherings';

export default async function GatheringsPage() {
  const gatherings = await listGatherings();

  return (
    <PageShell active="explore">
      <AppHeader
        variant="brand"
        action={
          <Link
            href="/gatherings/new"
            className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
            aria-label="모집글 작성"
          >
            <Plus className="size-5" />
          </Link>
        }
      />

      <div className="mx-4 mb-1 overflow-hidden rounded-[1.25rem] border border-primary/20 bg-primary-muted/60 px-4 py-3">
        <p className="text-sm font-bold text-foreground">탐색 · 동행 모집</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          함께할 사람을 모집하고, 댓글로 일정을 맞춰 보세요.
        </p>
      </div>

      <GatheringList gatherings={gatherings} />
    </PageShell>
  );
}
