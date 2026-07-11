'use client';

import {
  memberToProfilePerson,
  UserProfileSheet,
} from '@/components/UserProfileSheet';
import type { GatheringMemberProfile } from '@/lib/db/gathering-participants';

type Props = {
  member: GatheringMemberProfile | null;
  onClose: () => void;
};

/** 모집글 참여자 프로필 — 공통 UserProfileSheet 래퍼 */
export function MemberProfileSheet({ member, onClose }: Props) {
  const person = member ? memberToProfilePerson(member) : null;
  return <UserProfileSheet person={person} onClose={onClose} />;
}
