import type { NavTab } from '@/components/BottomNav';
import { BottomNav } from '@/components/BottomNav';

type Props = {
  children: React.ReactNode;
  active: NavTab;
};

export function PageShell({ children, active }: Props) {
  return (
    <div className="relative mx-auto min-h-[100dvh] max-w-md bg-background">
      {children}
      <BottomNav active={active} />
    </div>
  );
}
