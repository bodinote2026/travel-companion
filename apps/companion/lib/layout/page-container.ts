/** 앱 메인 컬럼 — 탭 페이지·상품 상세 등 공통 최대 폭 */
export const PAGE_MAX_WIDTH_CLASS = 'max-w-md';

/** PageShell / 독립 main 래퍼 */
export const PAGE_SHELL_CLASS = `relative mx-auto min-h-[100dvh] w-full min-w-0 overflow-x-clip ${PAGE_MAX_WIDTH_CLASS} bg-background`;

/** fixed 하단 크롬 — PageShell과 동일한 중앙 정렬 (inset-x-0 + w-full 조합 지양) */
export const PAGE_FIXED_LAYER_CLASS = `fixed bottom-0 left-1/2 z-30 w-full ${PAGE_MAX_WIDTH_CLASS} -translate-x-1/2`;

/** 표준 좌우 gutter (16px) — 헤더·본문·목록 */
export const PAGE_GUTTER_CLASS = 'px-4';
