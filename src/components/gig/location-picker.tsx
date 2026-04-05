"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  { value: " CMC", label: "CMC", lat: 9.0328, lng: 38.7469 },
  { value: "aidar", label: "Ayrer", lat: 8.9967, lng: 38.7397 },
  { value: "gerbi", label: "Gerbi", lat: 9.0067, lng: 38.7544 },
  { value: "mexico", label: "Mexico", lat: 9.0267, lng: 38.7319 },
  { value: "kality", label: "Kality", lat: 8.9567, lng: 38.7833 },
];

interface LocationPickerProps {
  onLocationSelect: (location: string, lat: number, lng: number) => void;
  selectedLocation: string;
}

export function LocationPicker({ onLocationSelect, selectedLocation }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<LocationOption | null>(null);

  const selectedOption = ADDIS_ABABA_LOCATIONS.find((l) => l.value === selectedLocation);

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const nearest = ADDIS_ABABA_LOCATIONS.reduce((closest, loc) => {
          const dist = Math.sqrt(
            Math.pow(loc.lat - latitude, 2) + Math.pow(loc.lng - longitude, 2)
          );
          const closestDist = Math.sqrt(
            Math.pow(closest.lat - latitude, 2) + Math.pow(closest.lng - longitude, 2)
          );
          return dist < closestDist ? loc : closest;
        }, ADDIS_ABABA_LOCATIONS[0]);

        setDetectedLocation(nearest);
        setDetecting(false);
      },
      () => {
        setDetecting(false);
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
          {selectedOption ? selectedOption.label : "Select location"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
          <DialogDescription>
            Choose the area where the gig will take place
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          {detectedLocation && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">
                Detected: {detectedLocation.label}
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-2"
                onClick={() => {
                  onLocationSelect(detectedLocation.value, detectedLocation.lat, detectedLocation.lng);
                  setIsOpen(false);
                  setDetectedLocation(null);
                }}
              >
                Select This Location
              </Button>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Or select manually:</p>
            <div className="grid grid-cols-2 gap-2">
              {ADDIS_ABABA_LOCATIONS.map((loc) => (
                <Button
                  key={loc.value}
                  type="button"
                  variant={selectedLocation === loc.value ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    onLocationSelect(loc.value, loc.lat, loc.lng);
                    setIsOpen(false);
                  }}
                >
                  {loc.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getCoordinates(locationValue: string): { lat: number; lng: number } | null {
  const location = ADDIS_ABABA_LOCATIONS.find((l) => l.value === locationValue);
  return location ? { lat: location.lat, lng: location.lng } : null;
}

export function getCoordinatesFromLocation(locationValue: string): { lat: number; lng: number } | null {
  if (!locationValue) return null;
  return getCoordinates(locationValue.toLowerCase().trim());
}