'use client';

import { useState } from 'react';
import { MapPin, Shield } from 'lucide-react';
import {
  invokeGeolocationOnUserClick,
  type GeoPosition,
} from '@/lib/geo/browser-geolocation';

type Props = {
  onGranted: (position: GeoPosition) => void;
  onDecline: () => void;
  declinedBefore?: boolean;
};

export function LocationConsentBanner({ onGranted, onDecline, declinedBefore = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAllowClick() {
    setError(null);

    // 1. React 상태 변경 전 — getCurrentPosition 동기 호출 (iOS Safari 제스처 요건)
    const started = invokeGeolocationOnUserClick(
      (position) => {
        // 2. 성공 후 consent·위치 저장 (부모 콜백)
        setLoading(false);
        onGranted(position);
      },
      (message) => {
        setLoading(false);
        setError(message);
      },
    );

    if (started) setLoading(true);
  }

  return (
    <div className="fixed inset-0 z-[100] mx-auto max-w-md bg-black/40">
      <div className="absolute inset-x-0 bottom-20 px-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <Shield className="size-3.5" /> 위치 정보 이용 안내
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {declinedBefore
                  ? '내 주변 동행을 보려면 위치 접근이 필요합니다. 동의 후 브라우저 위치 허용 팝업이 표시됩니다.'
                  : '동행자와의 거리 표시를 위해 화면 사용 중 GPS 위치를 조회합니다. 백그라운드 추적은 하지 않습니다.'}
              </p>
              {error && (
                <p className="mt-2 text-xs leading-relaxed text-destructive">{error}</p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleAllowClick}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {loading ? '요청 중…' : '위치 허용하기'}
                </button>
                <button
                  type="button"
                  onClick={onDecline}
                  disabled={loading}
                  className="rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground disabled:opacity-60"
                >
                  나중에
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
