import { NextResponse } from 'next/server';
import { reconcileAllGatheringParticipantCounts } from '@/lib/db/gatherings';

/**
 * 기존 모집글 Current Count 일괄 보정.
 * Gathering_Participants(applied) 중 동행지기(Author)를 제외한 인원으로 맞춘다.
 *
 * POST /api/admin/reconcile-gathering-counts
 */
export async function POST() {
  try {
    const result = await reconcileAllGatheringParticipantCounts();
    return NextResponse.json({
      success: true,
      ...result,
      message:
        result.updated > 0
          ? `${result.checked}건 확인, ${result.updated}건 Current Count 보정 완료.`
          : `${result.checked}건 확인, 보정할 항목 없음.`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '보정 실패' },
      { status: 500 }
    );
  }
}
