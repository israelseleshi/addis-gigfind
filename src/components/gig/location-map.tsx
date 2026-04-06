"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ADDIS_CENTER: [number, number] = [9.005, 38.757];

interface LocationMapProps {
  selectedCoords: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
  center?: [number, number] | null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e: L.LeafletMouseEvent) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterMap({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  return null;
}

function createCustomIcon() {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: #f59e0b; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function LocationMap({ selectedCoords, onLocationSelect, center }: LocationMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mapCenter = center || ADDIS_CENTER;

  if (!mounted) {
    return (
      <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
        <span className="text-gray-400">Loading map...</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={12}
      className="h-full w-full"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onLocationSelect={onLocationSelect} />
      <RecenterMap center={selectedCoords ? [selectedCoords.lat, selectedCoords.lng] : (center ?? null)} />
      {selectedCoords && (
        <Marker
          position={[selectedCoords.lat, selectedCoords.lng]}
          icon={createCustomIcon()}
        />
      )}
    </MapContainer>
  );
}