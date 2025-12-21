"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from "@/components/ui/pagination";
import { List, Map } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const gigs = [
  { id: 1, title: "Urgent Plumbing for Leaky Pipe", category: "Plumbing", location: "Bole", budget: "2,000 ETB", posted: "2h ago" },
  { id: 2, title: "Graphic Designer for Startup Logo", category: "Design", location: "Kazanchis", budget: "5,500 ETB", posted: "8h ago" },
  { id: 3, title: "Part-time English Tutor for University Student", category: "Tutoring", location: "4 Kilo", budget: "3,000 ETB / month", posted: "1d ago" },
  { id: 4, title: "House Wiring and Electrical Setup", category: "Electrical", location: "CMC", budget: "8,000 ETB", posted: "3d ago" },
  { id: 5, title: "Content Writer for Tech Blog", category: "Writing", location: "Piassa", budget: "1,500 ETB per article", posted: "5d ago" },
  { id: 6, title: "Social Media Manager for a Cafe", category: "Design", location: "Bole", budget: "6,000 ETB / month", posted: "1w ago" },
  { id: 7, title: "Private Chef for a Dinner Party", category: "Tutoring", location: "Kazanchis", budget: "4,000 ETB", posted: "2w ago" },
  { id: 8, title: "Website Developer for a Small Business", category: "Electrical", location: "4 Kilo", budget: "15,000 ETB", posted: "3w ago" },
  { id: 9, title: "Data Entry Specialist", category: "Writing", location: "CMC", budget: "2,500 ETB", posted: "1mo ago" },
  { id: 10, title: "Mobile App UI/UX Designer", category: "Design", location: "Piassa", budget: "12,000 ETB", posted: "1mo ago" },
  { id: 11, title: "Translator (Amharic to English)", category: "Writing", location: "Bole", budget: "500 ETB / page", posted: "2mo ago" },
  { id: 12, title: "Handyman for Furniture Assembly", category: "Plumbing", location: "Kazanchis", budget: "1,000 ETB", posted: "2mo ago" },
  { id: 13, title: "Event Photographer", category: "Design", location: "4 Kilo", budget: "7,000 ETB", posted: "3mo ago" },
  { id: 14, title: "Virtual Assistant for a Busy Executive", category: "Writing", location: "CMC", budget: "10,000 ETB / month", posted: "3mo ago" },
];

const categories = ["Plumbing", "Design", "Tutoring", "Electrical", "Writing"];
const locations = ["Bole", "Kazanchis", "4 Kilo", "CMC", "Piassa"];

const GIGS_PER_PAGE = 5;

// Mock logged in status - in a real app, this would come from your auth context
const isLoggedIn = false;

export default function FindWorkPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [filteredGigs, setFilteredGigs] = useState(gigs);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const results = gigs.filter(gig =>
      gig.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'all' || gig.category === selectedCategory) &&
      (selectedLocation === 'all' || gig.location === selectedLocation)
    );
    setFilteredGigs(results);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, selectedCategory, selectedLocation]);

  const totalPages = Math.ceil(filteredGigs.length / GIGS_PER_PAGE);
  const paginatedGigs = filteredGigs.slice((currentPage - 1) * GIGS_PER_PAGE, currentPage * GIGS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Filter Section */}
      <Card className="shadow-md">
        <CardContent className="pt-6 flex flex-col md:flex-row gap-4">
          <Input 
            placeholder="Search by keyword (e.g. 'logo design')" 
            className="flex-grow" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select onValueChange={setSelectedCategory} value={selectedCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedLocation} value={selectedLocation}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* View Toggle and Results */}
      <Tabs defaultValue="list">
        <div className="flex justify-end items-center mb-4">
          <TabsList>
            <TabsTrigger value="list"><List className="w-4 h-4 mr-2" />List View</TabsTrigger>
            <TabsTrigger value="map"><Map className="w-4 h-4 mr-2" />Map View</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list">
          <div className="space-y-4">
            {paginatedGigs.length > 0 ? (
              paginatedGigs.map((gig) => (
                <Card key={gig.id} className="shadow-md">
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                      <CardTitle>{gig.title}</CardTitle>
                      <CardDescription>{gig.category} &middot; {gig.location}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">{gig.budget}</p>
                      <p className="text-xs text-gray-500">Posted {gig.posted}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    {isLoggedIn ? (
                      <Button className="cursor-pointer">Apply Now</Button>
                    ) : (
                      <Button asChild className="cursor-pointer">
                        <Link href="/login">Login to Apply</Link>
                      </Button>
                    )}
                    <Button variant="outline" asChild className="cursor-pointer">
                      <Link href={`/freelancer/find-work/${gig.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500">No gigs found.</p>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
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
                    <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <Card className="shadow-md">
            <CardContent className="pt-6 h-96 flex items-center justify-center">
              <p className="text-gray-500">Map view coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
