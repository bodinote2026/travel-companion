'use client';

import { useCallback, useEffect, useState } from 'react';
import type { NearbyUserDto } from '@/lib/companions/build-list';
import { DEFAULT_REGION_CODE } from '@/lib/regions';

const REFRESH_MS = 90_000;

export function useNearbyUsers(enabled: boolean) {
  const [users, setUsers] = useState<NearbyUserDto[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/nearby?region=${encodeURIComponent(DEFAULT_REGION_CODE)}`);
      if (res.status === 401) {
        setUsers([]);
        return;
      }
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setUsers([]);
      return;
    }

    refresh();
    const id = window.setInterval(refresh, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [enabled, refresh]);

  return { users, loading, refresh };
}
