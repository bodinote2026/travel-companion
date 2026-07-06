'use client';

import { useEffect, useRef } from 'react';
import type { GeoPosition } from '@/hooks/useGeolocation';

export function useLocationReporter(position: GeoPosition | null, enabled: boolean) {
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !position) return;

    const key = `${position.lat.toFixed(5)},${position.lng.toFixed(5)}`;
    if (lastSent.current === key) return;
    lastSent.current = key;

    fetch('/api/profile/location', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: position.lat, lng: position.lng }),
    }).catch(() => {
      lastSent.current = null;
    });
  }, [enabled, position]);
}
