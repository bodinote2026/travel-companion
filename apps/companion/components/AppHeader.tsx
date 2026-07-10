import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  /** brand: 로고 + 슬로건 (공동구매 메인). page: 일반 페이지 헤더 */
  variant?: 'brand' | 'page';
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
  className?: string;
};

export function AppHeader({
  variant = 'page',
  title,
  subtitle,
  backHref,
  backLabel = '뒤로',
  action,
  className,
}: Props) {
  if (variant === 'brand') {
    return (
      <header
        className={cn('flex items-center gap-3 px-4 pb-3 pt-12', className)}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="동행"
            width={36}
            height={36}
            className="size-9 shrink-0 object-contain"
            priority
          />
          <h1 className="truncate text-lg font-bold leading-tight tracking-tight">
            함께할 사람을 찾다
          </h1>
        </div>
        {action}
      </header>
    );
  }

  return (
    <header className={cn('flex items-center gap-3 px-4 pb-3 pt-12', className)}>
      {backHref ? (
        <Link
          href={backHref}
          aria-label={backLabel}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card"
        >
          <ChevronLeft className="size-5" />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? <h1 className="text-lg font-bold">{title}</h1> : null}
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
