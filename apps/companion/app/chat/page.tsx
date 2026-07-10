import { PageShell } from '@/components/PageShell';
import { ChatRoomList } from '@/components/ChatRoomList';

/** 채팅 UI는 보존 (하단 탭에서는 제거됨) */
export default function ChatPage() {
  return (
    <PageShell hideNav>
      <header className="px-4 pb-3 pt-12">
        <h1 className="text-lg font-bold">채팅</h1>
        <p className="text-xs text-muted-foreground">동행자와 1:1 대화</p>
      </header>
      <ChatRoomList />
    </PageShell>
  );
}
