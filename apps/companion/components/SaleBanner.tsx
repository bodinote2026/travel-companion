'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** public/sale-banner-v2.png — 교체 시 파일명 변경으로 캐시 무효화 */
export const SALE_BANNER_SRC = '/sale-banner-v2.png';
export const SALE_BANNER_HREF = '/group-buy';
const SALE_BANNER_ASPECT_RATIO = '1898 / 829';

type Props = {
  href?: string;
  className?: string;
};

/**
 * PageGutter 안에서 사용 — 좌우 inset은 부모 gutter가 담당.
 * 원본 비율 유지 + img가 영역을 꽉 채워 여백 없음.
 */
export function SaleBanner({ href = SALE_BANNER_HREF, className }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={href}
      aria-label="세일 배너"
      className={cn('block w-full max-w-full overflow-hidden rounded-[1.25rem]', className)}
    >
      {failed ? (
        <div
          className="flex w-full items-center justify-center bg-gradient-to-br from-primary to-primary/70 px-6"
          style={{ aspectRatio: SALE_BANNER_ASPECT_RATIO }}
        >
          <p className="text-sm font-bold text-primary-foreground">공동구매 세일</p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- public 정적 배너는 img가 안정적
        <img
          src={SALE_BANNER_SRC}
          alt="세일 배너"
          width={1898}
          height={829}
          className="block h-auto w-full max-w-full"
          onError={() => setFailed(true)}
        />
      )}
    </Link>
  );
}
