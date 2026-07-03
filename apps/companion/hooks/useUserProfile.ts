'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadUserProfile, saveUserProfile, type UserProfile } from '@/lib/user-profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProfile(loadUserProfile());
    setReady(true);
  }, []);

  const updateProfile = useCallback((next: UserProfile) => {
    saveUserProfile(next);
    setProfile(next);
  }, []);

  return { profile, ready, updateProfile };
}
