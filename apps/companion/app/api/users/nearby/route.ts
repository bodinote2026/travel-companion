import { NextResponse } from 'next/server';
import { listNearbyActiveUsers } from '@/lib/airtable/users';
import { getSessionUser } from '@/lib/auth/session';
import { DEFAULT_REGION_CODE } from '@/lib/regions';

export async function GET(request: Request) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const region = searchParams.get('region') ?? session.region ?? DEFAULT_REGION_CODE;

  try {
    const users = await listNearbyActiveUsers(region, session.id);
    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        age: u.age,
        bio: u.bio,
        interest_categories: u.interestCategories,
        latitude: u.latitude,
        longitude: u.longitude,
        location_updated_at: u.locationUpdatedAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '주변 동행자 조회 실패' },
      { status: 500 },
    );
  }
}
