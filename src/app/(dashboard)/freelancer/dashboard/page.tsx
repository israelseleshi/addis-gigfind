"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Briefcase, FileText, CheckCircle, Clock, ArrowRight, Search, Zap, Coins, Sparkles, TrendingUp, Target, Award, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getFreelancerDashboardStats, getRecentApplications, getRecommendedGigs } from '@/lib/actions/dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { WalletCard } from '@/components/wallet/wallet-card'
import { TransactionList } from '@/components/wallet/transaction-list'

interface DashboardStats {
  activeApplications: number
  pendingJobs: number
  completedJobs: number
  availableGigs: number
}

interface Application {
  id: string
  gig: string
  status: string
  applied: string
  budget: string
}

interface Gig {
  id: string
  title: string
  budget: string
  posted: string
  skills: string[]
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

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string }) {
  return (
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

const DESIGN_TEMPLATES = [
  { id: 'modern', name: 'Modern Cards' },
  { id: 'compact', name: 'Compact Grid' },
  { id: 'timeline', name: 'Activity Timeline' },
  { id: 'hero', name: 'Hero Focus' },
]

export default function FreelancerDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [recommendedGigs, setRecommendedGigs] = useState<Gig[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return
        
        const [statsData, applicationsData, gigsData] = await Promise.all([
          getFreelancerDashboardStats(user.id),
          getRecentApplications(user.id),
          getRecommendedGigs()
        ])
        
        console.log('Freelancer stats data:', statsData)
        setStats(statsData)
        setRecentApplications(applicationsData || [])
        setRecommendedGigs(gigsData || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const quickActions: QuickAction[] = [
    { icon: Search, label: 'Find Work', href: '/freelancer/find-work', color: 'from-orange-500 to-amber-500' },
    { icon: FileText, label: 'My Applications', href: '/freelancer/my-applications', color: 'from-blue-500 to-cyan-500' },
    { icon: CheckCircle, label: 'Active Jobs', href: '/freelancer/active-jobs', color: 'from-green-500 to-emerald-500' },
    { icon: Zap, label: 'Profile Boost', href: '/freelancer/profile/edit', color: 'from-purple-500 to-pink-500' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-48 w-full" />
            </div>
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
      </div>
    )
  }

  const renderDesign = () => {
    return <FreelancerDesignHero { ...{ stats, recentApplications, recommendedGigs, quickActions } } />
  }

  return (
    <div className="space-y-6">
      {renderDesign()}
    </div>
  )
}

function FreelancerDesignModern({ stats, recentApplications, recommendedGigs, quickActions }: any) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900">
          Freelancer Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Find work and manage your applications.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WalletCard />
            <div className="mt-4">
              <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                <Link href="/freelancer/buy-coins">
                  <Coins className="w-4 h-4 mr-2" />
                  Buy More Coins
                </Link>
              </Button>
            </div>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionList />
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg sm:text-xl">Your Recent Applications</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Track the status of your job applications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/freelancer/my-applications">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentApplications.slice(0, 3).map((app: Application) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 truncate">{app.gig}</p>
                      <p className="text-xs text-muted-foreground">{app.applied}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm font-medium text-zinc-600">{app.budget}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-zinc-100 text-zinc-700'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
                {recentApplications.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No applications yet. Start applying!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

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

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg sm:text-xl">Recommended Gigs</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Handpicked opportunities for you</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/freelancer/find-work">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedGigs.slice(0, 6).map((gig: Gig) => (
                <Link key={gig.id} href={`/freelancer/find-work/${gig.id}`}>
                  <div className="p-4 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors border border-zinc-100">
                    <p className="font-medium text-zinc-900 line-clamp-2">{gig.title}</p>
                    <p className="text-sm font-semibold text-amber-600 mt-2">{gig.budget}</p>
                    <p className="text-xs text-muted-foreground mt-1">{gig.posted}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {gig.skills?.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

function FreelancerDesignCompact({ stats, recentApplications, quickActions }: any) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Overview</p>
          </div>
          <div className="flex gap-2">
            {quickActions.slice(0, 2).map((action: any, i: number) => (
              <Button key={i} asChild variant="outline" size="sm">
                <Link href={action.href}>
                  <action.icon className="w-4 h-4 mr-1" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500 rounded-lg">
              <FileText className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats?.activeApplications || 0}</p>
              <p className="text-xs text-muted-foreground">Applications</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500 rounded-lg">
              <Clock className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats?.pendingJobs || 0}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
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
        <Card className="p-3 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500 rounded-lg">
              <Briefcase className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats?.availableGigs || 0}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            {recentApplications.slice(0, 4).map((app: any) => (
              <div key={app.id} className="flex justify-between text-xs">
                <span className="truncate">{app.gig}</span>
                <span className={`px-1.5 py-0.5 rounded ${app.status === 'pending' ? 'bg-amber-100' : app.status === 'accepted' ? 'bg-green-100' : 'bg-zinc-100'}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold">Wallet</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <WalletCard />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function FreelancerDesignTimeline({ stats, recentApplications, recommendedGigs, quickActions }: any) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      <motion.div variants={itemVariants} className="text-center py-8 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl">
        <h1 className="text-2xl font-bold text-zinc-900">Welcome Back!</h1>
        <p className="text-muted-foreground mt-1">Here's your activity timeline</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <div className="space-y-3">
            {recentApplications.slice(0, 5).map((app: any, i: number) => (
              <motion.div 
                key={app.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white rounded-xl border shadow-sm"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  app.status === 'pending' ? 'bg-amber-100' :
                  app.status === 'accepted' ? 'bg-green-100' :
                  'bg-zinc-100'
                }`}>
                  {app.status === 'pending' ? <Clock className="w-5 h-5 text-amber-600" /> :
                   app.status === 'accepted' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                   <FileText className="w-5 h-5 text-zinc-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{app.gig}</p>
                  <p className="text-sm text-muted-foreground">{app.applied}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  'bg-zinc-100 text-zinc-700'
                }`}>
                  {app.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <div className="text-center">
              <Coins className="w-8 h-8 mx-auto mb-2" />
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm opacity-80">Coins Available</p>
              <Button asChild variant="secondary" size="sm" className="mt-3 w-full">
                <Link href="/freelancer/buy-coins">Buy More</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action: QuickAction, i: number) => (
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

function FreelancerDesignHero({ stats, recentApplications, recommendedGigs, quickActions }: any) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8">
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Gig</h1>
          <p className="text-zinc-300 mb-6">Browse available opportunities and start earning</p>
          <div className="flex gap-3">
            <Button asChild className="bg-amber-500 hover:bg-amber-600">
              <Link href="/freelancer/find-work">
                <Search className="w-4 h-4 mr-2" />
                Browse Gigs
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Latest Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendedGigs.slice(0, 4).map((gig: any) => (
                  <Link key={gig.id} href={`/freelancer/find-work/${gig.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50">
                      <div>
                        <p className="font-medium">{gig.title}</p>
                        <p className="text-sm text-muted-foreground">{gig.posted}</p>
                      </div>
                      <p className="font-semibold text-amber-600">{gig.budget}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <WalletCard />
          <Button asChild className="w-full mt-3 bg-amber-600">
            <Link href="/freelancer/buy-coins">Buy Coins</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}