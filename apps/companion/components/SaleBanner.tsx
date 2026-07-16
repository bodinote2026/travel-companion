'use client';

import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** 세일 배너 클릭 시 이동 경로 — 나중에 특정 상품 URL로 교체 */
export const SALE_BANNER_HREF = '/group-buy';

/** public/sale-banner.png — 파일만 교체하면 반영 */
export const SALE_BANNER_SRC = '/sale-banner.png';

/** sale-banner.png 원본 픽셀 비율 (1898×829 ≈ 2.29:1) */
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
