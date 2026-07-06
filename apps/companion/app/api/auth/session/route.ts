import { NextResponse } from 'next/server';
import { getSessionUser, sessionUserToProfile } from '@/lib/auth/session';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: sessionUserToProfile(user) });
}
