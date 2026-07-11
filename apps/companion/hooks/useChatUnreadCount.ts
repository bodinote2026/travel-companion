'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';

const POLL_MS = 15_000;

/** 하단 탭용 안 읽은 채팅 메시지 수 */
export function useChatUnreadCount() {
  const { profile, ready } = useUserProfile();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!profile?.id) {
      setCount(0);
      return;
    }
    try {
      const res = await fetch('/api/chat/unread');
      const data = await res.json();
      if (typeof data.count === 'number') setCount(data.count);
    } catch {
      // 무시 — 다음 폴링에서 재시도
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!ready) return;
    void refresh();
    if (!profile?.id) return;

    const id = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    function onVisible() {
      if (document.visibilityState === 'visible') void refresh();
    }
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [ready, profile?.id, refresh]);

  return { count, refresh };
}
