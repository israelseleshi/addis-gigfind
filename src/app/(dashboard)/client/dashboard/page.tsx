"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Briefcase, Users, Clock, TrendingUp, Plus, ArrowRight, Activity, Zap, DollarSign, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientDashboardStats, getRecentGigs, getRecentActivity } from '@/lib/actions/dashboard'
import { motion } from 'framer-motion'

interface DashboardStats {
  activeGigs: number
  totalHires: number
  pendingApplications: number
  completedJobs: number
  totalSpent: number
  pendingPayments: number
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
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 sm:p-4 md:p-5 lg:p-6">
        <div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-br ${color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
        <CardHeader className="flex flex-row items-center justify-between pb-2 p-0 sm:p-1">
          <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-1">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">{value}</div>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2">{title}</p>
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
        className="group relative overflow-hidden rounded-xl bg-white p-3 sm:p-4 shadow-sm border border-zinc-100 hover:shadow-md transition-all"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity`} />
        <div className={`inline-flex p-1.5 sm:p-2 md:p-3 rounded-lg bg-gradient-to-br ${color} mb-2 sm:mb-3 md:mb-4 shadow-md`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
        </div>
        <p className="font-semibold text-zinc-900 text-xs sm:text-sm md:text-base lg:text-lg">{label}</p>
        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 flex items-center gap-1 group-hover:text-orange-500 transition-colors">
          Open <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentGigs, setRecentGigs] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
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
        
        const defaultStats: DashboardStats = {
          activeGigs: 0,
          totalHires: 0,
          pendingApplications: 0,
          completedJobs: 0,
          totalSpent: 0,
          pendingPayments: 0,
        }
        
        setStats(statsData || defaultStats)
        setRecentGigs(gigsData || [])
        setActivities(activitiesData || [])
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
      <div className="min-h-screen bg-zinc-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-3 sm:p-4">
                <CardHeader className="pb-2 p-0 sm:p-1">
                  <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
                </CardHeader>
                <CardContent className="p-0 sm:p-1">
                  <Skeleton className="h-6 w-12 sm:h-8 sm:w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <Card className="xl:col-span-2">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <Skeleton className="h-5 w-24 sm:h-6 sm:w-32" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 sm:h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <Skeleton className="h-5 w-24 sm:h-6 sm:w-32" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 sm:h-16 w-full" />
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
      className="min-h-screen bg-zinc-50/50 pb-14 sm:pb-16 md:pb-20 lg:pb-8 xl:pb-10 space-y-4 sm:space-y-6 md:space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-zinc-900">
            Welcome back, {profile?.full_name || 'Client'}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2">Here&apos;s what&apos;s happening with your gigs today.</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {statsData.map((stat: StatItem, index: number) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Payment Stats */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Payment Summary
              </CardTitle>
              <CardDescription>Track your payments to freelancers</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <DollarSign className="w-4 h-4" />
                  Total Spent
                </div>
                <p className="text-2xl font-bold text-gray-800">0 ETB</p>
                <p className="text-xs text-gray-400">All time</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Users className="w-4 h-4" />
                  Freelancers Hired
                </div>
                <p className="text-2xl font-bold text-gray-800">0</p>
                <p className="text-xs text-gray-400">This month</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  Pending Payments
                </div>
                <p className="text-2xl font-bold text-gray-800">0</p>
                <p className="text-xs text-gray-400">Awaiting completion</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/client/my-jobs">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay Freelancers
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {/* Recent Gigs */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <div>
                <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Your Recent Gigs</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">Manage and track your posted gigs</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
                <Link href="/client/my-jobs">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                {recentGigs.map((gig) => (
                  <motion.div
                    key={gig.id}
                    whileHover={{ x: 4 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 md:p-5 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all cursor-pointer gap-2 sm:gap-3"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-zinc-900 text-xs sm:text-sm md:text-base lg:text-lg truncate">{gig.title}</h3>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">{gig.budget}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto sm:ml-0">
                      <StatusBadge status={gig.status} />
                      <span className="text-xs text-muted-foreground hidden xs:inline">
                        {gig.applicants} applicants
                      </span>
                      <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
                        <Link href={`/client/my-jobs/${gig.id}`}>View</Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar - Quick Actions & Activity */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
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
              <CardHeader className="pb-3 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
                <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl">Recent Activity</CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base">Your latest updates</CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                <div className="space-y-2 sm:space-y-3 md:space-y-4">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0 ${
                          activity.type === 'application' ? 'bg-orange-500' :
                          activity.type === 'completed' ? 'bg-green-500' :
                          activity.type === 'payment' ? 'bg-blue-500' : 'bg-purple-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm md:text-base font-medium text-zinc-900 line-clamp-2">{activity.text}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 sm:py-6 md:py-8">
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground">No recent activity</p>
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
