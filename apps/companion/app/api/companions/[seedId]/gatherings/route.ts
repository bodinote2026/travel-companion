import { NextResponse } from 'next/server';
import { getAirtableConfig } from '@/lib/airtable/config';
import { findUserByCompanionSeedId } from '@/lib/airtable/users';
import { listUserGatherings } from '@/lib/db/gathering-participants';

type Props = {
  params: Promise<{ seedId: string }>;
};

/** companion seed 기준 참여 동행 목록 (유저 없으면 빈 배열) */
export async function GET(_request: Request, { params }: Props) {
  try {
    const { seedId: raw } = await params;
    const seedId = decodeURIComponent(raw ?? '').trim();
    if (!seedId) {
      return NextResponse.json({ error: 'seedId가 필요합니다.' }, { status: 400 });
    }

    if (!getAirtableConfig()) {
      return NextResponse.json({ gatherings: [] });
    }

    const user = await findUserByCompanionSeedId(seedId);
    if (!user) {
      return NextResponse.json({ gatherings: [], userId: null });
    }

    const gatherings = await listUserGatherings(user.id);
    return NextResponse.json({ gatherings, userId: user.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '참여 동행 조회 실패' },
      { status: 500 },
    );
  }
}
