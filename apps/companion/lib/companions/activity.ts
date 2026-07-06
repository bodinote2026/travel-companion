export type ActivityStatus = {
  label: string;
  active: boolean;
};

/** Location Updated At 기준 활동 상태. null이면 1시간 초과(표시 제외) */
export function getActivityStatus(locationUpdatedAt: string | null | undefined): ActivityStatus | null {
  if (!locationUpdatedAt) return null;

  const updated = new Date(locationUpdatedAt);
  if (Number.isNaN(updated.getTime())) return null;

  const minutes = (Date.now() - updated.getTime()) / 60_000;
  if (minutes > 60) return null;
  if (minutes <= 5) return { label: '지금 활동 중', active: true };

  return { label: `${Math.floor(minutes)}분 전 활동`, active: false };
}

export function isLocationFresh(locationUpdatedAt: string | null | undefined): boolean {
  return getActivityStatus(locationUpdatedAt) != null;
}
