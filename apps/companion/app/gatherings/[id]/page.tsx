import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ChevronLeft, MapPin, Users } from 'lucide-react';
import { CommentSection } from '@/components/CommentSection';
import { PageShell } from '@/components/PageShell';
import { listComments } from '@/lib/db/comments';
import { getGatheringById } from '@/lib/db/gatherings';
import { getRegionDisplayName } from '@/lib/regions';

type Props = {
  params: Promise<{ id: string }>;
};

function formatGatheringDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export default async function GatheringDetailPage({ params }: Props) {
  const { id } = await params;
  const gathering = await getGatheringById(id);
  if (!gathering) notFound();

  const comments = await listComments('gathering', id);
  const dateLabel = formatGatheringDate(gathering.gathering_date);

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
          <h1 className="text-lg font-bold">모집글</h1>
        </div>
      </header>

      <article className="px-5 pb-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary-muted px-2 py-0.5 text-xs font-bold text-primary">
            {getRegionDisplayName(gathering.region)}
          </span>
          {gathering.status === 'closed' && (
            <span className="text-xs font-semibold text-muted-foreground">모집 마감</span>
          )}
        </div>
        <h2 className="mt-2 text-xl font-bold">{gathering.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{gathering.author_name}</p>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {gathering.description}
        </p>

        <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-sm">
          <p className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <span>
              {gathering.current_count} / {gathering.target_count}명 모집
            </span>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            {getRegionDisplayName(gathering.region)}
          </p>
          {dateLabel && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4" />
              {dateLabel}
            </p>
          )}
        </div>
      </article>

      <CommentSection
        targetType="gathering"
        targetId={gathering.id}
        initialComments={comments}
        loginReturnUrl={`/gatherings/${gathering.id}`}
      />
    </PageShell>
  );
}
