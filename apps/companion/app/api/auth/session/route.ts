import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/airtable/users';
import { getSessionUser, sessionUserToProfile } from '@/lib/auth/session';
import { airtableUserToUserProfile } from '@/lib/profile/transform';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  try {
    const airtableUser = await getUserById(user.id);
    if (airtableUser) {
      return NextResponse.json({ user: airtableUserToUserProfile(airtableUser) });
    }
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json({ user: sessionUserToProfile(user) });
}
