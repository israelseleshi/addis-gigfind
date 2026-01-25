"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Briefcase, Search, Filter, Clock, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ClientMyJobsPage() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('gigs')
          .select(`
            *,
            applications(count)
          `)
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading jobs:', error)
        } else {
          setJobs(data || [])
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-green-100 text-green-700 border-green-200',
      assigned: 'bg-blue-100 text-blue-700 border-blue-200',
      in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    }
    return (
      <Badge variant="outline" className={styles[status] || 'bg-gray-100 text-gray-700'}>
        {status?.replace('_', ' ')}
      </Badge>
    )
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'all' ||
                       (activeTab === 'active' && ['open', 'assigned', 'in_progress'].includes(job.status)) ||
                       (activeTab === 'completed' && job.status === 'completed') ||
                       (activeTab === 'draft' && job.status === 'draft')
    return matchesSearch && matchesTab
  })

  const stats = {
    all: jobs.length,
    active: jobs.filter(j => ['open', 'assigned', 'in_progress'].includes(j.status)).length,
    completed: jobs.filter(j => j.status === 'completed').length,
    draft: jobs.filter(j => j.status === 'draft').length,
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Jobs</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage and track all your posted gigs
          </p>
        </div>
        <Button asChild className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
          <Link href="/client/gigs/create">
            <Plus className="h-4 w-4 mr-2" />
            Post New Gig
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl sm:text-3xl font-bold">{stats.all}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.completed}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600">{stats.draft}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({stats.draft})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Jobs Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'No jobs match your search criteria.' : 'You haven\'t posted any jobs yet.'}
                </p>
                <Button asChild className="bg-orange-500 hover:bg-orange-600">
                  <Link href="/client/gigs/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Gig
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-6 w-6 text-orange-500" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {job.category} · {job.location}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(job.created_at).toLocaleDateString()}
                              </span>
                              <span className="font-medium text-green-600">
                                ETB {job.budget?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center gap-3 sm:items-end flex-shrink-0">
                          {getStatusBadge(job.status)}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {job.applications?.[0]?.count || 0} applicants
                            </span>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/client/my-jobs/${job.id}/applicants`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
