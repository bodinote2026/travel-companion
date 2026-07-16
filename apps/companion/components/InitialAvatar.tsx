import { cn } from '@/lib/utils';

const AVATAR_TONES = [
  'bg-[#F3E0D0] text-[#B85C38]',
  'bg-[#F8D9D0] text-[#C44B3A]',
  'bg-[#E8E4F5] text-[#6B5B95]',
  'bg-[#DCEEE6] text-[#3D7A66]',
  'bg-[#F5E6C8] text-[#9A6B2D]',
] as const;

function toneForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length;
  }
  return AVATAR_TONES[hash] ?? AVATAR_TONES[0];
}

type Props = {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE_CLASS = {
  xs: 'size-5 text-[10px]',
  sm: 'size-7 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-xl',
} as const;

/** 사진 없이 이름 첫 글자로 표시하는 원형 아바타 */
export function InitialAvatar({ name, size = 'md', className }: Props) {
  const initial = name.trim().charAt(0) || '?';
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        SIZE_CLASS[size],
        toneForName(name.trim() || '?'),
        className,
      )}
    >
      {initial}
    </span>
  );
}
