'use client';

import { ShoppingBag, User, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export type NavTab = 'gatherings' | 'group-buy' | 'profile';

type Props = {
  active?: NavTab;
  onChange?: (tab: NavTab) => void;
  /** BottomChrome 내부에서 사용 시 fixed 스타일 제거 */
  embedded?: boolean;
};

const TABS: {
  id: NavTab;
  label: string;
  icon: typeof ShoppingBag;
  href: string;
}[] = [
  { id: 'gatherings', label: '동행 모집', icon: UsersRound, href: '/gatherings' },
  { id: 'group-buy', label: '공동구매', icon: ShoppingBag, href: '/group-buy' },
  { id: 'profile', label: '내 프로필', icon: User, href: '/mypage' },
];

export function BottomNav({ active, embedded }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        embedded
          ? 'px-2 pb-5 pt-1'
          : 'fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-border bg-background/95 px-2 pb-5 pt-2 backdrop-blur',
      )}
    >
      <div className="flex items-center justify-around">
        {TABS.map(({ id, label, icon: Icon, href }) => {
          const selected =
            active === id ||
            pathname === href ||
            pathname.startsWith(`${href}/`);
          return (
            <Link key={id} href={href} className="flex flex-col items-center gap-0.5 px-2 py-1">
              <Icon className={cn('size-5', selected && 'text-primary')} />
              <span
                className={cn(
                  'text-micro font-medium',
                  selected ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
