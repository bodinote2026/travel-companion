import { redirect } from 'next/navigation';

/** 하위 호환 — 동행찾기 메인은 `/` */
export default function GatheringsIndexPage() {
  redirect('/');
}
