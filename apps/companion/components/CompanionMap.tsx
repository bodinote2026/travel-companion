'use client';

import Image from 'next/image';
import { Navigation } from 'lucide-react';
import type { CompanionListItem } from '@/lib/companions/types';
import type { RegionSpot } from '@/lib/regions/types';
import { bearingDegrees, latLngToMapPercent, temperatureLabel } from '@/lib/geo';
import { cn } from '@/lib/utils';

type Props = {
  companions: CompanionListItem[];
  spots: RegionSpot[];
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  userLat?: number;
  userLng?: number;
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function CompanionMap({
  companions,
  spots,
  centerLat,
  centerLng,
  radiusKm,
  userLat,
  userLng,
  activeId,
  onSelect,
}: Props) {
  const originLat = userLat ?? centerLat;
  const originLng = userLng ?? centerLng;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/map-bg.png"
        alt="묵호 위치 주변 지도"
        fill
        priority
        className="object-cover"
        sizes="430px"
      />
      <div className="absolute inset-0 bg-background/10" />

      {spots.map((spot) => {
        const pos = latLngToMapPercent(spot.lat, spot.lng, centerLat, centerLng, radiusKm);
        return (
          <span
            key={spot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm backdrop-blur"
            style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
          >
            {spot.name}
          </span>
        );
      })}

      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ top: '44%', left: '50%' }}
      >
        <span className="absolute inset-0 -m-4 animate-ping rounded-full bg-primary/30" />
        <span className="relative flex size-5 items-center justify-center rounded-full border-2 border-background bg-primary shadow-lg">
          <Navigation className="size-2.5 fill-primary-foreground text-primary-foreground" />
        </span>
      </div>

      {companions.map((c) => {
        const pos = latLngToMapPercent(c.lat, c.lng, centerLat, centerLng, radiusKm);
        const active = c.id === activeId;

        if (c.kind === 'real') {
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              aria-label={`${c.name}${c.activityActive ? ', 지금 활동 중' : ''}`}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-full transition-transform duration-200 hover:scale-105',
                active ? 'z-20 scale-110' : 'z-10',
              )}
              style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
            >
              <span
                className={cn(
                  'relative flex size-8 items-center justify-center rounded-full border-2 border-background text-[11px] font-bold shadow-md',
                  c.activityActive ? 'bg-emerald-500 text-white' : 'bg-card text-foreground',
                )}
              >
                {c.name.slice(0, 1)}
                {c.activityActive && (
                  <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border border-background bg-emerald-400" />
                )}
              </span>
            </button>
          );
        }

        const angle = bearingDegrees(originLat, originLng, c.lat, c.lng);
        const tone = temperatureLabel(c.temperature ?? 0);

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            aria-label={`${c.name}, 방향 ${angle.toFixed(1)}°`}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-full transition-transform duration-200 hover:scale-105',
              active ? 'z-20 scale-110' : 'z-10',
            )}
            style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
          >
            <span
              className="block rounded-full border-2 border-background px-2 py-1 text-[10px] font-bold shadow-md"
              style={{ backgroundColor: tone.color, color: 'white' }}
            >
              {angle.toFixed(1)}°
            </span>
          </button>
        );
      })}
    </div>
  );
}
