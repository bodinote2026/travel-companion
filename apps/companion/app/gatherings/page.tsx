import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { GatheringList } from '@/components/GatheringList';
import { PageShell } from '@/components/PageShell';
import { listGatherings } from '@/lib/db/gatherings';

export default async function GatheringsPage() {
  const gatherings = await listGatherings();

  return (
    <PageShell active="gatherings">
      <AppHeader
        title="동행 모집"
        subtitle="함께할 사람을 모집해 보세요"
        action={
          <Link
            href="/gatherings/new"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-primary"
            aria-label="모집글 작성"
          >
            <Plus className="size-5" />
          </Link>
        }
      />

      <GatheringList gatherings={gatherings} />
    </PageShell>
  );
}
