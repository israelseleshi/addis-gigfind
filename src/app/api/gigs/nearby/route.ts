import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latitude = searchParams.get("lat");
    const longitude = searchParams.get("lng");
    const radius = searchParams.get("radius") || "25"; // km
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const supabase = await createClient();

    let query = supabase
      .from("gigs")
      .select(`
        *,
        client:profiles!gigs_client_id_fkey(full_name, avatar_url)
      `)
      .eq("status", "open");

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: gigs, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    let gigsWithDistance = gigs?.map((gig) => ({
      ...gig,
      distance: null,
    })) || [];

    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);
      const radiusKm = parseInt(radius);

      gigsWithDistance = gigsWithDistance
        .map((gig) => {
          const coords = getCoordinatesFromLocation(gig.location);
          if (!coords) return { ...gig, distance: null };

          const distance = calculateDistance(
            userLat,
            userLng,
            coords.lat,
            coords.lng
          );
          return { ...gig, distance };
        })
        .filter((gig) => gig.distance !== null && gig.distance <= radiusKm)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return NextResponse.json({
      success: true,
      gigs: gigsWithDistance,
      count: gigsWithDistance.length,
    });
  } catch (error: any) {
    console.error("Nearby gigs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function getCoordinatesFromLocation(location: string): { lat: number; lng: number } | null {
  const locationMap: Record<string, { lat: number; lng: number }> = {
    bole: { lat: 8.9917, lng: 38.7578 },
    kazanchis: { lat: 9.0053, lng: 38.7631 },
    piassa: { lat: 9.0102, lng: 38.7503 },
    addis_ketema: { lat: 9.0278, lng: 38.7319 },
    gulele: { lat: 9.0402, lng: 38.7125 },
    yeka: { lat: 9.0522, lng: 38.7583 },
    arada: { lat: 9.0185, lng: 38.7447 },
    nifas_silk: { lat: 8.9789, lng: 38.7892 },
    lekunda: { lat: 9.0156, lng: 38.7728 },
    megenagna: { lat: 9.0083, lng: 38.7756 },
    sarbet: { lat: 8.9822, lng: 38.7697 },
    cmc: { lat: 9.0328, lng: 38.7469 },
    ayrer: { lat: 8.9967, lng: 38.7397 },
    gerbi: { lat: 9.0067, lng: 38.7544 },
    mexico: { lat: 9.0267, lng: 38.7319 },
    kality: { lat: 8.9567, lng: 38.7833 },
  };

  const normalized = location?.toLowerCase().trim();
  return locationMap[normalized || ""] || null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}