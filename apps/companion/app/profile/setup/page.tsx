import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { ProfileSetupPageClient } from '@/components/ProfileSetupPageClient';
import { PageShell } from '@/components/PageShell';

export default function ProfileSetupPage() {
  return (
    <PageShell active="profile" hideNav>
      <AppHeader title="프로필" subtitle="실명 · 연락처 · 자기소개" />
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ProfileSetupPageClient />
      </Suspense>
    </PageShell>
  );
}
