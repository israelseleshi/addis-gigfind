"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Briefcase, Users, Clock, TrendingUp, Plus, ArrowRight, Activity, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { getClientDashboardStats, getRecentGigs, getRecentActivity } from '@/lib/actions/dashboard'
import { Skeleton } from '@/components/ui/skeleton'

interface ClientDashboardStats {
  activeGigs: number
  totalHires: number
  pendingApplications: number
  completedJobs: number
}

interface Gig {
  id: string
  title: string
  status: string
  budget: string
  applicants: number
  created_at: string
}

interface Activity {
  id: string
  text: string
  time: string
  type: string
}

interface StatItem {
  title: string
  value: string
  icon: React.ElementType
  color: string
}

interface QuickAction {
  icon: React.ElementType
  label: string
  href: string
  color: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

function StatCard({ title, value, icon: Icon, color, delay }: { title: string; value: string; icon: React.ElementType; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold tracking-tight">{value}</div>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickAction({ icon: Icon, label, href, color }: { icon: React.ElementType; label: string; href: string; color: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm border border-zinc-100 hover:shadow-md transition-all"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity`} />
        <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} mb-3 shadow-md`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <p className="font-semibold text-zinc-900">{label}</p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 group-hover:text-orange-500 transition-colors">
          Open <ArrowRight className="h-3 w-3" />
        </p>
      </motion.div>
    </Link>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-green-100 text-green-700 border-green-200',
    Completed: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    Draft: 'bg-amber-100 text-amber-700 border-amber-200',
    Pending: 'bg-orange-100 text-orange-700 border-orange-200',
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  )
}

export default function ClientDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)
  const [stats, setStats] = useState<ClientDashboardStats | null>(null)
  const [recentGigs, setRecentGigs] = useState<Gig[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.error('No user found')
          setLoading(false)
          return
        }
        
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        setProfile(profileData)
        
        // Fetch all dashboard data
        const [statsData, gigsData, activitiesData] = await Promise.all([
          getClientDashboardStats(user.id),
          getRecentGigs(user.id),
          getRecentActivity(user.id)
        ])
        
        setStats(statsData || {
          activeGigs: 0,
          totalHires: 0,
          pendingApplications: 0,
          completedJobs: 0,
        })
        setRecentGigs(gigsData)
        setActivities(activitiesData)
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statsData: StatItem[] = [
    { title: 'Active Gigs', value: stats?.activeGigs.toString() || '0', icon: Briefcase, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Hires', value: stats?.totalHires.toString() || '0', icon: Users, color: 'from-green-500 to-green-600' },
    { title: 'Pending Applications', value: stats?.pendingApplications.toString() || '0', icon: Clock, color: 'from-amber-500 to-orange-500' },
    { title: 'Completed Jobs', value: stats?.completedJobs.toString() || '0', icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
  ]

  const quickActions: QuickAction[] = [
    { icon: Plus, label: 'Post New Gig', href: '/client/gigs/create', color: 'from-orange-500 to-amber-500' },
    { icon: Activity, label: 'View Applicants', href: '/client/applicants', color: 'from-blue-500 to-cyan-500' },
    { icon: Zap, label: 'Active Gigs', href: '/client/my-jobs', color: 'from-green-500 to-emerald-500' },
    { icon: Users, label: 'Manage Team', href: '/client/hired', color: 'from-purple-500 to-pink-500' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-zinc-50/50 pb-20 lg:pb-6 space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900">
            Welcome back, {profile?.full_name || 'Client'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your gigs today.</p>
        </div>
      </motion.div>

      {/* Stats Grid - Full width on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsData.map((stat: StatItem, index: number) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Main Content Grid - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent Gigs - Full width on mobile */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 pt-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">Your Recent Gigs</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage and track your posted gigs</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/client/my-jobs">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                {recentGigs.map((gig) => (
                  <motion.div
                    key={gig.id}
                    whileHover={{ x: 4 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-zinc-900 text-sm sm:text-base truncate">{gig.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{gig.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <StatusBadge status={gig.status} />
                      <span className="text-xs text-muted-foreground hidden xs:inline">
                        {gig.applicants} applicants
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/client/my-jobs/${gig.id}`}>View</Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar - Quick Actions & Activity - Full width on mobile */}
        <div className="space-y-4 lg:space-y-6">
          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <QuickAction key={action.label} {...action} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your latest updates</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          activity.type === 'application' ? 'bg-orange-500' :
                          activity.type === 'completed' ? 'bg-green-500' :
                          activity.type === 'payment' ? 'bg-blue-500' : 'bg-purple-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 line-clamp-2">{activity.text}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
