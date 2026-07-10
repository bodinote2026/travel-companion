import { cn } from '@/lib/utils';

/** Scroll content padding above fixed BottomChrome (collapsed footer + elevated center tab). */
export function bottomChromePaddingClass(hideNav?: boolean) {
  return cn(hideNav ? 'pb-24' : 'pb-40');
}
