"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Search, Briefcase, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminGigsPage() {
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
      const { data, error } = await supabase
        .from('gigs')
        .select('*, client:profiles!gigs_client_id_fkey(id, full_name)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading gigs:', error)
      } else {
        setGigs(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (gigId: string) => {
    if (!confirm('Are you sure you want to delete this gig?')) return
    
    try {
      const supabase = createClient()
      const { error } = await supabase.from('gigs').delete().eq('id', gigId)

      if (error) {
        toast.error('Failed to delete gig')
      } else {
        toast.success('Gig deleted')
        loadGigs()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    }
  }

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = gig.title?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gig Management</h1>

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

      <div className="space-y-4">
        {filteredGigs.map((gig) => (
          <Card key={gig.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{gig.title}</h3>
                  <p className="text-sm text-gray-500">{gig.client?.full_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{gig.category} • {gig.location}</p>
                  <p className="text-green-600 font-medium mt-2">{gig.budget?.toLocaleString()} ETB</p>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(gig.status)}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />View
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(gig.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
