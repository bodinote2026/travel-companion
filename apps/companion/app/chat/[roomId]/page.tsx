import { PageShell } from '@/components/PageShell';
import { ChatRoomView } from '@/components/ChatRoomView';

type Props = {
  params: Promise<{ roomId: string }>;
};

/** 채팅 UI는 보존 (하단 탭에서는 제거됨) */
export default async function ChatRoomPage({ params }: Props) {
  const { roomId } = await params;

  return (
    <PageShell hideNav>
      <ChatRoomView roomId={roomId} />
    </PageShell>
  );
}
