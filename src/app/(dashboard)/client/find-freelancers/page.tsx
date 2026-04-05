"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Navigation, Loader2, Mail, Phone } from 'lucide-react';
import { createClient } from "@/lib/supabase/client";
import { useGeolocation, formatDistance } from "@/hooks/use-geolocation";
import { DistanceBadge } from "@/components/gig/distance-badge";
import dynamic from "next/dynamic";
import { getCoordinatesFromLocation } from "@/components/gig/location-picker";

const GigMap = dynamic(() => import("@/components/gig/gig-map").then(mod => ({ default: mod.GigMap })), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-gray-400">Loading map...</span>
    </div>
  ),
});

interface Freelancer {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location_sub_city: string | null;
  average_rating: number | null;
  reviews_count: number | null;
  skills?: string[];
}

function formatLocation(value: string) {
  if (!value) return 'Unknown';
  return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function FindFreelancersPage() {
  const supabase = createClient();
  const { position, loading: locationLoading, error: locationError, requestLocation, clearError } = useGeolocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('25');
  const [freelancers, setFreelancers] = useState<(Freelancer & { distance?: number | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationRequested, setLocationRequested] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    loadFreelancers();
  }, []);

  const loadFreelancers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          location_sub_city,
          average_rating,
          reviews_count
        `)
        .eq('role', 'freelancer')
        .eq('verification_status', 'verified');

      if (error) {
        console.error('Error fetching freelancers:', error);
      } else {
        setFreelancers(data || []);
        
        const uniqueLocs = [...new Set(data?.map((f: any) => f.location_sub_city).filter(Boolean) || [])] as string[];
        setLocations(uniqueLocs);
        
        setSkills(['design', 'development', 'writing', 'marketing', 'electrical', 'plumbing', 'carpentry', 'cleaning', 'tutoring']);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFreelancers = useMemo(() => {
    return freelancers
      .map(freelancer => {
        if (!position || !freelancer.location_sub_city) {
          return { ...freelancer, distance: null };
        }

        const coords = getCoordinatesFromLocation(freelancer.location_sub_city);
        if (!coords) return { ...freelancer, distance: null };

        const distance = calculateDistance(
          position.latitude,
          position.longitude,
          coords.lat,
          coords.lng
        );
        return { ...freelancer, distance };
      })
      .filter(f => 
        (f.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) &&
        (selectedLocation === 'all' || f.location_sub_city === selectedLocation) &&
        (f.distance === null || f.distance <= parseInt(distanceFilter))
      )
      .sort((a, b) => (a.distance || 999) - (b.distance || 999));
  }, [freelancers, searchTerm, selectedLocation, distanceFilter, position]);

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Find Freelancers</h1>
        <p className="text-sm text-gray-500">Discover talented professionals near you</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search freelancers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{formatLocation(loc)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={distanceFilter} onValueChange={setDistanceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Within 5 km</SelectItem>
                <SelectItem value="10">Within 10 km</SelectItem>
                <SelectItem value="25">Within 25 km</SelectItem>
                <SelectItem value="50">Within 50 km</SelectItem>
              </SelectContent>
            </Select>

            {!position && !locationLoading && (
              <Button variant="outline" onClick={() => { requestLocation(); setLocationRequested(true); }}>
                <Navigation className="w-4 h-4 mr-2" />
                Find nearby
              </Button>
            )}
          </div>

          {locationError && (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => { clearError(); requestLocation(); }}>
                <Navigation className="w-4 h-4 mr-1" />
                Enable Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''} found
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        </div>
      ) : filteredFreelancers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>No freelancers found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFreelancers.map((freelancer) => (
            <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                      {freelancer.full_name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{freelancer.full_name || 'Freelancer'}</CardTitle>
                      {freelancer.location_sub_city && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {formatLocation(freelancer.location_sub_city)}
                          {freelancer.distance !== null && (
                            <DistanceBadge distance={freelancer.distance} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {freelancer.average_rating && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      {freelancer.average_rating}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {freelancer.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{freelancer.bio}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {freelancer.reviews_count || 0} reviews
                  </span>
                  <Button size="sm">Contact</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}