'use client';

import Image from 'next/image';
import { InitialAvatar } from '@/components/InitialAvatar';
import { cn } from '@/lib/utils';

type Props = {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE_PX = {
  sm: 28,
  md: 40,
  lg: 56,
} as const;

const SIZE_CLASS = {
  sm: 'size-7',
  md: 'size-10',
  lg: 'size-14',
} as const;

/** 프로필 사진 또는 이니셜 아바타 */
export function UserAvatar({ name, avatarUrl, size = 'md', className }: Props) {
  const url = avatarUrl?.trim();
  if (!url) {
    return <InitialAvatar name={name} size={size} className={className} />;
  }

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full bg-muted',
        SIZE_CLASS[size],
        className,
      )}
    >
      <Image
        src={url}
        alt=""
        width={SIZE_PX[size]}
        height={SIZE_PX[size]}
        className="size-full object-cover"
        unoptimized
      />
    </span>
  );
}
