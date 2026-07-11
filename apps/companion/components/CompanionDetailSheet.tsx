'use client';

import {
  companionToProfilePerson,
  UserProfileSheet,
} from '@/components/UserProfileSheet';
import type { CompanionListItem } from '@/lib/companions/types';

type Props = {
  companion: CompanionListItem | null;
  onClose: () => void;
  /** 위치 없을 때 거리 숨김 */
  showDistance?: boolean;
};

/** 지도 탭 동행 프로필 — 공통 UserProfileSheet 래퍼 */
export function CompanionDetailSheet({
  companion,
  onClose,
  showDistance = true,
}: Props) {
  const person = companion
    ? companionToProfilePerson(companion, { showDistance })
    : null;

  return <UserProfileSheet person={person} onClose={onClose} />;
}
