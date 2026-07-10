'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** 세일 배너 클릭 시 이동 경로 — 나중에 특정 상품 URL로 교체 */
export const SALE_BANNER_HREF = '/';

/** public/sale-banner.png — 파일만 교체하면 반영 */
export const SALE_BANNER_SRC = '/sale-banner.png';

type Props = {
  href?: string;
  className?: string;
};

export function SaleBanner({ href = SALE_BANNER_HREF, className }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={href}
      aria-label="세일 배너"
      className={cn('block w-full overflow-hidden bg-primary-muted', className)}
    >
      {failed ? (
        <div
          className="flex w-full items-center justify-center bg-gradient-to-br from-primary to-primary/70 px-6"
          style={{ aspectRatio: '3 / 1', minHeight: 96 }}
        >
          <p className="text-sm font-bold text-primary-foreground">공동구매 세일</p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- public 정적 배너는 img가 안정적
        <img
          src={SALE_BANNER_SRC}
          alt="세일 배너"
          className="block w-full object-cover"
          style={{ aspectRatio: '3 / 1', minHeight: 96 }}
          onError={() => setFailed(true)}
        />
      )}
    </Link>
  );
}
