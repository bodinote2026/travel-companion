import { redirect } from 'next/navigation';

/** 메인 첫 화면 = 공동구매 */
export default function HomePage() {
  redirect('/group-buy');
}
