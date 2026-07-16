import type { NavTab } from '@/components/BottomNav';
import { BottomChrome } from '@/components/BottomChrome';
import { bottomChromePaddingClass } from '@/lib/bottom-chrome';
import { PAGE_SHELL_CLASS } from '@/lib/layout/page-container';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  active?: NavTab;
  hideNav?: boolean;
};

export function PageShell({ children, active, hideNav }: Props) {
  return (
    <div
      className={cn(PAGE_SHELL_CLASS, bottomChromePaddingClass(hideNav))}
    >
      {children}
      <BottomChrome active={active} hideNav={hideNav} />
    </div>
  );
}
