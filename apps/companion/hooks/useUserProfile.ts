'use client';

import { useCallback, useEffect, useState } from 'react';
import { clearUserProfile, type UserProfile } from '@/lib/user-profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setProfile(data.user ?? null);
    } catch {
      setProfile(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      clearUserProfile();
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, ready, loading, refresh, logout };
}
