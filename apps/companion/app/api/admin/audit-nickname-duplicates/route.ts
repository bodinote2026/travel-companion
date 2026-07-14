import { NextResponse } from 'next/server';
import { findDuplicateNicknameGroups } from '@/lib/airtable/users';

/**
 * 기존 Users Nickname 중복 점검.
 * POST /api/admin/audit-nickname-duplicates
 */
export async function POST() {
  try {
    const groups = await findDuplicateNicknameGroups();
    return NextResponse.json({
      success: true,
      duplicateGroupCount: groups.length,
      groups,
      message:
        groups.length > 0
          ? `중복 닉네임 그룹 ${groups.length}건`
          : '중복 닉네임 없음',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '점검 실패' },
      { status: 500 },
    );
  }
}
