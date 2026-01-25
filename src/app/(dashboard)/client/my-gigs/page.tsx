"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'

export default function MyGigsPage() {
  const [loading, setLoading] = useState(true)
  const [gigs, setGigs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadGigs()
  }, [])

  const loadGigs = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('gigs')
          .select('*, applications(count)')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })

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
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Gigs</h1>
        <Button asChild className="bg-amber-500 hover:bg-amber-600">
          <Link href="/client/gigs/create">
            <Plus className="h-4 w-4 mr-2" />
            Post New Gig
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search gigs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
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
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{gigs.length}</div>
            <p className="text-sm text-gray-500">Total Gigs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">
              {gigs.filter(g => g.status === 'open').length}
            </div>
            <p className="text-sm text-gray-500">Open</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-500">
              {gigs.filter(g => g.status === 'assigned' || g.status === 'in_progress').length}
            </div>
            <p className="text-sm text-gray-500">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-purple-500">
              {gigs.filter(g => g.status === 'completed').length}
            </div>
            <p className="text-sm text-gray-500">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Gigs Grid */}
      {filteredGigs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500 mb-4">No gigs found</p>
            <Button asChild className="bg-amber-500 hover:bg-amber-600">
              <Link href="/client/gigs/create">Post Your First Gig</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGigs.map((gig) => (
            <Card key={gig.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{gig.title}</CardTitle>
                  {getStatusBadge(gig.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-500 line-clamp-2">{gig.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-green-600">{gig.budget.toLocaleString()} ETB</span>
                  <span className="text-gray-500">{gig.applications?.[0]?.count || 0} applicants</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/client/my-jobs/${gig.id}`}>View</Link>
                  </Button>
                  {gig.status === 'open' && (
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/client/my-jobs/${gig.id}/applicants`}>Applicants</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
