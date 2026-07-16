import { PAGE_GUTTER_CLASS } from '@/lib/layout/page-container';
import { cn } from '@/lib/utils';

type Props = React.ComponentProps<'div'>;

/** PageShell 안쪽 콘텐츠 — 좌우 padding을 한 곳에서 관리 */
export function PageGutter({ className, children, ...props }: Props) {
  return (
    <div className={cn(PAGE_GUTTER_CLASS, className)} {...props}>
      {children}
    </div>
  );
}
