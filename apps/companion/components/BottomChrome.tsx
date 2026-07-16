'use client';

import type { NavTab } from '@/components/BottomNav';
import { BottomNav } from '@/components/BottomNav';
import { SiteFooter } from '@/components/SiteFooter';
import { PAGE_FIXED_LAYER_CLASS } from '@/lib/layout/page-container';
import { cn } from '@/lib/utils';

type Props = {
  active?: NavTab;
  hideNav?: boolean;
  onNavChange?: (tab: NavTab) => void;
};

export function BottomChrome({ active, hideNav, onNavChange }: Props) {
  return (
    <div
      className={cn(
        PAGE_FIXED_LAYER_CLASS,
        'border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90',
      )}
    >
      <SiteFooter />
      {!hideNav && <BottomNav active={active} onChange={onNavChange} embedded />}
    </div>
  );
}
