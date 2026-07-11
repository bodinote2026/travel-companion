import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { countTotalUnread } from '@/lib/db/chat';

/** 하단 탭 뱃지용 전체 안 읽은 메시지 수 */
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await countTotalUnread(session.id);
    return NextResponse.json({ count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
}
