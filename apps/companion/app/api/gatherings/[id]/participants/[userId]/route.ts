import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  ApplyGatheringError,
  removeGatheringParticipantByHost,
} from '@/lib/db/gathering-participants';

type Props = {
  params: Promise<{ id: string; userId: string }>;
};

/** 동행지기가 특정 참여자 신청 취소 */
export async function DELETE(_request: Request, { params }: Props) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id, userId } = await params;
    const result = await removeGatheringParticipantByHost({
      gatheringId: id,
      hostUserId: session.id,
      participantUserId: decodeURIComponent(userId),
    });

    return NextResponse.json({
      gathering: result.gathering,
      message: '참여자를 취소했습니다.',
    });
  } catch (error) {
    console.error(error);
    if (error instanceof ApplyGatheringError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '참여자 취소 실패' },
      { status: 500 },
    );
  }
}
