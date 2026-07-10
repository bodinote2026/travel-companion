'use client';

import { useCallback, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';

type StartChatInput = {
  peerProfileId?: string;
  companionSeedId?: string;
};

/** 1:1 채팅방 생성/재사용 후 이동 */
export function useStartChat() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, ready } = useUserProfile();
  const [startingId, setStartingId] = useState<string | null>(null);

  const startChat = useCallback(
    async (input: StartChatInput): Promise<boolean> => {
      const peerProfileId = input.peerProfileId?.trim();
      const companionSeedId = input.companionSeedId?.trim();
      if (!peerProfileId && !companionSeedId) return false;

      if (!ready) return false;

      if (!profile?.id) {
        router.push(`/login?returnUrl=${encodeURIComponent(pathname || '/')}`);
        return false;
      }

      if (peerProfileId && peerProfileId === profile.id) {
        return false;
      }

      const key = peerProfileId || companionSeedId || '';
      setStartingId(key);
      try {
        const res = await fetch('/api/chat/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            myProfileId: profile.id,
            ...(peerProfileId ? { peerProfileId } : {}),
            ...(companionSeedId ? { companionSeedId } : {}),
            ...(profile.region ? { region: profile.region } : {}),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? '채팅방 생성 실패');
        router.push(`/chat/${data.room.id}`);
        return true;
      } catch (err) {
        alert(err instanceof Error ? err.message : '채팅을 시작할 수 없습니다.');
        return false;
      } finally {
        setStartingId(null);
      }
    },
    [pathname, profile, ready, router],
  );

  return { startChat, startingId, profileId: profile?.id ?? null, ready };
}
