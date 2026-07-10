import { NextResponse } from 'next/server';
import { getGatheringById } from '@/lib/db/gatherings';

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const gathering = await getGatheringById(id);
    if (!gathering) {
      return NextResponse.json({ error: '모집글을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ gathering });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '모집글 조회 실패' },
      { status: 500 },
    );
  }
}
