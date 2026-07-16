'use client';

import { useState } from 'react';
import { PAGE_GUTTER_CLASS } from '@/lib/layout/page-container';
import { cn } from '@/lib/utils';

export function SiteFooter() {
  const [expanded, setExpanded] = useState(false);

  return (
    <footer className={cn(PAGE_GUTTER_CLASS, 'py-2.5 text-center')}>
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-controls="business-info"
        className="text-micro text-muted-foreground/75 transition-colors hover:text-muted-foreground"
      >
        앤유코리아 사업자 정보{' '}
        <span aria-hidden className="inline-block w-3">
          {expanded ? '△' : '▽'}
        </span>
      </button>

      {expanded && (
        <div
          id="business-info"
          className="mt-2 space-y-0.5 text-micro leading-relaxed text-muted-foreground/75"
        >
          <p>상호명: 앤유코리아 | 사업자등록번호: 662-05-01404 | 대표: 최문석</p>
          <p>소재지주소: 서울 마포구 새창로 11 (도화동)</p>
        </div>
      )}

      <p className="mt-1.5 text-micro text-muted-foreground/60">
        Copyright © 앤유코리아. All rights reserved.
      </p>
    </footer>
  );
}
