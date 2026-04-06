"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Briefcase, Users, Clock, TrendingUp, Plus, ArrowRight, Activity, Zap, DollarSign, CreditCard, FileText, CheckCircle, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientDashboardStats, getRecentGigs, getRecentActivity } from '@/lib/actions/dashboard'
import { motion } from 'framer-motion'
import { WalletCard } from '@/components/wallet/wallet-card'

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

interface Gig {
  id: string
  title: string
  status: string
  budget: number | string
  created_at: string
  applications_count?: number
}

interface Activity {
  id: string
  type: string
  text?: string
  description?: string
  created_at: string
  time?: string
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
        <div className="flex items-center gap-3">
          <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${color} shadow-md`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 text-sm sm:text-base">{label}</p>
          </div>
          <ArrowRight className="h-4 w-4 ml-auto text-zinc-400 group-hover:text-zinc-600 transition-colors" />
        </div>
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
    open: 'bg-green-100 text-green-700 border-green-200',
    assigned: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  )
}

const DESIGN_TEMPLATES = [
  { id: 'modern', name: 'Modern Cards' },
  { id: 'compact', name: 'Compact Grid' },
  { id: 'timeline', name: 'Activity Timeline' },
  { id: 'hero', name: 'Hero Focus' },
]

export default function ClientDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ full_name: string } | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentGigs, setRecentGigs] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [selectedDesign, setSelectedDesign] = useState('modern')

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

  const quickActions: QuickAction[] = [
    { icon: Plus, label: 'Post New Gig', href: '/client/gigs/create', color: 'from-orange-500 to-amber-500' },
    { icon: Activity, label: 'View Applicants', href: '/client/applicants', color: 'from-blue-500 to-cyan-500' },
    { icon: Zap, label: 'Active Gigs', href: '/client/my-jobs', color: 'from-green-500 to-emerald-500' },
    { icon: Users, label: 'Manage Team', href: '/client/hired', color: 'from-purple-500 to-pink-500' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <div className="lg:col-span-2">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const renderDesign = () => {
    return <ClientDesignModern { ...{ stats, recentGigs, activities, quickActions, profile } } />
  }

  return (
    <div className="space-y-6">
      {renderDesign()}
    </div>
  )
}

function ClientDesignModern({ stats, recentGigs, activities, quickActions, profile }: any) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900">
            Welcome back, {profile?.full_name || 'Client'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Here&apos;s what&apos;s happening with your gigs today.</p>
        </div>
      </motion.div>

      {/* Wallet and Payment Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <WalletCard userRole="client" />
          </div>
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 h-full">
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
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.totalSpent?.toLocaleString() || 0} ETB</p>
                    <p className="text-xs text-gray-400">All time</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Users className="w-4 h-4" />
                      Freelancers Hired
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.totalHires || 0}</p>
                    <p className="text-xs text-gray-400">This month</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Clock className="w-4 h-4" />
                      Pending
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats?.pendingPayments || 0}</p>
                    <p className="text-xs text-gray-400">Awaiting completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Gigs */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Your Recent Gigs</CardTitle>
                <CardDescription className="text-xs">Manage your posted gigs</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/client/my-gigs">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGigs.slice(0, 4).map((gig: Gig) => (
                  <div key={gig.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 truncate">{gig.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(gig.created_at).toLocaleDateString()} • {gig.budget?.toLocaleString()} ETB
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <StatusBadge status={gig.status} />
                    </div>
                  </div>
                ))}
                {recentGigs.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No gigs yet. Post your first gig!</p>
                    <Button asChild className="mt-4 bg-amber-600">
                      <Link href="/client/gigs/create">Post a Gig</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action: QuickAction, index: number) => (
                <QuickAction key={index} {...action} />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Latest updates on your gigs</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity: Activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-900">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(activity.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function ClientDesignCompact({ stats, recentGigs, activities, quickActions, profile }: any) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
            <p className="text-xs text-muted-foreground">{profile?.full_name || 'Client'}</p>
          </div>
          <Button asChild className="bg-amber-600">
            <Link href="/client/gigs/create">
              <Plus className="w-4 h-4 mr-1" />
              Post Gig
            </Link>
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="p-3 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500 rounded-lg">
              <Briefcase className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats?.activeGigs || 0}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-500 rounded-lg">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats?.completedJobs || 0}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500 rounded-lg">
              <DollarSign className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats?.totalSpent?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Spent (ETB)</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold">Your Gigs</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            {recentGigs.slice(0, 3).map((gig: any) => (
              <div key={gig.id} className="flex justify-between text-xs">
                <span className="truncate">{gig.title}</span>
                <StatusBadge status={gig.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            {quickActions.slice(0, 3).map((action: any, i: number) => (
              <Button key={i} asChild variant="outline" size="sm" className="w-full justify-start text-xs">
                <Link href={action.href}>
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function ClientDesignTimeline({ stats, recentGigs, activities, quickActions, profile }: any) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      <motion.div variants={itemVariants} className="text-center py-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
        <h1 className="text-2xl font-bold text-zinc-900">Welcome, {profile?.full_name || 'Client'}!</h1>
        <p className="text-muted-foreground mt-1">Manage your gigs and freelancers</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold">Your Gigs</h2>
          <div className="space-y-3">
            {recentGigs.slice(0, 5).map((gig: any, i: number) => (
              <motion.div 
                key={gig.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white rounded-xl border shadow-sm"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  gig.status === 'open' ? 'bg-green-100' :
                  gig.status === 'in_progress' ? 'bg-amber-100' :
                  'bg-zinc-100'
                }`}>
                  {gig.status === 'open' ? <Briefcase className="w-5 h-5 text-green-600" /> :
                   gig.status === 'in_progress' ? <Clock className="w-5 h-5 text-amber-600" /> :
                   <CheckCircle className="w-5 h-5 text-zinc-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{gig.title}</p>
                  <p className="text-sm text-muted-foreground">{gig.budget?.toLocaleString()} ETB • {new Date(gig.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={gig.status} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">{stats?.totalSpent?.toLocaleString() || 0}</p>
              <p className="text-sm opacity-80">Total Spent (ETB)</p>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action: any, i: number) => (
                <Button key={i} asChild variant="outline" className="w-full justify-start text-xs">
                  <Link href={action.href}>
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

function ClientDesignHero({ stats, recentGigs, activities, quickActions, profile }: any) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Manage Your Gigs</h1>
          <p className="text-zinc-300 mb-6">Post jobs and find the best freelancers</p>
          <div className="flex gap-3">
            <Button asChild className="bg-amber-500 hover:bg-amber-600">
              <Link href="/client/gigs/create">
                <Plus className="w-4 h-4 mr-2" />
                Post New Gig
              </Link>
            </Button>
            <Button asChild variant="outline" className="text-white border-white/30 hover:bg-white/10">
              <Link href="/client/my-gigs">
                View My Gigs
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 mx-auto bg-green-100 rounded-2xl flex items-center justify-center mb-4">
            <Briefcase className="w-7 h-7 text-green-600" />
          </div>
          <p className="text-3xl font-bold">{stats?.activeGigs || 0}</p>
          <p className="text-muted-foreground">Active Gigs</p>
        </Card>
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{stats?.totalHires || 0}</p>
          <p className="text-muted-foreground">Freelancers Hired</p>
        </Card>
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 mx-auto bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign className="w-7 h-7 text-amber-600" />
          </div>
          <p className="text-3xl font-bold">{stats?.totalSpent?.toLocaleString() || 0}</p>
          <p className="text-muted-foreground">Total Spent</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Latest Gigs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGigs.slice(0, 4).map((gig: any) => (
                  <Link key={gig.id} href={`/client/my-jobs/${gig.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50">
                      <div>
                        <p className="font-medium">{gig.title}</p>
                        <p className="text-sm text-muted-foreground">{new Date(gig.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-600">{gig.budget?.toLocaleString()} ETB</p>
                        <StatusBadge status={gig.status} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action: any, i: number) => (
                <Button key={i} asChild variant="outline" className="w-full justify-start">
                  <Link href={action.href}>
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}