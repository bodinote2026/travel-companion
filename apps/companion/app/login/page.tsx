import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { LoginForm } from '@/components/LoginForm';
import { PageShell } from '@/components/PageShell';

export default function LoginPage() {
  return (
    <PageShell hideNav>
      <AppHeader
        title="로그인"
        subtitle="이름 · 연락처 또는 카카오 로그인"
        backHref="/"
        backLabel="홈으로"
      />
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </PageShell>
  );
}
