import { PageShell } from '@/components/PageShell';
import { InquiryForm } from '@/components/InquiryForm';

export default function ChatPage() {
  return (
    <PageShell active="chat">
      <header className="px-4 pb-2 pt-12">
        <h1 className="text-lg font-bold">문의하기</h1>
        <p className="text-xs text-muted-foreground">동행·공동구매 관련 문의를 남겨주세요</p>
      </header>
      <InquiryForm />
    </PageShell>
  );
}
