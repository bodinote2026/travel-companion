/** Kakao Maps JS SDK 로더 (브라우저 전용) */

const SCRIPT_ID = 'kakao-maps-sdk';
const SDK_BASE = 'https://dapi.kakao.com/v2/maps/sdk.js';

declare global {
  interface Window {
    kakao?: KakaoMapsNamespace;
  }
}

export type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

export type KakaoMap = {
  setCenter: (latlng: KakaoLatLng) => void;
  panTo: (latlng: KakaoLatLng) => void;
  setLevel: (level: number, options?: { animate?: boolean }) => void;
  getLevel: () => number;
  relayout: () => void;
  addControl: (control: unknown, position: unknown) => void;
};

export type KakaoCustomOverlay = {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (latlng: KakaoLatLng) => void;
  setZIndex: (zIndex: number) => void;
};

export type KakaoMapsNamespace = {
  maps: {
    load: (callback: () => void) => void;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    Map: new (
      container: HTMLElement,
      options: { center: KakaoLatLng; level: number },
    ) => KakaoMap;
    CustomOverlay: new (options: {
      map?: KakaoMap | null;
      position: KakaoLatLng;
      content: HTMLElement | string;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
    }) => KakaoCustomOverlay;
    ZoomControl: new () => unknown;
    ControlPosition: { TOPRIGHT: unknown; RIGHT: unknown; BOTTOMRIGHT: unknown };
    event: {
      addListener: (target: unknown, type: string, handler: (...args: unknown[]) => void) => void;
    };
  };
};

function getAppKey(): string | null {
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY?.trim();
  return key || null;
}

/** 키 앞 4자만 노출 (진단용) */
export function getKakaoMapKeyHint(): string | null {
  const key = getAppKey();
  if (!key) return null;
  if (key.length <= 4) return `${key} (len ${key.length})`;
  return `${key.slice(0, 4)}… (len ${key.length})`;
}

export function isKakaoMapKeyConfigured(): boolean {
  return !!getAppKey();
}

function sdkUrl(appKey: string): string {
  return `${SDK_BASE}?appkey=${encodeURIComponent(appKey)}&autoload=false`;
}

/** script onerror만으로는 HTTP 상태를 못 받으므로 fetch로 원인 보강 */
async function diagnoseScriptFailure(url: string, host: string, keyHint: string): Promise<string> {
  const base = [
    `카카오맵 스크립트 로드 실패`,
    `키: ${keyHint}`,
    `도메인: ${host}`,
    `URL: ${url}`,
  ];

  try {
    const res = await fetch(url, { method: 'GET', mode: 'cors', cache: 'no-store' });
    const text = (await res.text()).slice(0, 280).replace(/\s+/g, ' ').trim();
    const looksLikeJs =
      text.includes('kakao') || text.includes('maps') || text.startsWith('(function');

    if (!res.ok) {
      return [
        ...base,
        `HTTP ${res.status} ${res.statusText || ''}`.trim(),
        text ? `응답: ${text}` : '응답 본문 없음',
        '→ JavaScript 키·Web 도메인 등록·카카오맵 활성화·재배포를 확인하세요.',
      ].join('\n');
    }

    if (!looksLikeJs) {
      return [
        ...base,
        `HTTP ${res.status} (본문이 JS가 아님)`,
        text ? `응답: ${text}` : '응답 본문 없음',
        '→ 앱키가 잘못되었거나 Web 도메인이 미등록일 수 있습니다.',
      ].join('\n');
    }

    return [
      ...base,
      `HTTP ${res.status} (본문은 JS로 보임)`,
      '→ CSP/광고차단/네트워크 차단 가능. 콘솔 Network 탭의 sdk.js를 확인하세요.',
    ].join('\n');
  } catch (fetchErr) {
    const detail =
      fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
    return [
      ...base,
      `진단 fetch 실패: ${detail}`,
      '→ CORS/네트워크/광고차단 또는 잘못된 앱키로 SDK가 거부됐을 수 있습니다.',
    ].join('\n');
  }
}

let loadPromise: Promise<KakaoMapsNamespace> | null = null;

/** SDK 스크립트 1회 로드 후 kakao.maps 사용 가능 */
export function loadKakaoMaps(): Promise<KakaoMapsNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Kakao Maps는 브라우저에서만 로드할 수 있습니다.'));
  }

  const appKey = getAppKey();
  const keyHint = getKakaoMapKeyHint() ?? '(없음)';
  const host = window.location.hostname;

  if (!appKey) {
    return Promise.reject(
      new Error(
        [
          'NEXT_PUBLIC_KAKAO_MAP_KEY가 빌드에 없습니다.',
          `도메인: ${host}`,
          '→ Vercel Production에 환경변수를 넣은 뒤 Redeploy 하세요. (NEXT_PUBLIC_*는 빌드 시 주입)',
        ].join('\n'),
      ),
    );
  }

  if (window.kakao?.maps?.LatLng) {
    return Promise.resolve(window.kakao);
  }

  if (loadPromise) return loadPromise;

  const url = sdkUrl(appKey);

  loadPromise = new Promise((resolve, reject) => {
    const fail = async (reason: string) => {
      loadPromise = null;
      const diagnosed =
        reason.startsWith('카카오맵 스크립트') || reason.includes('HTTP')
          ? reason
          : await diagnoseScriptFailure(url, host, keyHint).catch(() => reason);
      const message = diagnosed.includes(keyHint)
        ? diagnosed
        : `${diagnosed}\n키: ${keyHint}\n도메인: ${host}`;
      console.error('[KakaoMaps]', message);
      reject(new Error(message));
    };

    const finish = () => {
      const kakao = window.kakao;
      if (!kakao?.maps?.load) {
        void fail(
          [
            '스크립트는 로드됐지만 window.kakao.maps.load가 없습니다.',
            `키: ${keyHint}`,
            `도메인: ${host}`,
            '→ JavaScript 키인지, 카카오맵 서비스 활성화 여부를 확인하세요.',
          ].join('\n'),
        );
        return;
      }
      try {
        kakao.maps.load(() => {
          if (!window.kakao?.maps?.LatLng) {
            void fail(
              [
                'kakao.maps.load 콜백 후에도 LatLng가 없습니다.',
                `키: ${keyHint}`,
                `도메인: ${host}`,
              ].join('\n'),
            );
            return;
          }
          resolve(window.kakao);
        });
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        void fail(
          [
            `kakao.maps.load 호출 중 예외: ${detail}`,
            `키: ${keyHint}`,
            `도메인: ${host}`,
          ].join('\n'),
        );
      }
    };

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.kakao?.maps) {
        finish();
      } else {
        existing.addEventListener('load', finish, { once: true });
        existing.addEventListener(
          'error',
          () => {
            void fail('카카오맵 스크립트 로드 실패 (기존 script 태그 onerror)');
          },
          { once: true },
        );
      }
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    // 카카오가 Referer로 Web 도메인을 검증하므로 origin을 보냄
    script.referrerPolicy = 'strict-origin-when-cross-origin';
    script.src = url;
    script.onload = finish;
    script.onerror = () => {
      void fail('카카오맵 스크립트 로드 실패 (script.onerror)');
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
