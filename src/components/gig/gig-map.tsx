"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { getCoordinatesFromLocation } from "@/components/gig/location-picker";

interface Gig {
  id: string;
  title: string;
  location: string;
  budget: number | null;
  category: string;
}

interface GigMapProps {
  gigs: Gig[];
  center?: [number, number] | null;
  zoom?: number;
}

const ADDIS_CENTER: [number, number] = [9.005, 38.757];

export function GigMap({ gigs, center = null, zoom = 12 }: GigMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Loading map...</span>
      </div>
    );
  }

  const mapCenter = center || ADDIS_CENTER;

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      className="h-[400px] w-full rounded-lg overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {gigs.map((gig) => {
        const coords = getCoordinatesFromLocation(gig.location);
        
        if (!coords) return null;
        
        return (
          <Marker
            key={gig.id}
            position={[coords.lat, coords.lng]}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-semibold text-sm">{gig.title}</h3>
                <p className="text-xs text-gray-600">{gig.location}</p>
                <p className="text-xs font-bold text-amber-600">
                  {gig.budget ? `${gig.budget} ETB` : 'Negotiable'}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}