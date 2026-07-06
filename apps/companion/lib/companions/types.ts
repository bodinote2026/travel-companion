import type { CompanionCategory } from '@/lib/regions/types';

export type CompanionKind = 'mock' | 'real';

export type CompanionListItem = {
  id: string;
  kind: CompanionKind;
  name: string;
  age: number | null;
  categories: CompanionCategory[];
  primaryCategory: CompanionCategory;
  avatar: string | null;
  temperature: number | null;
  headline: string;
  bio: string;
  tags: string[];
  lat: number;
  lng: number;
  area: string;
  distanceKm: number;
  activityLabel?: string;
  activityActive?: boolean;
  matches?: number;
  responseRate?: number;
  peerProfileId?: string;
  companionSeedId?: string;
};
