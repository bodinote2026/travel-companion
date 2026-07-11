import { NextResponse } from 'next/server';
import {
  getPeerLastReadAt,
  isRoomMember,
  listMessages,
  markRoomAsRead,
  sendMessage,
} from '@/lib/db/chat';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const profileId = searchParams.get('profileId');
  const since = searchParams.get('since');

  if (!roomId || !profileId) {
    return NextResponse.json({ error: 'roomId, profileId 필요' }, { status: 400 });
  }

  try {
    const allowed = await isRoomMember(roomId, profileId);
    if (!allowed) {
      return NextResponse.json({ error: '접근 권한 없음' }, { status: 403 });
    }

    const messages = await listMessages(roomId, since ? { since } : undefined);

    // 채팅방 열람 중이면 Last Read At 갱신
    await markRoomAsRead(roomId, profileId);
    const peerLastReadAt = await getPeerLastReadAt(roomId, profileId);

    return NextResponse.json({
      messages,
      peer_last_read_at: peerLastReadAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '메시지 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, senderId, body: text } = body as {
      roomId?: string;
      senderId?: string;
      body?: string;
    };

    if (!roomId || !senderId || !text?.trim()) {
      return NextResponse.json({ error: 'roomId, senderId, body 필요' }, { status: 400 });
    }

    const allowed = await isRoomMember(roomId, senderId);
    if (!allowed) {
      return NextResponse.json({ error: '접근 권한 없음' }, { status: 403 });
    }

    const message = await sendMessage({ roomId, senderId, body: text });
    return NextResponse.json({ message });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '전송 실패' },
      { status: 500 },
    );
  }
}
