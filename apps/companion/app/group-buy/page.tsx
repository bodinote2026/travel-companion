import { redirect } from 'next/navigation';

/** 하위 호환 — 공동구매 메인은 `/` */
export default function GroupBuyPage() {
  redirect('/');
}
