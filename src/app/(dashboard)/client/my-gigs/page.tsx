"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search, Filter, RefreshCw, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Gig {
  id: string;
  title: string;
  status: string;
  description: string;
  budget: number;
  applications: { count: number }[];
}

export default function MyGigsPage() {
  const [loading, setLoading] = useState(true)
  const [gigs, setGigs] = useState<Gig[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gigToDelete, setGigToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadGigs()
  }, [])

  const loadGigs = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        console.log('Current user ID:', user.id)
        
        // First, let's check if there are any gigs at all
        const { data: allGigs, error: allGigsError } = await supabase
          .from('gigs')
          .select('count')
          .limit(1)

        console.log('All gigs count:', allGigs)
        console.log('All gigs error:', allGigsError)

        // Now fetch user's gigs
        const { data, error } = await supabase
          .from('gigs')
          .select('*, applications(count)')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })

        console.log('Fetched gigs:', data)
        console.log('Error:', error)

        if (error) {
          console.error('Error loading gigs:', error)
        } else {
          setGigs(data || [])
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || gig.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (gigId: string) => {
    setGigToDelete(gigId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!gigToDelete) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase.from('gigs').delete().eq('id', gigToDelete)

      if (error) {
        toast.error('Failed to delete gig: ' + error.message)
      } else {
        toast.success('Gig deleted successfully')
        loadGigs()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while deleting the gig')
    } finally {
      setDeleteDialogOpen(false)
      setGigToDelete(null)
    }
  }
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      open: 'bg-green-500',
      assigned: 'bg-blue-500',
      in_progress: 'bg-amber-500',
      completed: 'bg-purple-500',
      cancelled: 'bg-red-500',
    }
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 animate-pulse">
        <div className="h-6 sm:h-7 md:h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 sm:h-12 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 sm:h-40 md:h-44 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 space-y-4 sm:space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">My Gigs</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={loadGigs} disabled={loading} className="flex-1 sm:flex-none text-xs sm:text-sm">
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">Refresh</span>
          </Button>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 flex-1 sm:flex-none text-xs sm:text-sm">
            <Link href="/client/gigs/create">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Post New Gig</span>
              <span className="sm:hidden">New Gig</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <Input
            placeholder="Search gigs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10 h-9 sm:h-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-36 md:w-40">
            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="pt-2 sm:pt-3 md:pt-4 p-0 sm:p-1">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold">{gigs.length}</div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Total Gigs</p>
          </CardContent>
        </Card>
        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="pt-2 sm:pt-3 md:pt-4 p-0 sm:p-1">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-500">
              {gigs.filter(g => g.status === 'open').length}
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Open</p>
          </CardContent>
        </Card>
        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="pt-2 sm:pt-3 md:pt-4 p-0 sm:p-1">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-500">
              {gigs.filter(g => g.status === 'assigned' || g.status === 'in_progress').length}
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">In Progress</p>
          </CardContent>
        </Card>
        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="pt-2 sm:pt-3 md:pt-4 p-0 sm:p-1">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-500">
              {gigs.filter(g => g.status === 'completed').length}
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Gigs Grid */}
      {filteredGigs.length === 0 ? (
        <Card>
          <CardContent className="pt-4 sm:pt-6 md:pt-8 text-center">
            <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">No gigs found</p>
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-xs sm:text-sm">
              <Link href="/client/gigs/create">Post Your First Gig</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredGigs.map((gig) => (
            <Card key={gig.id} className="p-3 sm:p-4 md:p-5 lg:p-6">
              <CardHeader className="p-0 pb-2 sm:pb-3 md:pb-4">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl">{gig.title}</CardTitle>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {getStatusBadge(gig.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                          <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/client/gigs/${gig.id}/edit`}>
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(gig.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-0">
                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{gig.description}</p>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-medium text-green-600">{gig.budget.toLocaleString()} ETB</span>
                  <span className="text-gray-500">{gig.applications?.[0]?.count || 0} applicants</span>
                </div>
                <div className="flex gap-1.5 sm:gap-2 pt-2 sm:pt-3">
                  <Button variant="outline" size="sm" asChild className="flex-1 text-xs sm:text-sm">
                    <Link href={`/client/my-jobs/${gig.id}`}>View</Link>
                  </Button>
                  {gig.status === 'open' && (
                    <Button variant="outline" size="sm" asChild className="flex-1 text-xs sm:text-sm">
                      <Link href={`/client/my-jobs/${gig.id}/applicants`}>Applicants</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-red-500 text-white border-red-600 max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-3 sm:py-4">
            <p className="text-sm text-white">
              Are you sure you want to delete this gig? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="bg-white text-red-500 hover:bg-gray-100 border-white w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-white text-red-500 hover:bg-gray-100 w-full sm:w-auto">
              Delete Gig
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
