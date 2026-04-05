"use client";

import { MapPin } from "lucide-react";

interface DistanceBadgeProps {
  distance: number | null;
  showLabel?: boolean;
}

export function DistanceBadge({ distance, showLabel = true }: DistanceBadgeProps) {
  if (distance === null || distance === undefined) {
    return null;
  }

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    if (km < 10) {
      return `${km.toFixed(1)}km`;
    }
    return `${Math.round(km)}km`;
  };

  return (
    <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
      <MapPin className="w-3 h-3" />
      <span className="font-medium">{formatDistance(distance)}</span>
      {showLabel && <span className="text-amber-500">away</span>}
    </div>
  );
}