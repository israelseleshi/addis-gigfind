"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { List, Map, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from "@/lib/supabase/client";

const GIGS_PER_PAGE = 5;

export default function FindWorkPage() {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    loadGigs();
  }, []);

  const loadGigs = async () => {
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
        const uniqueCategories = [...new Set(data?.map((g: any) => g.category).filter(Boolean) || [])];
        const uniqueLocations = [...new Set(data?.map((g: any) => g.location).filter(Boolean) || [])];
        setCategories(uniqueCategories);
        setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <Card className="shadow-md">
          <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
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
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => { setSelectedLocation(value); setCurrentPage(1); }} value={selectedLocation}>
              <SelectTrigger className="w-full sm:w-[140px] lg:w-[180px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
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
          <div className="space-y-3 sm:space-y-4">
            {paginatedGigs.length > 0 ? (
              paginatedGigs.map((gig) => (
                <Card key={gig.id} className="shadow-md">
                  <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-2 pb-2">
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg">{gig.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{gig.category} · {gig.location}</CardDescription>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-lg sm:text-xl font-bold text-green-600">
                        {gig.budget ? `ETB ${gig.budget.toLocaleString()}` : 'Negotiable'}
                      </p>
                      <p className="text-xs text-zinc-500">Posted {new Date(gig.created_at).toLocaleDateString()}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Button className="w-full sm:w-auto cursor-pointer">Apply Now</Button>
                    <Button variant="outline" asChild className="w-full sm:w-auto cursor-pointer">
                      <Link href={`/freelancer/find-work/${gig.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-md">
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-zinc-500">No gigs found matching your criteria.</p>
                </CardContent>
              </Card>
            )}
          </div>
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
