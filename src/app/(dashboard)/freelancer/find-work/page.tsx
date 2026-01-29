"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { List, Map, Loader2, MapPin, Star, Search } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { createClient } from "@/lib/supabase/client";

const GIGS_PER_PAGE = 5;

interface Gig {
  id: string;
  title: string;
  category: string;
  location: string;
  budget: number | null;
  created_at: string;
  client: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    average_rating: number | null;
  } | null;
}

function formatLocation(value: string) {
  return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatCategory(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function FindWorkPage() {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const loadGigs = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch gigs with client info
      const { data, error } = await supabase
        .from('gigs')
        .select(`
          *,
          client:profiles!gigs_client_id_fkey(id, full_name, avatar_url, average_rating)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gigs:', error);
      } else {
        setGigs(data || []);
        
        // Extract unique categories and locations
        const uniqueCategories = [...new Set(data?.map((g: Gig) => g.category).filter(Boolean) || [])];
        const uniqueLocations = [...new Set(data?.map((g: Gig) => g.location).filter(Boolean) || [])];
        setCategories(uniqueCategories);
        setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadGigs();
  }, [loadGigs]);


  const filteredGigs = useMemo(() => {
    return gigs.filter(gig =>
      (gig.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'all' || gig.category === selectedCategory) &&
      (selectedLocation === 'all' || gig.location === selectedLocation)
    );
  }, [gigs, searchTerm, selectedCategory, selectedLocation]);

  const totalPages = Math.ceil(filteredGigs.length / GIGS_PER_PAGE);
  const paginatedGigs = filteredGigs.slice((currentPage - 1) * GIGS_PER_PAGE, currentPage * GIGS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <Card className="shadow-md">
          <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Filter Section */}
      <Card className="shadow-md">
        <CardContent className="pt-4 sm:pt-6 flex flex-col gap-3">
          <Input 
            placeholder="Search by keyword..." 
            className="w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
            <Select onValueChange={(value) => { setSelectedCategory(value); setCurrentPage(1); }} value={selectedCategory}>
              <SelectTrigger className="w-full sm:w-[140px] lg:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{formatCategory(cat)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => { setSelectedLocation(value); setCurrentPage(1); }} value={selectedLocation}>
              <SelectTrigger className="w-full sm:w-[140px] lg:w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => <SelectItem key={loc} value={loc}>{formatLocation(loc)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''} found
      </div>

      {/* View Toggle and Results */}
      <Tabs defaultValue="list">
        <div className="flex justify-end items-center mb-4">
          <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
            <TabsTrigger value="list"><List className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">List</span></TabsTrigger>
            <TabsTrigger value="map"><Map className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Map</span></TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list">
          {paginatedGigs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedGigs.map((gig) => (
                <Card key={gig.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 overflow-hidden">
                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <CardHeader className="relative pb-3">
                    {/* Category badge */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-3 py-1 text-xs font-semibold">
                        {formatCategory(gig.category)}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {formatLocation(gig.location)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {gig.title}
                      </CardTitle>
                      
                      {/* Client info */}
                      {gig.client && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                            {gig.client.full_name?.charAt(0) || 'C'}
                          </div>
                          <span className="truncate">{gig.client.full_name}</span>
                          {gig.client.average_rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs">{gig.client.average_rating}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative pt-0 space-y-4">
                    {/* Budget highlight */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Budget</span>
                        <span className="text-lg font-bold text-orange-600">
                          {gig.budget ? `ETB ${gig.budget.toLocaleString()}` : 'Negotiable'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Time posted */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Posted {new Date(gig.created_at).toLocaleDateString()}</span>
                      <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                        Available
                      </Badge>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
                        asChild
                      >
                        <Link href={`/freelancer/find-work/${gig.id}/apply`}>Apply Now</Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50 text-sm"
                        asChild
                      >
                        <Link href={`/freelancer/find-work/${gig.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-md border-0 bg-gradient-to-br from-gray-50 to-orange-50">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No gigs found</h3>
                <p className="text-gray-500">Try adjusting your search filters or check back later</p>
              </CardContent>
            </Card>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent className="flex-wrap">
                  <PaginationItem>
                    <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => handlePageChange(i + 1)} 
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <Card className="shadow-md">
            <CardContent className="pt-6 h-64 sm:h-96 flex items-center justify-center">
              <p className="text-zinc-500">Map view coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
