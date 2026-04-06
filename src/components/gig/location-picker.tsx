"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { MapPin, Navigation, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LocationMap = dynamic(
  () => import("@/components/gig/location-map").then((mod) => mod.LocationMap),
  { ssr: false }
);

interface LocationOption {
  value: string;
  label: string;
  lat: number;
  lng: number;
}

const ADDIS_ABABA_LOCATIONS: LocationOption[] = [
  { value: "bole", label: "Bole", lat: 8.9917, lng: 38.7578 },
  { value: "kazanchis", label: "Kazanchis", lat: 9.0053, lng: 38.7631 },
  { value: "piassa", label: "Piassa", lat: 9.0102, lng: 38.7503 },
  { value: "addis_ketema", label: "Addis Ketema", lat: 9.0278, lng: 38.7319 },
  { value: "gulele", label: "Gulele", lat: 9.0402, lng: 38.7125 },
  { value: "yeka", label: "Yeka", lat: 9.0522, lng: 38.7583 },
  { value: "arada", label: "Arada", lat: 9.0185, lng: 38.7447 },
  { value: "nifas_silk", label: "Nifas Silk", lat: 8.9789, lng: 38.7892 },
  { value: "lekunda", label: "Lekunda", lat: 9.0156, lng: 38.7728 },
  { value: "megenagna", label: "Megenagna", lat: 9.0083, lng: 38.7756 },
  { value: "sarbet", label: "Sarbet", lat: 8.9822, lng: 38.7697 },
  { value: "cmc", label: "CMC", lat: 9.0328, lng: 38.7469 },
  { value: "ayrer", label: "Ayrer", lat: 8.9967, lng: 38.7397 },
  { value: "gerbi", label: "Gerbi", lat: 9.0067, lng: 38.7544 },
  { value: "mexico", label: "Mexico", lat: 9.0267, lng: 38.7319 },
  { value: "kality", label: "Kality", lat: 8.9567, lng: 38.7833 },
];

const ADDIS_CENTER: [number, number] = [9.005, 38.757];

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: string, lat: number, lng: number) => void;
  selectedLocation: string;
}

