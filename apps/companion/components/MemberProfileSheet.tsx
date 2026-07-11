'use client';

import { useEffect } from 'react';
import { Loader2, MapPin, MessageCircle, X } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { useStartChat } from '@/hooks/useStartChat';
import type { GatheringMemberProfile } from '@/lib/db/gathering-participants';
import { getCategoryBadgeClass } from '@/lib/design-system';
import { interestToCategories } from '@/lib/companions/category-map';
import { getRegionDisplayName } from '@/lib/regions';
import { CATEGORY_LABELS } from '@/lib/regions/types';
import { cn } from '@/lib/utils';

type Props = {
  member: GatheringMemberProfile | null;
  onClose: () => void;
};

type ContentProps = {
  member: GatheringMemberProfile;
  onClose: () => void;
};

export function MemberProfileSheet({ member, onClose }: Props) {
  if (!member) return null;
  return <MemberProfileSheetContent member={member} onClose={onClose} />;
}

function MemberProfileSheetContent({ member, onClose }: ContentProps) {
  const { startChat, startingId, profileId } = useStartChat();
  const isSelf = !!profileId && profileId === member.user_id;
  const canChat = !isSelf && !!member.user_id;
  const busy = startingId === member.user_id;

  const categories = interestToCategories(member.interest_categories);
  const regionLabel = member.region ? getRegionDisplayName(member.region) : null;
  const bio = member.bio?.trim() || '';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleStartChat() {
    if (!canChat) return;
    const ok = await startChat({ peerProfileId: member.user_id });
    if (ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
      />

      <div className="relative mx-auto w-full max-w-md max-h-[86%] overflow-y-auto rounded-t-[2rem] border-t border-border bg-background pb-8 shadow-2xl">
        <div className="sticky top-0 flex justify-center bg-background/95 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-border" />
        </div>

        <div className="relative px-5 pt-2">
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="absolute right-5 top-2 flex size-9 items-center justify-center rounded-full bg-secondary"
          >
            <X className="size-4" />
          </button>

          <div className="flex flex-col items-center text-center">
            <UserAvatar
              name={member.name}
              avatarUrl={member.avatar_url}
              size="lg"
            />
            <h2 className="mt-3 text-xl font-bold">
              {member.name}
              {member.age != null && (
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  · {member.age}세
                </span>
              )}
            </h2>
            {(regionLabel || member.is_author) && (
              <p className="mt-1 flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted-foreground">
                {regionLabel && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {regionLabel}
                  </span>
                )}
                {member.is_author && (
                  <span className="rounded-full bg-primary-muted px-2 py-0.5 text-micro font-semibold text-primary">
                    작성자
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="mx-5 mt-5">
          <h3 className="text-sm font-semibold">자기소개</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
            {bio || '아직 자기소개가 없어요.'}
          </p>
        </div>

        {categories.length > 0 && (
          <div className="mx-5 mt-4">
            <h3 className="text-sm font-semibold">관심 카테고리</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={cn(
                    'rounded-md px-2 py-1 text-xs font-semibold',
                    getCategoryBadgeClass(cat),
                  )}
                >
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && member.interest_categories.length > 0 && (
          <div className="mx-5 mt-4">
            <h3 className="text-sm font-semibold">관심 카테고리</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {member.interest_categories.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {canChat && (
          <div className="mx-5 mt-6">
            <button
              type="button"
              disabled={busy}
              onClick={handleStartChat}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-semibold text-primary-foreground disabled:opacity-70"
            >
              {busy ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <MessageCircle className="size-5" />
              )}
              채팅 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
