'use client';

import { Loader2 } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import { useStartChat } from '@/hooks/useStartChat';
import { cn } from '@/lib/utils';

type Props = {
  authorId?: string | null;
  authorName: string;
  authorAvatarUrl?: string | null;
  companionSeedId?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** 이름도 함께 표시 */
  showName?: boolean;
  nameClassName?: string;
};

/** 작성자 아바타 클릭 → 해당 유저와 1:1 채팅 */
export function AuthorChatAvatar({
  authorId,
  authorName,
  authorAvatarUrl,
  companionSeedId,
  size = 'sm',
  className,
  showName = false,
  nameClassName,
}: Props) {
  const { startChat, startingId, profileId } = useStartChat();
  const canChat =
    (!!authorId && authorId !== profileId) || !!companionSeedId?.trim();
  const busy =
    startingId != null &&
    (startingId === authorId || startingId === companionSeedId);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!canChat || busy) return;
    await startChat({
      peerProfileId: authorId ?? undefined,
      companionSeedId: companionSeedId ?? undefined,
    });
  }

  const avatar = (
    <span className="relative inline-flex">
      <UserAvatar name={authorName} avatarUrl={authorAvatarUrl} size={size} />
      {busy && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
          <Loader2 className="size-3.5 animate-spin text-primary" />
        </span>
      )}
    </span>
  );

  if (!canChat) {
    return (
      <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
        {avatar}
        {showName && (
          <span className={cn('truncate text-xs font-medium', nameClassName)}>
            {authorName}
          </span>
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={`${authorName}님과 채팅하기`}
      className={cn(
        'inline-flex min-w-0 items-center gap-2 rounded-full text-left transition-opacity hover:opacity-80 disabled:opacity-70',
        className,
      )}
    >
      {avatar}
      {showName && (
        <span className={cn('truncate text-xs font-medium', nameClassName)}>
          {authorName}
        </span>
      )}
    </button>
  );
}
