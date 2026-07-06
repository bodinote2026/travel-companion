import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ProfileSetupPageClient } from '@/components/ProfileSetupPageClient';
import { PageShell } from '@/components/PageShell';

export default function ProfileSetupPage() {
  return (
    <PageShell active="profile" hideNav>
      <header className="px-4 pb-2 pt-12">
        <h1 className="text-lg font-bold">프로필</h1>
        <p className="text-xs text-muted-foreground">자기소개 · 관심 카테고리</p>
      </header>
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