export function LocationPicker({ onLocationSelect, selectedLocation }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedOption = ADDIS_ABABA_LOCATIONS.find((l) => l.value === selectedLocation);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedCoords({ lat, lng });
    setMapCenter([lat, lng]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setMapCenter(null);
  };

  const handleConfirmLocation = () => {
    if (!selectedCoords) return;
    
    onLocationSelect("current", selectedCoords.lat, selectedCoords.lng);
    setIsOpen(false);
    setSelectedCoords(null);
    setMapCenter(null);
  };

  const detectCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setDetecting(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDetectedLocation({ lat: latitude, lng: longitude });
        setSelectedCoords({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setDetecting(false);
      },
      (error) => {
        setDetecting(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please enable location access in your browser settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Location information unavailable. Please try again.');
        } else {
          setLocationError('Unable to get your location. Please try again.');
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal h-10"
        >
          <MapPin className="mr-2 h-4 w-4" />
          {selectedLocation === "current" ? "Current Location" : (selectedOption ? selectedOption.label : "Select location")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden bg-transparent border-0">
        <div className="bg-white rounded-lg overflow-hidden shadow-xl">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>Select Location</DialogTitle>
            <DialogDescription>
              Search for a location or use your current location
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 pt-0 space-y-4">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for a location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              {searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                    >
                      <p className="text-sm font-medium line-clamp-2">{result.display_name}</p>
                    </button>
                  ))}
                </div>
              )}
              
              {isSearching && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Searching...</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={detectCurrentLocation}
              disabled={detecting}
            >
              {detecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="mr-2 h-4 w-4" />
              )}
              {detecting ? "Detecting..." : "Use my current location"}
            </Button>

            {locationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{locationError}</p>
              </div>
            )}

            <div className="h-[300px] rounded-lg overflow-hidden border">
              {mounted ? (
                <LocationMap
                  selectedCoords={selectedCoords}
                  onLocationSelect={handleMapClick}
                  center={mapCenter}
                />
              ) : (
                <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
                  <span className="text-gray-400">Loading map...</span>
                </div>
              )}
            </div>

            {selectedCoords && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  Selected: {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={handleConfirmLocation}
                >
                  Confirm Location
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getCoordinates(locationValue: string): { lat: number; lng: number } | null {
  if (locationValue === "current") return null;
  const location = ADDIS_ABABA_LOCATIONS.find((l) => l.value === locationValue);
  return location ? { lat: location.lat, lng: location.lng } : null;
}

export function getCoordinatesFromLocation(locationValue: string): { lat: number; lng: number } | null {
  if (!locationValue) return null;
  if (locationValue === "current") return null;
  return getCoordinates(locationValue.toLowerCase().trim());
}

export function reverseGeocode(lat: number, lng: number): string | null {
  if (!lat || !lng) return null;
  
  let nearestLocation: LocationOption | null = null;
  let shortestDistance = Infinity;

  for (const loc of ADDIS_ABABA_LOCATIONS) {
    const distance = Math.sqrt(
      Math.pow(loc.lat - lat, 2) + Math.pow(loc.lng - lng, 2)
    );
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestLocation = loc;
    }
  }

  if (nearestLocation && shortestDistance < 0.05) {
    return nearestLocation.label;
  }
  
  return null;
}

export function calculateDistanceKm(lat1: number, lng1: number, lat2: number = ADDIS_CENTER[0], lng2: number = ADDIS_CENTER[1]): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function parsePostGISPoint(wkb: string | null): { lat: number; lng: number } | null {
  if (!wkb) {
    console.log('parsePostGISPoint: null or empty input');
    return null;
  }
  
  console.log('parsePostGISPoint input:', wkb.substring(0, 50), '...');
  
  if (wkb.startsWith('POINT(')) {
    const match = wkb.match(/POINT\(([^)]+)\)/);
    if (match) {
      const coords = match[1].split(' ');
      if (coords.length === 2) {
        const lng = parseFloat(coords[0]);
        const lat = parseFloat(coords[1]);
        console.log('POINT format parsed:', { lng, lat });
        if (!isNaN(lng) && !isNaN(lat)) {
          return { lng, lat };
        }
      }
    }
  }
  
  if (wkb.startsWith('010100')) {
    try {
      const hex = wkb;
      const byteLength = (hex.length - 2) / 2;
      console.log('EWKB hex length:', byteLength);
      
      if (byteLength >= 32) {
        const xBytes = new Uint8Array(8);
        const yBytes = new Uint8Array(8);
        
        for (let i = 0; i < 8; i++) {
          xBytes[i] = parseInt(hex.substring(32 + i*2, 34 + i*2), 16);
        }
        for (let i = 0; i < 8; i++) {
          yBytes[i] = parseInt(hex.substring(48 + i*2, 50 + i*2), 16);
        }
        
        const xView = new DataView(xBytes.buffer);
        const yView = new DataView(yBytes.buffer);
        const lng = xView.getFloat64(0, true);
        const lat = yView.getFloat64(0, true);
        
        console.log('EWKB offset 32/48:', { lat, lng, valid: lat >= 3 && lat <= 15 && lng >= 33 && lng <= 48 });
        
        if (lat >= 3 && lat <= 15 && lng >= 33 && lng <= 48) {
          return { lat, lng };
        }
      }
      
      const bytes = new Uint8Array(byteLength);
      for (let i = 0; i < byteLength; i++) {
        bytes[i] = parseInt(hex.substr(2 + i * 2, 2), 16);
      }
      
      const view = new DataView(bytes.buffer);
      const littleEndian = bytes[0] === 1;
      console.log('Endian:', littleEndian ? 'little' : 'big', 'byteLength:', byteLength);
      
      const possibleOffsets = [20, 24, 28, 32, 36, 40];
      for (const offset of possibleOffsets) {
        if (byteLength >= offset + 16) {
          const lng = view.getFloat64(offset, littleEndian);
          const lat = view.getFloat64(offset + 8, littleEndian);
          console.log('Attempting offset', offset, ':', { lat, lng });
          
          if (lat >= 3 && lat <= 15 && lng >= 33 && lng <= 48) {
            console.log('Found valid coords at offset', offset);
            return { lat, lng };
          }
        }
      }
      
      console.log('parsePostGISPoint: coords out of range for all offsets');
      return null;
    } catch (e) {
      console.log('parsePostGISPoint error:', e);
      return null;
    }
  }
  
  console.log('parsePostGISPoint: unknown format');
  return null;
}